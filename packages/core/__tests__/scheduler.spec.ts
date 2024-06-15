import {
  flushPostFlushCbs,
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
  })

  describe('pre flush jobs', () => {
    it('queueJob inside preFlushCb', async () => {
      const calls: string[] = []
      const job1 = () => {
        calls.push('job1')
      }

      const cb1 = () => {
        // QueueJob in postFlushCb
        calls.push('cb1')
        queueJob(job1)
      }

      queueJob(cb1)
      await nextTick()
      expect(calls).toEqual(['cb1', 'job1'])
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
      flushPostFlushCbs()
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
      flushPostFlushCbs()
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

      flushPostFlushCbs()
      expect(calls).toEqual(['cb1'])

      flushPostFlushCbs()
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
      flushPostFlushCbs()
      expect(calls).toEqual(['cb1'])
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
      flushPostFlushCbs()
      expect(calls).toEqual(['cb1'])
      await nextTick()
      expect(calls).toEqual(['cb1', 'job1'])
      flushPostFlushCbs()
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
      expect(calls).toEqual(['job1'])
      flushPostFlushCbs()
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
      expect(calls).toEqual(['job1', 'job2'])
      flushPostFlushCbs()
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
      expect(calls).toEqual(['job1', 'job2'])
      flushPostFlushCbs()
      expect(calls).toEqual(['job1', 'job2', 'cb1', 'cb2'])
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
    flushPostFlushCbs()
    expect(calls).toEqual(['cb1', 'cb2'])
    flushPostFlushCbs()
    expect(calls).toEqual(['cb1', 'cb2'])
  })

  test('nextTick should capture scheduler flush errors', async () => {
    const err = new Error('test')
    queueJob(() => {
      throw err
    })
    try {
      await nextTick()
    } catch (error: any) {
      expect(error).toBe(err)
    }

    // This one should no longer error
    await nextTick()
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
    const job = () => {
      if (count < 3) {
        count++
        queueJob(job)
      }
    }

    job.allowRecurse = true
    queueJob(job)
    await nextTick()
    expect(count).toBe(3)

    // Post cb
    const cb = () => {
      if (count < 5) {
        count++
        queuePostFlushCb(cb)
      }
    }

    cb.allowRecurse = true
    queuePostFlushCb(cb)
    flushPostFlushCbs()
    expect(count).toBe(4)
    flushPostFlushCbs()
    expect(count).toBe(5)
    flushPostFlushCbs()
    expect(count).toBe(5)
  })

  // #910
  test('should not run stopped reactive effects', async () => {
    const spy = vi.fn()

    // Simulate parent component that toggles child
    const job1 = () => {
      // @ts-expect-error
      job2.active = false
    }

    // Simulate child that's triggered by the same reactive change that
    // triggers its toggle
    const job2 = () => spy()
    expect(spy).toHaveBeenCalledTimes(0)

    queueJob(job1)
    queueJob(job2)
    await nextTick()

    // Should not be called
    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('nextTick should return promise', async () => {
    const fn = vi.fn(() => 1)

    const p = nextTick(fn)

    expect(p).toBeInstanceOf(Promise)
    expect(await p).toBe(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  /** Dividing line, the above tests is directly copy from vue.js **/

  test('should not run inactive callback', async () => {
    const spy = vi.fn()

    const job1 = () => {
      // @ts-expect-error
      job2.active = false
    }

    const job2 = () => spy()
    expect(spy).toHaveBeenCalledTimes(0)

    queuePostFlushCb(job1)
    queuePostFlushCb(job2)
    flushPostFlushCbs()

    expect(spy).toHaveBeenCalledTimes(0)
  })
})
