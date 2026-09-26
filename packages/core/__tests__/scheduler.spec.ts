import type { SchedulerJob } from '../src/scheduler'
import {
  SchedulerJobFlags,
  nextTick,
  queueJob,
  queuePostFlushCb,
} from '../src/scheduler'

describe('scheduler', () => {
  it('nextTick', async () => {
    const calls: string[] = []
    const dummyThen = Promise.resolve().then()
    const job1 = () => {
      calls.push('job1')
    }

    const job2 = () => {
      calls.push('job2')
    }

    void nextTick(job1)
    job2()

    expect(calls.length).toBe(1)
    await dummyThen
    // Job1 will be pushed in nextTick
    expect(calls.length).toBe(2)
    expect(calls).toMatchObject(['job2', 'job1'])
  })

  describe('queueJob', () => {
    it('basic usage', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }

      const job2 = () => {
        calls.push('job2')
      }

      queueJob(job1)
      queueJob(job2)
      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['job1', 'job2'])
    })

    it('should dedupe queued jobs', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }

      const job2 = () => {
        calls.push('job2')
      }

      queueJob(job1)
      queueJob(job2)
      queueJob(job1)
      queueJob(job2)
      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['job1', 'job2'])
    })

    it('queueJob while flushing', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
        // Job2 will be executed after job1 at the same tick
        queueJob(job2)
      }

      const job2 = () => {
        calls.push('job2')
      }

      queueJob(job1)

      await nextTick()
      expect(calls).toEqual(['job1', 'job2'])
    })

    it('keeps the backing queue length bounded when splicing jobs after flush', async () => {
      const splicedQueueLengths: number[] = []
      const originalSplice = Array.prototype.splice
      const spliceSpy = vi
        .spyOn(Array.prototype, 'splice')
        .mockImplementation(function (
          this: unknown[],
          ...args: [start: number, deleteCount?: number, ...items: unknown[]]
        ) {
          const job = args[2]
          if (
            args[1] === 0 &&
            typeof job === 'function' &&
            (job as SchedulerJob).order !== undefined
          ) {
            splicedQueueLengths.push(this.length)
          }
          return originalSplice.apply(this, args as any)
        })

      try {
        for (let i = 0; i < 5; i++) {
          queueJob(() => {}, i)
        }
        await nextTick()

        for (let i = 0; i < 3; i++) {
          queueJob(() => {}, 2)
          queueJob(() => {}, 1)
          await nextTick()
        }
      } finally {
        spliceSpy.mockRestore()
      }

      expect(splicedQueueLengths).toEqual([1, 1, 1])
    })
  })

  describe('queuePostFlushCb', () => {
    it('basic usage', async () => {
      const calls: string[] = []

      const cb1 = () => {
        calls.push('cb1')
      }

      const cb2 = () => {
        calls.push('cb2')
      }

      const cb3 = () => {
        calls.push('cb3')
      }

      queuePostFlushCb(cb1)
      queuePostFlushCb(cb2)
      queuePostFlushCb(cb3)

      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2', 'cb3'])
    })

    it('should dedupe queued postFlushCb', async () => {
      const calls: string[] = []

      const cb1 = () => {
        calls.push('cb1')
      }

      const cb2 = () => {
        calls.push('cb2')
      }

      const cb3 = () => {
        calls.push('cb3')
      }

      queuePostFlushCb(cb1)
      queuePostFlushCb(cb2)
      queuePostFlushCb(cb3)

      queuePostFlushCb(cb1)
      queuePostFlushCb(cb3)
      queuePostFlushCb(cb2)

      expect(calls).toEqual([])
      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2', 'cb3'])
    })

    it('queuePostFlushCb while flushing', async () => {
      const calls: string[] = []
      const cb1 = () => {
        calls.push('cb1')
        // Cb2 will be executed after cb1 at the same tick
        queuePostFlushCb(cb2)
      }

      const cb2 = () => {
        calls.push('cb2')
      }

      queuePostFlushCb(cb1)

      await nextTick()
      expect(calls).toEqual(['cb1', 'cb2'])
    })
  })

  describe('queueJob w/ queuePostFlushCb', () => {
    it('queueJob inside postFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }

      const cb1 = () => {
        // QueueJob in postFlushCb
        calls.push('cb1')
        queueJob(job1)
      }

      queuePostFlushCb(cb1)
      await nextTick()
      expect(calls).toEqual(['cb1', 'job1'])
    })

    it('queueJob & postFlushCb inside postFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }

      const cb1 = () => {
        calls.push('cb1')
        queuePostFlushCb(cb2)
        // Job1 will executed before cb2
        // Job has higher priority than postFlushCb
        queueJob(job1)
      }

      const cb2 = () => {
        calls.push('cb2')
      }

      queuePostFlushCb(cb1)
      await nextTick()
      expect(calls).toEqual(['cb1', 'job1', 'cb2'])
    })

    it('postFlushCb inside queueJob', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
        // PostFlushCb in queueJob
        queuePostFlushCb(cb1)
      }

      const cb1 = () => {
        calls.push('cb1')
      }

      queueJob(job1)
      await nextTick()
      expect(calls).toEqual(['job1', 'cb1'])
    })

    it('queueJob & postFlushCb inside queueJob', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
        // Cb1 will executed after job2
        // Job has higher priority than postFlushCb
        queuePostFlushCb(cb1)
        queueJob(job2)
      }

      const job2 = () => {
        calls.push('job2')
      }

      const cb1 = () => {
        calls.push('cb1')
      }

      queueJob(job1)
      await nextTick()
      expect(calls).toEqual(['job1', 'job2', 'cb1'])
    })

    it('nested queueJob w/ postFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')

        queuePostFlushCb(cb1)
        queueJob(job2)
      }

      const job2 = () => {
        calls.push('job2')
        queuePostFlushCb(cb2)
      }

      const cb1 = () => {
        calls.push('cb1')
      }

      const cb2 = () => {
        calls.push('cb2')
      }

      queueJob(job1)
      await nextTick()
      expect(calls).toEqual(['job1', 'job2', 'cb1', 'cb2'])
    })

    test('jobs added during post flush are ordered correctly', async () => {
      const calls: string[] = []

      const job1: SchedulerJob = () => {
        calls.push('job1')
      }
      const job2: SchedulerJob = () => {
        calls.push('job2')
      }

      queuePostFlushCb(() => {
        queueJob(job2, 1)
        queueJob(job1)
      })

      await nextTick()

      expect(calls).toEqual(['job1', 'job2'])
    })
  })

  // #1595
  test('avoid duplicate postFlushCb invocation', async () => {
    const calls: string[] = []
    const cb1 = () => {
      calls.push('cb1')
      queuePostFlushCb(cb2)
    }

    const cb2 = () => {
      calls.push('cb2')
    }

    queuePostFlushCb(cb1)
    queuePostFlushCb(cb2)
    await nextTick()
    expect(calls).toEqual(['cb1', 'cb2'])
  })

  test('nextTick should capture scheduler flush errors', async () => {
    const err = new Error('test')
    queueJob(() => {
      throw err
    })
    try {
      await nextTick()
    } catch (error) {
      expect(error).toBe(err)
    }

    // This one should no longer error
    await nextTick()
  })

  test('jobs can be re-queued after an error', async () => {
    const err = new Error('test')
    let shouldThrow = true
    const job1: SchedulerJob = vi.fn(() => {
      if (shouldThrow) {
        shouldThrow = false
        throw err
      }
    })
    const job2: SchedulerJob = vi.fn()

    queueJob(job1)
    queueJob(job2)
    try {
      await nextTick()
    } catch (error) {
      expect(error).toBe(err)
    }

    expect(job1).toHaveBeenCalledTimes(1)
    expect(job2).toHaveBeenCalledTimes(0)
    queueJob(job1)
    queueJob(job2)
    await nextTick()
    expect(job1).toHaveBeenCalledTimes(2)
    expect(job2).toHaveBeenCalledTimes(1)
  })

  test('post jobs can be re-queued after an error', async () => {
    const err = new Error('test')
    let shouldThrow = true

    const job1: SchedulerJob = vi.fn(() => {
      if (shouldThrow) {
        shouldThrow = false
        throw err
      }
    })
    const job2: SchedulerJob = vi.fn()

    queuePostFlushCb(job1)
    queuePostFlushCb(job2)

    try {
      await nextTick()
    } catch (error) {
      expect(error).toBe(err)
    }

    expect(job1).toHaveBeenCalledTimes(1)
    expect(job2).toHaveBeenCalledTimes(0)

    queuePostFlushCb(job1)
    queuePostFlushCb(job2)

    await nextTick()

    expect(job1).toHaveBeenCalledTimes(2)
    expect(job2).toHaveBeenCalledTimes(1)
  })

  test('post job error should not leave newly queued main jobs pending', async () => {
    const calls: string[] = []

    const job2: SchedulerJob = () => {
      calls.push('job2')
    }

    const job1: SchedulerJob = () => {
      queueJob(job2)
      throw new Error('test')
    }

    queuePostFlushCb(job1)

    await expect(nextTick()).rejects.toThrow('test')
    await nextTick()
    expect(calls).toEqual(['job2'])
  })

  test('should prevent self-triggering jobs by default', async () => {
    let count = 0
    const job = () => {
      if (count < 3) {
        count++
        queueJob(job)
      }
    }

    queueJob(job)
    await nextTick()
    // Only runs once - a job cannot queue itself
    expect(count).toBe(1)
  })

  test('should allow explicitly marked jobs to trigger itself', async () => {
    // Normal job
    let count = 0
    const job: SchedulerJob = () => {
      if (count < 3) {
        count++
        queueJob(job)
      }
    }

    job.flags! |= SchedulerJobFlags.ALLOW_RECURSE
    queueJob(job)
    await nextTick()
    expect(count).toBe(3)

    // Post cb
    const cb: SchedulerJob = () => {
      if (count < 5) {
        count++
        queuePostFlushCb(cb)
      }
    }

    cb.flags! |= SchedulerJobFlags.ALLOW_RECURSE
    queuePostFlushCb(cb)
    await nextTick()
    expect(count).toBe(5)
  })

  test('recursive jobs can only be queued once non-recursively', async () => {
    const job: SchedulerJob = vi.fn()
    job.flags = SchedulerJobFlags.ALLOW_RECURSE
    queueJob(job)
    queueJob(job)
    await nextTick()
    expect(job).toHaveBeenCalledTimes(1)
  })

  test('recursive jobs can only be queued once recursively', async () => {
    let recurse = true
    const job: SchedulerJob = vi.fn(() => {
      if (recurse) {
        queueJob(job)
        queueJob(job)
        recurse = false
      }
    })
    job.flags = SchedulerJobFlags.ALLOW_RECURSE
    queueJob(job)
    await nextTick()
    expect(job).toHaveBeenCalledTimes(2)
  })

  test(`recursive jobs can't be re-queued by other jobs`, async () => {
    let recurse = true
    const job1: SchedulerJob = () => {
      if (recurse) {
        // Job2 is already queued, so this shouldn't do anything
        queueJob(job2)
        recurse = false
      }
    }

    const job2: SchedulerJob = vi.fn(() => {
      if (recurse) {
        queueJob(job1)
        queueJob(job2)
      }
    })
    job2.flags = SchedulerJobFlags.ALLOW_RECURSE
    queueJob(job2)
    await nextTick()
    expect(job2).toHaveBeenCalledTimes(2)
  })

  test(`recursive post jobs can't be re-queued by other jobs`, async () => {
    let recurse = true

    const job1: SchedulerJob = () => {
      if (recurse) {
        // job2 is already queued, so this shouldn't do anything
        queuePostFlushCb(job2)
        recurse = false
      }
    }
    const job2: SchedulerJob = vi.fn(() => {
      if (recurse) {
        queuePostFlushCb(job1)
        queuePostFlushCb(job2)
      }
    })
    job2.flags = SchedulerJobFlags.ALLOW_RECURSE

    queuePostFlushCb(job2)

    await nextTick()

    expect(job2).toHaveBeenCalledTimes(2)
  })

  // #910
  test('should not run stopped reactive effects', async () => {
    const spy = vi.fn()

    // simulate parent component that toggles child
    const job1 = () => {
      // @ts-expect-error
      job2.flags! |= SchedulerJobFlags.DISPOSED
    }
    // simulate child that's triggered by the same reactive change that
    // triggers its toggle
    const job2 = () => spy()
    expect(spy).toHaveBeenCalledTimes(0)

    queueJob(job1)
    queueJob(job2)
    await nextTick()

    // should not be called
    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('nextTick should return promise', async () => {
    const fn = vi.fn(() => 1)

    const p = nextTick(fn)

    expect(p).toBeInstanceOf(Promise)
    expect(await p).toBe(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('error in postFlush cb should not cause nextTick to stuck in rejected state forever', async () => {
    queuePostFlushCb(() => {
      throw new Error('error')
    })
    await expect(nextTick()).rejects.toThrow('error')
    await expect(nextTick()).resolves.toBeUndefined()
  })

  /** Dividing line, the above tests is directly copy from vue.js with some changes **/

  test('error in job should not cause nextTick to stuck in rejected state forever', async () => {
    queueJob(() => {
      throw new Error('error')
    })
    await expect(nextTick()).rejects.toThrow('error')
    await expect(nextTick()).resolves.toBeUndefined()
  })

  test('queueJob inside job', async () => {
    const calls: string[] = []

    const job1 = () => {
      calls.push('job1')
    }

    const cb1 = () => {
      calls.push('cb1')
      queueJob(job1)
    }

    queueJob(cb1)
    await nextTick()
    expect(calls).toEqual(['cb1', 'job1'])
  })

  test('job insertion', async () => {
    const calls: string[] = []
    const job1 = () => {
      calls.push('job1')
    }
    const job2 = () => {
      calls.push('job2')
    }
    const job3 = () => {
      calls.push('job3')
    }
    queueJob(job1)
    queueJob(job2, 1)
    queueJob(job3)
    await nextTick()
    expect(calls).toEqual(['job1', 'job3', 'job2'])
  })
})
