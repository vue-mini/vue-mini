import type {
  DebuggerEvent,
  WatchOptions,
  UnwrapRef,
  EffectScope,
  ComputedRef,
} from '@vue-mini/core'
import {
  watch,
  inject,
  reactive,
  markRaw,
  isRef,
  isReactive,
  effectScope,
  toRaw,
  nextTick,
} from '@vue-mini/core'
import type {
  StateTree,
  SubscriptionCallback,
  _DeepPartial,
  Store,
  _Method,
  StoreDefinition,
  _GettersTree,
  StoreOnActionListener,
  _ActionsTree,
  SubscriptionCallbackMutation,
  DefineSetupStoreOptions,
  DefineStoreOptionsInPlugin,
  StoreGeneric,
  _StoreWithGetters,
  _ExtractActionsFromSetupStore,
  _ExtractGettersFromSetupStore,
  _ExtractStateFromSetupStore,
  _StoreWithState,
} from './types'
import {
  isPlainObject,
  MutationType,
  _StoreWithGetters_Readonly,
  _StoreWithGetters_Writable,
} from './types'
import type { Pinia } from './root-store'
import { piniaSymbol } from './root-store'
import { addSubscription, triggerSubscriptions, noop } from './subscriptions'

type _ArrayType<AT> = AT extends Array<infer T> ? T : never

/**
 * Marks a function as an action for `$onAction`
 * @internal
 */
// eslint-disable-next-line symbol-description
const ACTION_MARKER = Symbol()
/**
 * Action name symbol. Allows to add a name to an action after defining it
 * @internal
 */
// eslint-disable-next-line symbol-description
const ACTION_NAME = Symbol()
/**
 * Function type extended with action markers
 * @internal
 */
interface MarkedAction<Fn extends _Method = _Method> {
  (...args: Parameters<Fn>): ReturnType<Fn>
  [ACTION_MARKER]: boolean
  [ACTION_NAME]: string
}

function mergeReactiveObjects<
  T extends Record<any, unknown> | Map<unknown, unknown> | Set<unknown>,
>(target: T, patchToApply: _DeepPartial<T>): T {
  // Handle Map instances
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value))
  } else if (target instanceof Set && patchToApply instanceof Set) {
    // Handle Set instances
    patchToApply.forEach((value) => target.add(value))
  }

  // No need to go through symbols because they cannot be serialized anyway
  for (const key in patchToApply) {
    // eslint-disable-next-line no-prototype-builtins
    if (!patchToApply.hasOwnProperty(key)) continue
    const subPatch = patchToApply[key]
    const targetValue = target[key]
    if (
      isPlainObject(targetValue) &&
      isPlainObject(subPatch) &&
      // eslint-disable-next-line no-prototype-builtins
      target.hasOwnProperty(key) &&
      !isRef(subPatch) &&
      !isReactive(subPatch)
    ) {
      // NOTE: here I wanted to warn about inconsistent types but it's not possible because in setup stores one might
      // start the value of a property as a certain type e.g. a Map, and then for some reason, during SSR, change that
      // to `undefined`. When trying to hydrate, we want to override the Map with `undefined`.
      target[key] = mergeReactiveObjects(targetValue, subPatch)
    } else {
      // @ts-expect-error: subPatch is a valid value
      target[key] = subPatch
    }
  }

  return target
}

const { assign } = Object

function isComputed<T>(value: ComputedRef<T> | unknown): value is ComputedRef<T>
function isComputed(o: any): o is ComputedRef {
  return Boolean(isRef(o) && (o as any).effect)
}

function createSetupStore<
  Id extends string,
  SS extends Record<any, unknown>,
  S extends StateTree,
  G extends Record<string, _Method>,
  A extends _ActionsTree,
