export type Job = () => void

const queue: Job[] = []
const p = Promise.resolve()

let isFlushing = false
let isFlushPending = false

const RECURSION_LIMIT = 100
type CountMap = Map<Job | Function, number>

export function nextTick(fn?: () => void): Promise<void> {
  // eslint-disable-next-line promise/prefer-await-to-then
  return fn ? p.then(fn) : p
}

export function queueJob(job: Job): void {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

function queueFlush(): void {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    nextTick(flushJobs)
  }
}

function flushJobs(seen?: CountMap): void {
  isFlushPending = false
  isFlushing = true
  let job
  /* istanbul ignore else */
  if (__DEV__) {
    seen = seen || new Map()
  }

  while ((job = queue.shift())) {
    /* istanbul ignore else */
    if (__DEV__) {
      checkRecursiveUpdates(seen!, job)
    }

    job()
  }

  isFlushing = false
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
