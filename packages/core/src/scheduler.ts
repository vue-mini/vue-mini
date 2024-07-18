import { NOOP } from './utils'

export interface SchedulerJob extends Function {
  active?: boolean
  allowRecurse?: boolean
}

let isFlushing = false
let isFlushPending = false

const queue: SchedulerJob[] = []
let flushIndex = 0

const pendingPostFlushCbs: SchedulerJob[] = []
let activePostFlushCbs: SchedulerJob[] | null = null
let postFlushIndex = 0

// eslint-disable-next-line spaced-comment
const resolvedPromise = /*#__PURE__*/ Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null

const RECURSION_LIMIT = 100
type CountMap = Map<SchedulerJob, number>

export function nextTick<R = void>(fn?: () => R): Promise<Awaited<R>> {
  const p = currentFlushPromise || resolvedPromise
  // eslint-disable-next-line promise/prefer-await-to-then
  return fn ? p.then(fn) : p
}

export function queueJob(job: SchedulerJob) {
  // The dedupe search uses the startIndex argument of Array.includes()
  // by default the search index includes the current job that is being run
  // so it cannot recursively trigger itself again.
  // if the job is a watch() callback, the search will start with a +1 index to
  // allow it recursively trigger itself - it is the user's responsibility to
  // ensure it doesn't end up in an infinite loop.
  if (
    queue.length === 0 ||
    !queue.includes(
      job,
      isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex,
    )
  ) {
    queue.push(job)
    queueFlush()
  }
}

function queueFlush(): void {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    // eslint-disable-next-line promise/prefer-await-to-then
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

export function queuePostFlushCb(cb: SchedulerJob) {
  if (
    !activePostFlushCbs ||
    !activePostFlushCbs.includes(
      cb,
      cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex,
    )
  ) {
    pendingPostFlushCbs.push(cb)
  }
}

export function flushPostFlushCbs() {
  if (pendingPostFlushCbs.length > 0) {
    activePostFlushCbs = [...new Set(pendingPostFlushCbs)]
    pendingPostFlushCbs.length = 0

    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      const cb = activePostFlushCbs[postFlushIndex]
      if (cb.active !== false) cb()
    }

    activePostFlushCbs = null
    postFlushIndex = 0
  }
}

function flushJobs(seen?: CountMap): void {
  isFlushPending = false
  isFlushing = true
  /* istanbul ignore else -- @preserve  */
  if (__DEV__) {
    seen = seen || new Map()
  }

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
      if (job.active !== false) {
        /* istanbul ignore if -- @preserve  */
        if (__DEV__ && check(job)) {
          continue
        }

        job()
      }
    }
  } finally {
    flushIndex = 0
    queue.length = 0

    isFlushing = false
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