>(
  $id: Id,
  setup: (helpers: SetupStoreHelpers) => SS,
  // eslint-disable-next-line @typescript-eslint/default-param-last
  options: DefineSetupStoreOptions<Id, S, G, A> = {},
  pinia: Pinia,
): Store<Id, S, G, A> {
  let scope!: EffectScope

  // eslint-disable-next-line prefer-object-spread
  const optionsForPlugin: DefineStoreOptionsInPlugin<Id, S, G, A> = assign(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    { actions: {} as A },
    options,
  )

  /* istanbul ignore if */
  if (__DEV__ && !pinia._e.active) {
    throw new Error('Pinia destroyed')
  }

  // Watcher options for $subscribe
  const $subscribeOptions: WatchOptions = { deep: true }
  /* istanbul ignore else */
  if (__DEV__) {
    $subscribeOptions.onTrigger = (event) => {
      /* istanbul ignore else */
      if (isListening) {
        debuggerEvents = event
        // Avoid triggering this while the store is being built and the state is being set in pinia
      } else {
        // Let patch send all the events together later
        /* istanbul ignore else */
        // eslint-disable-next-line no-lonely-if
        if (Array.isArray(debuggerEvents)) {
          debuggerEvents.push(event)
        } else {
          console.error(
            '🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.',
          )
        }
      }
    }
  }

  // Internal state
  let isListening: boolean // Set to true at the end
  let isSyncListening: boolean // Set to true at the end
  let subscriptions: Array<SubscriptionCallback<S>> = []
  let actionSubscriptions: Array<StoreOnActionListener<Id, S, G, A>> = []
  let debuggerEvents: DebuggerEvent[] | DebuggerEvent
  const initialState = pinia.state.value[$id] as UnwrapRef<S> | undefined

  // Avoid setting the state for option stores if it is set
  // by the setup
  if (!initialState) {
    pinia.state.value[$id] = {}
  }

  // Avoid triggering too many listeners
  // https://github.com/vuejs/pinia/issues/1129
  let activeListener: Symbol | undefined
  function $patch(stateMutation: (state: UnwrapRef<S>) => void): void
  function $patch(partialState: _DeepPartial<UnwrapRef<S>>): void
  function $patch(
    partialStateOrMutator:
      | _DeepPartial<UnwrapRef<S>>
      | ((state: UnwrapRef<S>) => void),
  ): void {
    let subscriptionMutation: SubscriptionCallbackMutation<S>
    // eslint-disable-next-line no-multi-assign
    isListening = isSyncListening = false
    // Reset the debugger events since patches are sync
    /* istanbul ignore else */
    if (__DEV__) {
      debuggerEvents = []
    }

    if (typeof partialStateOrMutator === 'function') {
      partialStateOrMutator(pinia.state.value[$id] as UnwrapRef<S>)
      subscriptionMutation = {
        type: MutationType.patchFunction,
        storeId: $id,
        events: debuggerEvents as DebuggerEvent[],
      }
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator)
      subscriptionMutation = {
        type: MutationType.patchObject,
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents as DebuggerEvent[],
      }
    }

    // eslint-disable-next-line no-multi-assign, symbol-description
    const myListenerId = (activeListener = Symbol())
    // eslint-disable-next-line @typescript-eslint/no-floating-promises, promise/prefer-await-to-then
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true
      }
    })
    isSyncListening = true
    // Because we paused the watcher, we need to manually call the subscriptions
    triggerSubscriptions(
      subscriptions,
      subscriptionMutation,
      pinia.state.value[$id] as UnwrapRef<S>,
    )
  }

  const $reset =
    /* istanbul ignore next */
    __DEV__ ?
      () => {
        throw new Error(
          `🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`,
        )
      }
    : noop

  function $dispose() {
    scope.stop()
    subscriptions = []
    actionSubscriptions = []
    pinia._s.delete($id)
  }

  /**
   * Helper that wraps function so it can be tracked with $onAction
   * @param fn - action to wrap
   * @param name - name of the action
   */
  const action = <Fn extends _Method>(fn: Fn, name = ''): Fn => {
    if (ACTION_MARKER in fn) {
      // We ensure the name is set from the returned function
      ;(fn as unknown as MarkedAction<Fn>)[ACTION_NAME] = name
      return fn
    }

    const wrappedAction = function (this: any) {
      // eslint-disable-next-line unicorn/prefer-spread, prefer-rest-params
      const args = Array.from(arguments)

      const afterCallbackList: Array<(resolvedReturn: any) => any> = []
      const onErrorCallbackList: Array<(error: unknown) => unknown> = []
      function after(callback: _ArrayType<typeof afterCallbackList>) {
        afterCallbackList.push(callback)
      }

      function onError(callback: _ArrayType<typeof onErrorCallbackList>) {
        onErrorCallbackList.push(callback)
      }

      // @ts-expect-error
      triggerSubscriptions(actionSubscriptions, {
        args,
        name: wrappedAction[ACTION_NAME],
        store,
        after,
        onError,
      })

      let ret: unknown
      try {
        ret = fn.apply(this && this.$id === $id ? this : store, args)
        // Handle sync errors
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error)
        throw error
      }

      if (ret instanceof Promise) {
        return (
          ret
            // eslint-disable-next-line promise/prefer-await-to-then
            .then((value) => {
              triggerSubscriptions(afterCallbackList, value)
              return value
            })
            // eslint-disable-next-line promise/prefer-await-to-then
            .catch((error: unknown) => {
              triggerSubscriptions(onErrorCallbackList, error)
              throw error
            })
        )
      }

      // Trigger after callbacks
      triggerSubscriptions(afterCallbackList, ret)
      return ret
    } as MarkedAction<Fn>

    wrappedAction[ACTION_MARKER] = true
    wrappedAction[ACTION_NAME] = name // Will be set later

    // @ts-expect-error: we are intentionally limiting the returned type to just Fn
    // because all the added properties are internals that are exposed through `$onAction()` only
    return wrappedAction
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const partialStore = {
    _p: pinia,
    // _s: scope,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options = {}) {
      const removeSubscription = addSubscription(
        subscriptions,
        callback,
        options.detached,
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        () => stopWatcher(),
      )
      const stopWatcher = scope.run(() =>
        watch(
          () => pinia.state.value[$id] as UnwrapRef<S>,
          (state) => {
            if (options.flush === 'sync' ? isSyncListening : isListening) {
              callback(
                {
                  storeId: $id,
                  type: MutationType.direct,
                  events: debuggerEvents as DebuggerEvent,
                },
                state,
              )
            }
          },
          // eslint-disable-next-line prefer-object-spread
          assign({}, $subscribeOptions, options),
        ),
      )!

      return removeSubscription
    },
    $dispose,
  } as _StoreWithState<Id, S, G, A>

  const store: Store<Id, S, G, A> = reactive(
    __DEV__ ?
      // eslint-disable-next-line prefer-object-spread
      assign(
        {
          _customProperties: markRaw(new Set<string>()), // Devtools custom properties
        },
        partialStore,
        // Must be added later
        // setupStore
      )
    : partialStore,
  ) as unknown as Store<Id, S, G, A>

  // Store the partial store now so the setup of stores can instantiate each other before they are finished without
  // creating infinite loops.
  pinia._s.set($id, store as Store)

  const setupStore = pinia._e.run(
    // eslint-disable-next-line no-return-assign
    () => (scope = effectScope()).run(() => setup({ action }))!,
  )!

  // Overwrite existing actions to support $onAction
  // eslint-disable-next-line guard-for-in
  for (const key in setupStore) {
    const prop = setupStore[key]

    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      // Transfer the ref to the pinia state to keep everything in sync
      /* istanbul ignore if */
      pinia.state.value[$id][key] = prop
    } else if (typeof prop === 'function') {
      const actionValue = action(prop as _Method, key)
      // This a hot module replacement store because the hotUpdate method needs
      // to do it with the right context
      // @ts-expect-error
      setupStore[key] = actionValue

      // List actions so they can be used in plugins
      // @ts-expect-error
      optionsForPlugin.actions[key] = prop
    } else if (__DEV__) {
      // Add getters for devtools
      // eslint-disable-next-line unicorn/no-lonely-if
      if (isComputed(prop)) {
        const getters: string[] =
          (setupStore._getters as string[]) ||
          // @ts-expect-error: same
          ((setupStore._getters = markRaw([])) as string[])
        getters.push(key)
      }
    }
  }

  // Add the state, getters, and action properties
  assign(store, setupStore)
  // Allows retrieving reactive objects with `storeToRefs()`. Must be called after assigning to the reactive object.
  // Make `storeToRefs()` work with `reactive()` #799
  assign(toRaw(store), setupStore)

  // Use this instead of a computed with setter to be able to create it anywhere
  // without linking the computed lifespan to wherever the store is first
  // created.
  Object.defineProperty(store, '$state', {
    get: () => pinia.state.value[$id],
    // eslint-disable-next-line object-shorthand
    set: (state) => {
      $patch(($state) => {
        // @ts-expect-error: FIXME: shouldn't error?
        assign($state, state)
      })
    },
  })

  // Apply all plugins
  pinia._p.forEach((extender) => {
    assign(
      store,
      scope.run(() =>
        extender({
          store: store as Store,
          pinia,
          options: optionsForPlugin,
        }),
      )!,
    )
  })

  if (
    __DEV__ &&
    store.$state &&
    typeof store.$state === 'object' &&
    typeof store.$state.constructor === 'function' &&
    !store.$state.constructor.toString().includes('[native code]')
  ) {
    console.warn(
      `[🍍]: The "state" must be a plain object. It cannot be\n` +
        `\tstate: () => new MyClass()\n` +
        `Found in store "${store.$id}".`,
    )
  }

  isListening = true
  isSyncListening = true
  return store
}

