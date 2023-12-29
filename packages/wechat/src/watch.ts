import type {
  Ref,
  ComputedRef,
  EffectScheduler,
  DebuggerOptions,
} from '@vue/reactivity'
import {
  isRef,
  ReactiveEffect,
  isReactive,
  ReactiveFlags,
} from '@vue/reactivity'
import type { SchedulerJob } from './scheduler'
import { queueJob } from './scheduler'
import { getCurrentInstance } from './instance'
import {
  isArray,
  isObject,
  isPlainObject,
  isFunction,
  hasChanged,
  remove,
  isMap,
  isSet,
} from './utils'

export type WatchEffect = (onInvalidate: InvalidateCbRegistrator) => void

export type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T)

export type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onInvalidate: InvalidateCbRegistrator,
) => any

type MapSources<T, Immediate> = {
  [K in keyof T]: T[K] extends WatchSource<infer V> ?
    Immediate extends true ?
      V | undefined
    : V
  : T[K] extends object ?
    Immediate extends true ?
      T[K] | undefined
    : T[K]
  : never
}

type InvalidateCbRegistrator = (cb: () => void) => void

export interface WatchOptionsBase extends DebuggerOptions {
  flush?: 'pre' | 'post' | 'sync'
}

export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
  immediate?: Immediate
  deep?: boolean
}

export type WatchStopHandle = () => void

// Simple effect.
export function watchEffect(
  effect: WatchEffect,
  options?: WatchOptionsBase,
): WatchStopHandle {
  return doWatch(effect, null, options)
}

export function watchPostEffect(
  effect: WatchEffect,
  options?: DebuggerOptions,
) {
  return doWatch(
    effect,
    null,
    (__DEV__ ?
      Object.assign(options || {}, { flush: 'post' })
    : /* istanbul ignore next */ { flush: 'post' }) as WatchOptionsBase,
  )
}

export function watchSyncEffect(
  effect: WatchEffect,
  options?: DebuggerOptions,
) {
  return doWatch(
    effect,
    null,
    (__DEV__ ?
      Object.assign(options || {}, { flush: 'sync' })
    : /* istanbul ignore next */ { flush: 'sync' }) as WatchOptionsBase,
  )
}

// Initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {}

type MultiWatchSources = Array<WatchSource<unknown> | object>

// Overload: array of multiple sources + cb
export function watch<
  T extends MultiWatchSources,
  Immediate extends Readonly<boolean> = false,
>(
  sources: [...T],
  cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchStopHandle

// Overload: multiple sources w/ `as const`
// watch([foo, bar] as const, () => {})
// somehow [...T] breaks when the type is readonly
export function watch<
  T extends Readonly<MultiWatchSources>,
  Immediate extends Readonly<boolean> = false,
>(
  source: T,
  cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchStopHandle

// Overload: single source + cb
export function watch<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>,
): WatchStopHandle

// Overload: watching reactive object w/ cb
export function watch<
  T extends object,
  Immediate extends Readonly<boolean> = false,
>(
  source: T,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>,
): WatchStopHandle

// Implementation
export function watch<T = any, Immediate extends Readonly<boolean> = false>(
  source: T | WatchSource<T>,
  cb: any,
  options?: WatchOptions<Immediate>,
): WatchStopHandle {
  if (__DEV__ && !isFunction(cb)) {
    console.warn(
      `\`watch(fn, options?)\` signature has been moved to a separate API. ` +
        `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
        `supports \`watch(source, cb, options?) signature.`,
    )
  }

  return doWatch(source as any, cb, options)
}

function doWatch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb: WatchCallback | null,
  { immediate, deep, flush, onTrack, onTrigger }: WatchOptions = {},
): WatchStopHandle {
  if (__DEV__ && !cb) {
    if (immediate !== undefined) {
      console.warn(
        `watch() "immediate" option is only respected when using the ` +
          `watch(source, callback, options?) signature.`,
      )
    }

    if (deep !== undefined) {
      console.warn(
        `watch() "deep" option is only respected when using the ` +
          `watch(source, callback, options?) signature.`,
      )
    }
  }

  const warnInvalidSource = (s: unknown) => {
    console.warn(
      `Invalid watch source:`,
      s,
      `A watch source can only be a getter/effect function, a ref, ` +
        `a reactive object, or an array of these types.`,
    )
  }

  let getter: () => any
  let forceTrigger = false
  let isMultiSource = false

  if (isRef(source)) {
    getter = () => source.value
    // @ts-expect-error
    forceTrigger = Boolean(source._shallow)
  } else if (isReactive(source)) {
    getter = () => source
    deep = true
  } else if (isArray(source)) {
    isMultiSource = true
    forceTrigger = source.some((s) => isReactive(s))
    getter = () =>
      source.map((s) => {
        if (isRef(s)) {
          return s.value
        }

        if (isReactive(s)) {
          return traverse(s)
        }

        if (isFunction(s)) {
          return s()
        }

        /* istanbul ignore else  */
        if (__DEV__) {
          warnInvalidSource(s)
        }

        return undefined
      })
  } else if (isFunction(source)) {
    if (cb) {
      // Getter with cb
      getter = () => (source as () => any)()
    } else {
      // No cb -> simple effect
      getter = () => {
        if (cleanup) {
          cleanup()
        }

        return source(onInvalidate)
      }
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    getter = () => {}
    /* istanbul ignore else  */
    if (__DEV__) {
      warnInvalidSource(source)
    }
  }

  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let cleanup: () => void
  const onInvalidate: InvalidateCbRegistrator = (fn: () => void) => {
    // eslint-disable-next-line no-multi-assign
    cleanup = effect.onStop = () => {
      fn()
    }
  }

  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE
  const job: SchedulerJob = () => {
    if (!effect.active) {
      return
    }

    if (cb) {
      // Watch(source, cb)
      const newValue = effect.run()
      if (
        deep ||
        forceTrigger ||
        (isMultiSource ?
          (newValue as any[]).some((v, i) =>
            hasChanged(v, (oldValue as any[])[i]),
          )
        : hasChanged(newValue, oldValue))
      ) {
        // Cleanup before running cb again
        if (cleanup) {
          cleanup()
        }

        cb(
          newValue,
          // Pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
          onInvalidate,
        )
        oldValue = newValue
      }
    } else {
      // WatchEffect
      effect.run()
    }
  }

  // Important: mark the job as a watcher callback so that scheduler knows
  // it is allowed to self-trigger
  job.allowRecurse = Boolean(cb)

  let scheduler: EffectScheduler
  if (flush === 'sync') {
    scheduler = job as any // The scheduler function gets called directly
  } else {
    scheduler = () => {
      queueJob(job)
    }
  }

  const effect = new ReactiveEffect(getter, scheduler)

  /* istanbul ignore else */
  if (__DEV__) {
    effect.onTrack = onTrack
    effect.onTrigger = onTrigger
  }

  // Initial run
  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  const instance = getCurrentInstance()
  return () => {
    effect.stop()
    if (instance && instance.__scope__) {
      remove(instance.__scope__.effects, effect)
    }
  }
}

function traverse(value: unknown, seen?: Set<unknown>): unknown {
  if (!isObject(value) || (value as any)[ReactiveFlags.SKIP]) {
    return value
  }

  seen = seen || new Set()
  if (seen.has(value)) {
    return value
  }

  seen.add(value)
  /* istanbul ignore else  */
  if (isRef(value)) {
    traverse(value.value, seen)
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, seen)
    })
  } else if (isPlainObject(value)) {
    // eslint-disable-next-line guard-for-in
    for (const key in value) {
      traverse(value[key], seen)
    }
  }

  return value
}
