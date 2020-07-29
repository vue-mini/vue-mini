export type Job = () => void

const queue: Job[] = []
const resolvedPromise: Promise<any> = Promise.resolve()
let currentFlushPromise: Promise<void> | null = null

let isFlushing = false
let isFlushPending = false
let flushIndex = -1

const RECURSION_LIMIT = 100
type CountMap = Map<Job | Function, number>

export function nextTick(fn?: () => void): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  // eslint-disable-next-line promise/prefer-await-to-then
  return fn ? p.then(fn) : p
}

export function queueJob(job: Job): void {
  if (!queue.includes(job, flushIndex + 1)) {
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

  for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
    const job = queue[flushIndex]
    /* istanbul ignore else */
    if (__DEV__) {
      checkRecursiveUpdates(seen!, job)
    }

    job()
  }

  flushIndex = -1
  queue.length = 0

  isFlushing = false
  currentFlushPromise = null
}

function checkRecursiveUpdates(seen: CountMap, fn: Job | Function): void {
  const count = seen.get(fn) || 0
  /* istanbul ignore if */
  if (count > RECURSION_LIMIT) {
    throw new Error(
      'Maximum recursive updates exceeded. ' +
        'You may have code that is mutating state in your watcher source function. '
    )
  } else {
    seen.set(fn, count + 1)
  }
}
