import type {
  WatchOptions as BaseWatchOptions,
  DebuggerOptions,
  ReactiveMarker,
  WatchCallback,
  WatchEffect,
  WatchHandle,
  WatchSource,
} from '@vue/reactivity'
import { EffectFlags, WatcherEffect } from '@vue/reactivity'
import type { SchedulerJob } from './scheduler'
import { SchedulerJobFlags, queueJob, queuePostFlushCb } from './scheduler'
import { EMPTY_OBJ, extend, isFunction } from './utils'

export type {
  WatchHandle,
  WatchStopHandle,
  WatchEffect,
  WatchSource,
  WatchCallback,
  OnCleanup,
} from '@vue/reactivity'

type MaybeUndefined<T, I> = I extends true ? T | undefined : T

type MapSources<T, Immediate> = {
  [K in keyof T]: T[K] extends WatchSource<infer V> ?
    MaybeUndefined<V, Immediate>
  : T[K] extends object ? MaybeUndefined<T[K], Immediate>
  : never
}

export interface WatchEffectOptions extends DebuggerOptions {
  flush?: 'pre' | 'post' | 'sync'
}

export interface WatchOptions<Immediate = boolean> extends WatchEffectOptions {
  immediate?: Immediate
  deep?: boolean | number
  once?: boolean
}

// Simple effect.
export function watchEffect(
  effect: WatchEffect,
  options?: WatchEffectOptions,
): WatchHandle {
  return doWatch(effect, null, options)
}

export function watchPostEffect(
  effect: WatchEffect,
  options?: DebuggerOptions,
): WatchHandle {
  return doWatch(
    effect,
    null,
    __DEV__ ?
      extend({}, options as WatchEffectOptions, { flush: 'post' })
    : /* istanbul ignore next -- @preserve */ { flush: 'post' },
  )
}

export function watchSyncEffect(
  effect: WatchEffect,
  options?: DebuggerOptions,
): WatchHandle {
  return doWatch(
    effect,
    null,
    __DEV__ ?
      extend({}, options as WatchEffectOptions, { flush: 'sync' })
    : /* istanbul ignore next -- @preserve */ { flush: 'sync' },
  )
}

export type MultiWatchSources = Array<WatchSource<unknown> | object>

// Overload: single source + cb
export function watch<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, MaybeUndefined<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchHandle

// Overload: reactive array or tuple of multiple sources + cb
export function watch<
  T extends Readonly<MultiWatchSources>,
  Immediate extends Readonly<boolean> = false,
>(
  sources: readonly [...T] | T,
  cb: [T] extends [ReactiveMarker] ?
    WatchCallback<T, MaybeUndefined<T, Immediate>>
  : WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchHandle

// Overload: array of multiple sources + cb
export function watch<
  T extends MultiWatchSources,
  Immediate extends Readonly<boolean> = false,
>(
  sources: [...T],
  cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchHandle

// Overload: watching reactive object w/ cb
export function watch<
  T extends object,
  Immediate extends Readonly<boolean> = false,
>(
  source: T,
  cb: WatchCallback<T, MaybeUndefined<T, Immediate>>,
  options?: WatchOptions<Immediate>,
): WatchHandle

// Implementation
export function watch<T = any, Immediate extends Readonly<boolean> = false>(
  source: T | WatchSource<T>,
  cb: WatchCallback,
  options?: WatchOptions<Immediate>,
): WatchHandle {
  if (__DEV__ && !isFunction(cb)) {
    console.warn(
      `\`watch(fn, options?)\` signature has been moved to a separate API. ` +
        `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
        `supports \`watch(source, cb, options?) signature.`,
    )
  }

  return doWatch(source as any, cb, options)
}

class RenderWatcherEffect extends WatcherEffect {
  job: SchedulerJob

  constructor(
    source: WatchSource | WatchSource[] | WatchEffect | object,
    cb: WatchCallback | null,
    options: BaseWatchOptions,
    private flush: 'pre' | 'post' | 'sync',
  ) {
    super(source, cb, options)

    const job: SchedulerJob = () => {
      if (this.dirty) {
        this.run()
      }
    }
    // Important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger (#1727)
    if (cb) {
      this.flags |= EffectFlags.ALLOW_RECURSE
      job.flags! |= SchedulerJobFlags.ALLOW_RECURSE
    }
    this.job = job
  }

  notify(): void {
    const flags = this.flags
    if (!(flags & EffectFlags.PAUSED)) {
      const flush = this.flush
      const job = this.job
      if (flush === 'post') {
        queuePostFlushCb(job)
      } else if (flush === 'pre') {
        queueJob(job)
      } else {
        job()
      }
    }
  }
}

function doWatch(
  source: WatchSource | WatchSource[] | WatchEffect | object,
  cb: WatchCallback | null,
  options: WatchOptions = EMPTY_OBJ,
): WatchHandle {
  const { immediate, deep, flush = 'pre', once } = options

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

    if (once !== undefined) {
      console.warn(
        `watch() "once" option is only respected when using the ` +
          `watch(source, callback, options?) signature.`,
      )
    }
  }

  const baseWatchOptions: BaseWatchOptions = extend({}, options)

  const effect = new RenderWatcherEffect(source, cb, baseWatchOptions, flush)

  // Initial run
  if (cb) {
    effect.run(true)
  } else if (flush === 'post') {
    queuePostFlushCb(effect.job)
  } else {
    effect.run(true)
  }

  const stop = effect.stop.bind(effect) as WatchHandle
  stop.pause = effect.pause.bind(effect)
  stop.resume = effect.resume.bind(effect)
  stop.stop = stop

  return stop
}
