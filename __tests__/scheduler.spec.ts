import { queueJob, nextTick } from '../src/scheduler'

describe('scheduler', () => {
  it('nextTick', async () => {
    const calls: string[] = []
    // eslint-disable-next-line promise/valid-params
    const dummyThen = Promise.resolve().then()
    const job1 = (): void => {
      calls.push('job1')
    }

    const job2 = (): void => {
      calls.push('job2')
    }

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
})
