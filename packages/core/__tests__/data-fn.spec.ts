import { ref, watch, nextTick, dataFn } from '../src'

describe('dataFn', () => {
  test('tracks dependencies from the first invocation only', async () => {
    const first = ref(0)
    const second = ref(0)
    const getValue = dataFn((key: 'first' | 'second') => {
      return key === 'first' ? first.value : second.value
    })
    const listener = vi.fn()

    watch(getValue, listener)

    expect(getValue.value('first')).toBe(0)
    expect(getValue.value('second')).toBe(0)

    first.value++
    await nextTick()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getValue.value('first')).toBe(1)

    second.value++
    await nextTick()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getValue.value('second')).toBe(1)
  })
})
