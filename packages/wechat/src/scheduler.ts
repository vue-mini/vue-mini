export interface SchedulerJob {
  /**
   * Indicates this is a watch() callback and is allowed to trigger itself.
   * A watch callback doesn't track its dependencies so if it triggers itself
   * again, it's likely intentional and it is the user's responsibility to
   * perform recursive state mutation that eventually stabilizes.
   */
  cb?: boolean
  (): void
}

const queue: SchedulerJob[] = []
const resolvedPromise: Promise<any> = Promise.resolve()
let currentFlushPromise: Promise<void> | null = null

let isFlushing = false
let isFlushPending = false
let flushIndex = 0

const RECURSION_LIMIT = 100
type CountMap = Map<SchedulerJob | Function, number>

export function nextTick(fn?: () => void): Promise<void> {
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
    !queue.includes(job, isFlushing && job.cb ? flushIndex + 1 : flushIndex)
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

function flushJobs(seen?: CountMap): void {
  isFlushPending = false
  isFlushing = true
  /* istanbul ignore else */
  if (__DEV__) {
    seen = seen || new Map()
  }

  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      /* istanbul ignore else */
      if (__DEV__) {
        checkRecursiveUpdates(seen!, job)
      }

      job()
    }
  } finally {
    flushIndex = 0
    queue.length = 0

    isFlushing = false
    currentFlushPromise = null
  }
}

function checkRecursiveUpdates(
  seen: CountMap,
  fn: SchedulerJob | Function
): void {
  const count = seen.get(fn) || 0
  /* istanbul ignore if */
  if (count > RECURSION_LIMIT) {
    throw new Error(
      `Maximum recursive updates exceeded. ` +
        `This means you have a reactive effect that is mutating its own ` +
        `dependencies and thus recursively triggering itself.`
    )
  } else {
    seen.set(fn, count + 1)
  }
}