/**
 * Extract the actions of a store type. Works with both a Setup Store or an
 * Options Store.
 */
export type StoreActions<SS> =
  SS extends Store<string, StateTree, _GettersTree<StateTree>, infer A> ? A
  : _ExtractActionsFromSetupStore<SS>

/**
 * Extract the getters of a store type. Works with both a Setup Store or an
 * Options Store.
 */
export type StoreGetters<SS> =
  SS extends Store<string, StateTree, infer G, _ActionsTree> ?
    _StoreWithGetters<G>
  : _ExtractGettersFromSetupStore<SS>

/**
 * Extract the state of a store type. Works with both a Setup Store or an
 * Options Store. Note this unwraps refs.
 */
export type StoreState<SS> =
  SS extends Store<string, infer S, _GettersTree<StateTree>, _ActionsTree> ?
    UnwrapRef<S>
  : _ExtractStateFromSetupStore<SS>

export interface SetupStoreHelpers {
  action: <Fn extends _Method>(fn: Fn) => Fn
}

/*! #__NO_SIDE_EFFECTS__ */
export function defineStore<Id extends string, SS extends Record<any, unknown>>(
  id: Id,
  setup: (helpers: SetupStoreHelpers) => SS,
  options?: DefineSetupStoreOptions<
    Id,
    _ExtractStateFromSetupStore<SS>,
    _ExtractGettersFromSetupStore<SS>,
    _ExtractActionsFromSetupStore<SS>
  >,
): StoreDefinition<
  Id,
  _ExtractStateFromSetupStore<SS>,
  _ExtractGettersFromSetupStore<SS>,
  _ExtractActionsFromSetupStore<SS>
> {
  function useStore() {
    const pinia = inject(piniaSymbol)!

    if (!pinia._s.has(id)) {
      createSetupStore(id, setup, options, pinia)

      /* istanbul ignore else */
      if (__DEV__) {
        // @ts-expect-error: not the right inferred type
        useStore._pinia = pinia
      }
    }

    const store: StoreGeneric = pinia._s.get(id)!

    // StoreGeneric cannot be casted towards Store
    return store as any
  }

  useStore.$id = id

  return useStore
}

/**
 * Return type of `defineStore()` with a setup function.
 * - `Id` is a string literal of the store's name
 * - `SS` is the return type of the setup function
 * @see {@link StoreDefinition}
 */
export interface SetupStoreDefinition<Id extends string, SS>
  extends StoreDefinition<
    Id,
    _ExtractStateFromSetupStore<SS>,
    _ExtractGettersFromSetupStore<SS>,
    _ExtractActionsFromSetupStore<SS>
  > {}
