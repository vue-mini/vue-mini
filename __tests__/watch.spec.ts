/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  ITERATE_KEY,
  DebuggerEvent,
  TrackOpTypes,
  TriggerOpTypes,
} from '@vue/reactivity'
import { watch, watchEffect, reactive, computed, nextTick, ref } from '../src'
import { mockWarn } from './mock-warn'

describe('watch', () => {
  mockWarn()

  it('effect', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('watching single source: getter', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(
      () => state.count,
      (count, prevCount) => {
        dummy = [count, prevCount]
        // Assert types
        count + 1
        if (prevCount) {
          prevCount + 1
        }
      }
    )
    state.count++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  it('watching single source: ref', async () => {
    const count = ref(0)
    let dummy
    watch(count, (count, prevCount) => {
      dummy = [count, prevCount]
      // Assert types
      count + 1
      if (prevCount) {
        prevCount + 1
      }
    })
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  it('watching single source: computed ref', async () => {
    const count = ref(0)
    const plus = computed(() => count.value + 1)
    let dummy
    watch(plus, (count, prevCount) => {
      dummy = [count, prevCount]
      // Assert types
      count + 1
      if (prevCount) {
        prevCount + 1
      }
    })
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([2, 1])
  })

  it('watching multiple sources', async () => {
    const state = reactive({ count: 1 })
    const count = ref(1)
    const plus = computed(() => count.value + 1)

    let dummy
    watch([() => state.count, count, plus], (vals, oldVals) => {
      dummy = [vals, oldVals]
      // Assert types
      vals.concat(1)
      oldVals.concat(1)
    })

    state.count++
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([
      [2, 2, 3],
      [1, 1, 2],
    ])
  })

  it('watching multiple sources: readonly array', async () => {
    const state = reactive({ count: 1 })
    const status = ref(false)

    let dummy
    watch([() => state.count, status] as const, (vals, oldVals) => {
      dummy = [vals, oldVals]
      const [count] = vals
      const [, oldStatus] = oldVals
      // Assert types
      count + 1
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
      oldStatus === true
    })

    state.count++
    status.value = true
    await nextTick()
    expect(dummy).toMatchObject([
      [2, true],
      [1, false],
    ])
  })

  it('stopping the watcher (effect)', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop = watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    stop()
    state.count++
    await nextTick()
    // Should not update
    expect(dummy).toBe(0)
  })

  it('stopping the watcher (with source)', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop = watch(
      () => state.count,
      (count) => {
        dummy = count
      }
    )

    state.count++
    await nextTick()
    expect(dummy).toBe(1)

    stop()
    state.count++
    await nextTick()
    // Should not update
    expect(dummy).toBe(1)
  })

  it('cleanup registration (effect)', async () => {
    const state = reactive({ count: 0 })
    const cleanup = jest.fn()
    let dummy
    const stop = watchEffect((onCleanup) => {
      onCleanup(cleanup)
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('cleanup registration (with source)', async () => {
    const count = ref(0)
    const cleanup = jest.fn()
    let dummy
    const stop = watch(count, (count, _, onCleanup) => {
      onCleanup(cleanup)
      dummy = count
    })

    count.value++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(0)
    expect(dummy).toBe(1)

    count.value++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(2)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('flush timing: sync', async () => {
    const count = ref(0)
    let dummy
    watchEffect(
      () => {
        dummy = count.value
      },
      { flush: 'sync' }
    )
    expect(dummy).toBe(0)

    count.value++
    expect(dummy).toBe(1)
  })

  it('deep', async () => {
    const state = reactive({
      nested: {
        count: ref(0),
      },
      array: [1, 2, 3],
      map: new Map([
        ['a', 1],
        ['b', 2],
      ]),
      set: new Set([1, 2, 3]),
    })

    let dummy
    watch(
      () => state,
      (state) => {
        dummy = [
          state.nested.count,
          state.array[0],
          state.map.get('a'),
          state.set.has(1),
        ]
      },
      { deep: true }
    )

    state.nested.count++
    await nextTick()
    expect(dummy).toEqual([1, 1, 1, true])

    // Nested array mutation
    state.array[0] = 2
    await nextTick()
    expect(dummy).toEqual([1, 2, 1, true])

    // Nested map mutation
    state.map.set('a', 2)
    await nextTick()
    expect(dummy).toEqual([1, 2, 2, true])

    // Nested set mutation
    state.set.delete(1)
    await nextTick()
    expect(dummy).toEqual([1, 2, 2, false])
  })

  it('immediate', async () => {
    const count = ref(0)
    const cb = jest.fn()
    watch(count, cb, { immediate: true })
    expect(cb).toHaveBeenCalledTimes(1)
    count.value++
    await nextTick()
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('immediate: triggers when initial value is null', async () => {
    const state = ref(null)
    const spy = jest.fn()
    watch(() => state.value, spy, { immediate: true })
    expect(spy).toHaveBeenCalled()
  })

  it('immediate: triggers when initial value is undefined', async () => {
    const state = ref()
    const spy = jest.fn()
    watch(() => state.value, spy, { immediate: true })
    expect(spy).toHaveBeenCalled()
    state.value = 3
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)
    // Testing if undefined can trigger the watcher
    state.value = undefined
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
    // It shouldn't trigger if the same value is set
    state.value = undefined
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('warn immediate option when using effect', async () => {
    const count = ref(0)
    let dummy
    watchEffect(
      () => {
        dummy = count.value
      },
      // @ts-ignore
      { immediate: false }
    )
    expect(dummy).toBe(0)
    expect(`"immediate" option is only respected`).toHaveBeenWarned()

    count.value++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('warn and not respect deep option when using effect', async () => {
    const arr = ref([1, [2]])
    const spy = jest.fn()
    watchEffect(
      () => {
        spy()
        return arr
      },
      // @ts-ignore
      { deep: true }
    )
    expect(spy).toHaveBeenCalledTimes(1)
    ;(arr.value[1] as number[])[0] = 3
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(`"deep" option is only respected`).toHaveBeenWarned()
  })

  it('onTrack', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrack = jest.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1, bar: 2 })
    watchEffect(
      () => {
        dummy = [obj.foo, 'bar' in obj, Object.keys(obj)]
      },
      { onTrack }
    )
    await nextTick()
    expect(dummy).toEqual([1, true, ['foo', 'bar']])
    expect(onTrack).toHaveBeenCalledTimes(3)
    expect(events).toMatchObject([
      {
        target: obj,
        type: TrackOpTypes.GET,
        key: 'foo',
      },
      {
        target: obj,
        type: TrackOpTypes.HAS,
        key: 'bar',
      },
      {
        target: obj,
        type: TrackOpTypes.ITERATE,
        key: ITERATE_KEY,
      },
    ])
  })

  it('onTrigger', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrigger = jest.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1 })
    watchEffect(
      () => {
        dummy = obj.foo
      },
      { onTrigger }
    )
    await nextTick()
    expect(dummy).toBe(1)

    obj.foo++
    await nextTick()
    expect(dummy).toBe(2)
    expect(onTrigger).toHaveBeenCalledTimes(1)
    expect(events[0]).toMatchObject({
      type: TriggerOpTypes.SET,
      key: 'foo',
      oldValue: 1,
      newValue: 2,
    })

    delete obj.foo
    await nextTick()
    expect(dummy).toBeUndefined()
    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(events[1]).toMatchObject({
      type: TriggerOpTypes.DELETE,
      key: 'foo',
      oldValue: 2,
    })
  })

  /** Dividing line, the above tests is directly copy from vue.js **/

  it('warn when using old simple watch api', async () => {
    const count = ref(0)
    // @ts-ignore
    watch(() => count.value)
    expect('`watch(fn, options?)` signature has been moved').toHaveBeenWarned()
  })

  it('should not trigger when value changed from NaN to NaN', async () => {
    const count = ref(NaN)
    const fn = jest.fn()
    watch(count, fn)

    await nextTick()
    expect(fn).toHaveBeenCalledTimes(0)

    count.value = NaN
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(0)
  })
})
