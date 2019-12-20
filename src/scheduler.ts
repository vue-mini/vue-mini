// eslint-disable-next-line @typescript-eslint/ban-types
const queue: Function[] = []
const p = Promise.resolve()

let isFlushing = false
let isFlushPending = false

const RECURSION_LIMIT = 100
// eslint-disable-next-line @typescript-eslint/ban-types
type CountMap = Map<Function, number>

export function nextTick(fn?: () => void): Promise<void> {
  return fn ? p.then(fn) : p
}

export function queueJob(job: () => void): void {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

function queueFlush(): void {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    nextTick(flushJobs)
  }
}

function flushJobs(seen?: CountMap): void {
  isFlushPending = false
  isFlushing = true
  let job
  seen = seen || new Map()
  while ((job = queue.shift())) {
    checkRecursiveUpdates(seen, job)
    job()
  }

  isFlushing = false
  // Keep flushing until it drains.
  if (queue.length > 0) {
    flushJobs(seen)
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function checkRecursiveUpdates(seen: CountMap, fn: Function): void {
  const count = seen.get(fn) || 0
  if (count > RECURSION_LIMIT) {
    throw new Error(
      'Maximum recursive updates exceeded. ' +
        "You may have code that is mutating state in your component's " +
        'render function or updated hook or watcher source function.'
    )
  } else {
    seen.set(fn, count + 1)
  }
}
