/* eslint-disable no-prototype-builtins */
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
  isRef,
  isReactive,
  effectScope,
  toRaw,
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
  _StoreWithGetters,
  _ExtractActionsFromSetupStore,
  _ExtractGettersFromSetupStore,
  _ExtractStateFromSetupStore,
  _StoreWithState,
} from './types'
import { isPlainObject, MutationType } from './types'
import type { Pinia } from './root-store'
import { piniaSymbol } from './root-store'
import { addSubscription, triggerSubscriptions } from './subscriptions'

type _SetType<AT> = AT extends Set<infer T> ? T : never

/**
 * Marks a function as an action for `$onAction`
 * @internal
 */
const ACTION_MARKER = Symbol()
/**
 * Action name symbol. Allows to add a name to an action after defining it
 * @internal
 */
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

interface SetupStoreHelpers {
  action: <Fn extends _Method>(fn: Fn) => Fn
}

function mergeReactiveObjects<
  T extends Record<any, unknown> | Map<unknown, unknown> | Set<unknown>,
>(target: T, patchToApply: _DeepPartial<T>): T {
  // No need to go through symbols because they cannot be serialized anyway
  for (const key in patchToApply) {
    if (!patchToApply.hasOwnProperty(key)) continue
    const subPatch = patchToApply[key]
    const targetValue = target[key]
    if (
      isPlainObject(targetValue) &&
      isPlainObject(subPatch) &&
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

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
function isComputed<T>(value: ComputedRef<T> | unknown): value is ComputedRef<T>
function isComputed(o: any): o is ComputedRef {
  return Boolean(isRef(o) && (o as any).effect)
}

function createStore<
  Id extends string,
  SS extends Record<any, unknown>,
  S extends StateTree,
  G extends Record<string, _Method>,
  A extends _ActionsTree,
>(
  $id: Id,
  setup: (helpers: SetupStoreHelpers) => SS,
  options: DefineSetupStoreOptions<Id, S, G, A> = {},
  pinia: Pinia,
): void {
  let scope!: EffectScope

  const optionsForPlugin: DefineStoreOptionsInPlugin<Id, S, G, A> = assign(
    { actions: {} as A },
    options,
  )

  /* istanbul ignore if -- @preserve */
  if (__DEV__ && !pinia._e.active) {
    throw new Error('Pinia destroyed')
  }

  // Watcher options for $subscribe
  const $subscribeOptions: WatchOptions = { deep: true }
  /* istanbul ignore else -- @preserve */
  if (__DEV__) {
    $subscribeOptions.onTrigger = (event) => {
      if (isListening) {
        debuggerEvents = event
        // Avoid triggering this while the store is being built and the state is being set in pinia
      } else {
        // Let patch send all the events together later
        /* istanbul ignore else -- @preserve */
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
  let isListening = false // Set to true at the end.
  let shouldTrigger = false // The initial value does not matter, and no need to set to true at the end.
  const subscriptions = new Set<SubscriptionCallback<S>>()
  const actionSubscriptions = new Set<StoreOnActionListener<Id, S, G, A>>()
  let debuggerEvents: DebuggerEvent[] | DebuggerEvent
  const initialState = pinia.state.value[$id] as UnwrapRef<S> | undefined

  // Avoid setting the state for option stores if it is set
  // by the setup
  if (!initialState) {
    pinia.state.value[$id] = {}
  }

  function $patch(stateMutation: (state: UnwrapRef<S>) => void): void
  function $patch(partialState: _DeepPartial<UnwrapRef<S>>): void
  function $patch(
    partialStateOrMutator:
      | _DeepPartial<UnwrapRef<S>>
      | ((state: UnwrapRef<S>) => void),
  ): void {
    let subscriptionMutation: SubscriptionCallbackMutation<S>
    isListening = false
    // Reset the debugger events since patches are sync
    /* istanbul ignore else -- @preserve */
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

    isListening = true
    // Because we paused the watcher, we need to manually call the subscriptions
    triggerSubscriptions(
      subscriptions,
      subscriptionMutation,
      pinia.state.value[$id] as UnwrapRef<S>,
    )
  }

  function $dispose() {
    scope.stop()
    subscriptions.clear()
    actionSubscriptions.clear()
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

    const wrappedAction = function (...args) {
      const afterCallbackSet = new Set<(resolvedReturn: any) => any>()
      const onErrorCallbackSet = new Set<(error: unknown) => unknown>()
      function after(callback: _SetType<typeof afterCallbackSet>) {
        afterCallbackSet.add(callback)
      }

      function onError(callback: _SetType<typeof onErrorCallbackSet>) {
        onErrorCallbackSet.add(callback)
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
        ret = fn(...args)
        // Handle sync errors
      } catch (error) {
        triggerSubscriptions(onErrorCallbackSet, error)
        throw error
      }

      if (ret instanceof Promise) {
        return ret
          .then((value) => {
            triggerSubscriptions(afterCallbackSet, value)
            return value
          })
          .catch((error: unknown) => {
            triggerSubscriptions(onErrorCallbackSet, error)
            throw error
          })
      }

      // Trigger after callbacks
      triggerSubscriptions(afterCallbackSet, ret)
      return ret
    } as MarkedAction<Fn>

    wrappedAction[ACTION_MARKER] = true
    wrappedAction[ACTION_NAME] = name // Will be set later

    // @ts-expect-error: we are intentionally limiting the returned type to just Fn
    // because all the added properties are internals that are exposed through `$onAction()` only
    return wrappedAction
  }

  const partialStore = {
    _p: pinia,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $subscribe(callback, options = {}) {
      const removeSubscription = addSubscription(
        subscriptions,
        callback,
        options.detached,
        () => {
          stopWatcher()
        },
      )
      const stopWatcher = scope.run(() => {
        const stop1 = watch(
          () => pinia.state.value[$id],
          () => {
            shouldTrigger = isListening
          },
          { deep: true, flush: 'sync' },
        )

        const stop2 = watch(
          () => pinia.state.value[$id] as UnwrapRef<S>,
          (state) => {
            if (shouldTrigger) {
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
          assign({}, $subscribeOptions, options),
        )

        const stop = () => {
          stop1()
          stop2()
        }

        return stop
      })!

      return removeSubscription
    },
    $dispose,
  } as _StoreWithState<Id, S, G, A>

  const store: Store<Id, S, G, A> = reactive(partialStore) as unknown as Store<
    Id,
    S,
    G,
    A
  >

  // Store the partial store now so the setup of stores can instantiate each other before they are finished without
  // creating infinite loops.
  pinia._s.set($id, store as Store)

  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    return scope.run(() => setup({ action }))
  })!

  // Overwrite existing actions to support $onAction
  for (const key in setupStore) {
    const prop = setupStore[key]

    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      // Transfer the ref to the pinia state to keep everything in sync
      pinia.state.value[$id][key] = prop
    } else if (typeof prop === 'function') {
      const actionValue = action(prop as _Method, key)
      // @ts-expect-error
      setupStore[key] = actionValue

      // List actions so they can be used in plugins
      // @ts-expect-error
      optionsForPlugin.actions[key] = prop
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
    get() {
      return pinia.state.value[$id]
    },
    set(state) {
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

  isListening = true
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
      createStore(id, setup, options, pinia)

      /* istanbul ignore else -- @preserve */
      if (__DEV__) {
        // @ts-expect-error: not the right inferred type
        useStore._pinia = pinia
      }
    }

    const store = pinia._s.get(id)!

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
