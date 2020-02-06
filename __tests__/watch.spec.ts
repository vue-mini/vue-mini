/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  ITERATE_KEY,
  DebuggerEvent,
  TrackOpTypes,
  TriggerOpTypes
} from '@next-vue/reactivity'
import { watch, reactive, computed, nextTick, ref } from '../src'
import { mockWarn } from './mock-warn'

describe('watch', () => {
  mockWarn()

  it('basic usage', async () => {
    const state = reactive({ count: 0 })
    let dummy
    watch(() => {
      dummy = state.count
    })
    await nextTick()
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
        prevCount + 1
      }
    )
    await nextTick()
    expect(dummy).toMatchObject([0, undefined])

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
      prevCount + 1
    })
    await nextTick()
    expect(dummy).toMatchObject([0, undefined])

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
      prevCount + 1
    })
    await nextTick()
    expect(dummy).toMatchObject([1, undefined])

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
    await nextTick()
    expect(dummy).toMatchObject([[1, 1, 2], []])

    state.count++
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([
      [2, 2, 3],
      [1, 1, 2]
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
      oldStatus === true // eslint-disable-line @typescript-eslint/no-unnecessary-boolean-literal-compare
    })
    await nextTick()
    expect(dummy).toMatchObject([[1, false], []])

    state.count++
    status.value = false
    await nextTick()
    expect(dummy).toMatchObject([
      [2, false],
      [1, false]
    ])
  })

  it('stopping the watcher', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop = watch(() => {
      dummy = state.count
    })
    await nextTick()
    expect(dummy).toBe(0)

    stop()
    state.count++
    await nextTick()
    // Should not update
    expect(dummy).toBe(0)
  })

  it('cleanup registration (basic)', async () => {
    const state = reactive({ count: 0 })
    const cleanup = jest.fn()
    let dummy
    const stop = watch(onCleanup => {
      onCleanup(cleanup)
      dummy = state.count
    })
    await nextTick()
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
    await nextTick()
    expect(dummy).toBe(0)

    count.value++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('flush timing: sync', async () => {
    const count = ref(0)
    let dummy
    watch(
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
        count: ref(0)
      },
      array: [1, 2, 3],
      map: new Map([
        ['a', 1],
        ['b', 2]
      ]),
      set: new Set([1, 2, 3])
    })

    let dummy
    watch(
      () => state,
      state => {
        dummy = [
          state.nested.count,
          state.array[0],
          state.map.get('a'),
          state.set.has(1)
        ]
      },
      { deep: true }
    )

    await nextTick()
    expect(dummy).toEqual([0, 1, 1, true])

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

  it('lazy', async () => {
    const count = ref(0)
    const cb = jest.fn()
    watch(count, cb, { lazy: true })
    await nextTick()
    expect(cb).not.toHaveBeenCalled()
    count.value++
    await nextTick()
    expect(cb).toHaveBeenCalled()
  })

  it('ignore lazy option when using simple callback', async () => {
    const count = ref(0)
    let dummy
    watch(
      () => {
        dummy = count.value
      },
      { lazy: true }
    )
    expect(dummy).toBeUndefined()
    expect(`lazy option is only respected`).toHaveBeenWarned()

    await nextTick()
    expect(dummy).toBe(0)

    count.value++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('onTrack', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrack = jest.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1, bar: 2 })
    watch(
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
        key: 'foo'
      },
      {
        target: obj,
        type: TrackOpTypes.HAS,
        key: 'bar'
      },
      {
        target: obj,
        type: TrackOpTypes.ITERATE,
        key: ITERATE_KEY
      }
    ])
  })

  it('onTrigger', async () => {
    const events: DebuggerEvent[] = []
    let dummy
    const onTrigger = jest.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1 })
    watch(
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
      newValue: 2
    })

    delete obj.foo
    await nextTick()
    expect(dummy).toBeUndefined()
    expect(onTrigger).toHaveBeenCalledTimes(2)
    expect(events[1]).toMatchObject({
      type: TriggerOpTypes.DELETE,
      key: 'foo',
      oldValue: 2
    })
  })
})
