import { NOOP } from './utils'

export enum SchedulerJobFlags {
  QUEUED = 1 << 0,
  ALLOW_RECURSE = 1 << 2,
}

export interface SchedulerJob extends Function {
  /**
   * Flags can technically be undefined, but it can still be used in bitwise
   * operations just like 0.
   */
  flags?: SchedulerJobFlags
}

const queue: SchedulerJob[] = []
let flushIndex = -1

const pendingPostFlushCbs: SchedulerJob[] = []
let activePostFlushCbs: SchedulerJob[] | null = null
let postFlushIndex = 0

const resolvedPromise = /*@__PURE__*/ Promise.resolve()
let currentFlushPromise: Promise<void> | null = null

const RECURSION_LIMIT = 100
type CountMap = Map<SchedulerJob, number>

export function nextTick(): Promise<void>
export function nextTick<R>(fn: () => R | Promise<R>): Promise<R>
export function nextTick<R>(fn?: () => R | Promise<R>): Promise<void | R> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(fn) : p
}

export function queueJob(job: SchedulerJob): void {
  if (!(job.flags! & SchedulerJobFlags.QUEUED)) {
    queue.push(job)
    job.flags! |= SchedulerJobFlags.QUEUED
    queueFlush()
  }
}

function queueFlush(): void {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

export function queuePostFlushCb(cb: SchedulerJob): void {
  if (!(cb.flags! & SchedulerJobFlags.QUEUED)) {
    pendingPostFlushCbs.push(cb)
    cb.flags! |= SchedulerJobFlags.QUEUED
  }
}

export function flushPostFlushCbs(): void {
  if (pendingPostFlushCbs.length > 0) {
    activePostFlushCbs = [...new Set(pendingPostFlushCbs)]
    pendingPostFlushCbs.length = 0

    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      const cb = activePostFlushCbs[postFlushIndex]
      if (cb.flags! & SchedulerJobFlags.ALLOW_RECURSE) {
        cb.flags! &= ~SchedulerJobFlags.QUEUED
      }

      cb()
      cb.flags! &= ~SchedulerJobFlags.QUEUED
    }

    activePostFlushCbs = null
    postFlushIndex = 0
  }
}

function flushJobs(): void {
  const seen: CountMap | undefined =
    __DEV__ ? new Map() : /* istanbul ignore next -- @preserve  */ undefined

  // Conditional usage of checkRecursiveUpdate must be determined out of
  // try ... catch block since Rollup by default de-optimizes treeshaking
  // inside try-catch. This can leave all warning code unshaked. Although
  // they would get eventually shaken by a minifier like terser, some minifiers
  // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
  const check =
    __DEV__ ?
      (job: SchedulerJob) => checkRecursiveUpdates(seen!, job)
    : /* istanbul ignore next -- @preserve  */ NOOP

  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      /* istanbul ignore if -- @preserve  */
      if (__DEV__ && check(job)) {
        continue
      }

      if (job.flags! & SchedulerJobFlags.ALLOW_RECURSE) {
        job.flags! &= ~SchedulerJobFlags.QUEUED
      }

      job()
      if (!(job.flags! & SchedulerJobFlags.ALLOW_RECURSE)) {
        job.flags! &= ~SchedulerJobFlags.QUEUED
      }
    }
  } finally {
    // If there was an error we still need to clear the QUEUED flags
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      job.flags! &= ~SchedulerJobFlags.QUEUED
    }

    flushIndex = -1
    queue.length = 0

    currentFlushPromise = null
  }
}

function checkRecursiveUpdates(seen: CountMap, fn: SchedulerJob): boolean {
  const count = seen.get(fn) || 0
  /* istanbul ignore if -- @preserve */
  if (count > RECURSION_LIMIT) {
    console.warn(
      `Maximum recursive updates exceeded. ` +
        `This means you have a reactive effect that is mutating its own ` +
        `dependencies and thus recursively triggering itself.`,
    )
    return true
  }

  seen.set(fn, count + 1)
  return false
}
