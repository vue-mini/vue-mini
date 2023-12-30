import { queueJob, nextTick } from '../src/scheduler'

describe('scheduler', () => {
  it('nextTick', async () => {
    const calls: string[] = []
    const dummyThen = Promise.resolve().then()
    const job1 = (): void => {
      calls.push('job1')
    }

    const job2 = (): void => {
      calls.push('job2')
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    nextTick(job1)
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
      const job1 = (): void => {
        calls.push('job1')
      }

      const job2 = (): void => {
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
      const job1 = (): void => {
        calls.push('job1')
      }

      const job2 = (): void => {
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
      const job1 = (): void => {
        calls.push('job1')
        // Job2 will be excuted after job1 at the same tick
        queueJob(job2)
      }

      const job2 = (): void => {
        calls.push('job2')
      }

      queueJob(job1)

      await nextTick()
      expect(calls).toEqual(['job1', 'job2'])
    })
  })

  test('nextTick should capture scheduler flush errors', async () => {
    const err = new Error('test')
    queueJob(() => {
      throw err
    })
    // prettier-ignore
    try {
      await nextTick()
    } catch (error: unknown) {
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
  })

  test('should prevent duplicate queue', async () => {
    let count = 0
    const job = () => {
      count++
    }

    job.cb = true
    queueJob(job)
    queueJob(job)
    await nextTick()
    expect(count).toBe(1)
  })

  // #910
  test('should not run stopped reactive effects', async () => {
    const spy = jest.fn()

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

  test('nextTick should return promise', async () => {
    const fn = jest.fn(() => 1)

    const p = nextTick(fn)

    expect(p).toBeInstanceOf(Promise)
    expect(await p).toBe(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
