/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { DebuggerEvent, ShallowRef } from '@vue/reactivity'
import {
  ITERATE_KEY,
  TrackOpTypes,
  TriggerOpTypes,
  triggerRef,
  shallowReactive,
  shallowRef,
  effectScope,
} from '@vue/reactivity'
import {
  watch,
  watchEffect,
  watchSyncEffect,
  reactive,
  computed,
  nextTick,
  ref,
} from '../src'

describe('watch', () => {
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
      },
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

  it('watching single source: array', async () => {
    const array = reactive([] as number[])
    const spy = vi.fn()
    watch(array, spy)
    array.push(1)
    await nextTick()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith([1], expect.anything(), expect.anything())
  })

  it('should not call functions inside a reactive source array', () => {
    const spy1 = vi.fn()
    const array = reactive([spy1])
    const spy2 = vi.fn()
    watch(array, spy2, { immediate: true })
    expect(spy1).toBeCalledTimes(0)
    expect(spy2).toBeCalledWith([spy1], undefined, expect.anything())
  })

  it('should not unwrap refs in a reactive source array', async () => {
    const val = ref({ foo: 1 })
    const array = reactive([val])
    const spy = vi.fn()
    watch(array, spy, { immediate: true })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith([val], undefined, expect.anything())

    // Deep by default
    val.value.foo++
    await nextTick()
    expect(spy).toBeCalledTimes(2)
    expect(spy).toBeCalledWith([val], [val], expect.anything())
  })

  it('should not fire if watched getter result did not change', async () => {
    const spy = vi.fn()
    const n = ref(0)
    watch(() => n.value % 2, spy)

    n.value++
    await nextTick()
    expect(spy).toBeCalledTimes(1)

    n.value += 2
    await nextTick()
    // Should not be called again because getter result did not change
    expect(spy).toBeCalledTimes(1)
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

  it('watching primitive with deep: true', async () => {
    const count = ref(0)
    let dummy
    watch(
      count,
      (c, prevCount) => {
        dummy = [c, prevCount]
      },
      {
        deep: true,
      },
    )
    count.value++
    await nextTick()
    expect(dummy).toMatchObject([1, 0])
  })

  it('directly watching reactive object (with automatic deep: true)', async () => {
    const src = reactive({
      count: 0,
    })
    let dummy
    watch(src, ({ count }) => {
      dummy = count
    })
    src.count++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('directly watching reactive object with explicit deep: false', async () => {
    const src = reactive({
      state: {
        count: 0,
      },
    })
    let dummy
    watch(
      src,
      ({ state }) => {
        dummy = state?.count
      },
      {
        deep: false,
      },
    )

    // Nested should not trigger
    src.state.count++
    await nextTick()
    expect(dummy).toBe(undefined)

    // Root level should trigger
    src.state = { count: 1 }
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('directly watching reactive array with explicit deep: false', async () => {
    const val = ref(1)
    const array: any[] = reactive([val])
    const spy = vi.fn()
    watch(array, spy, { immediate: true, deep: false })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith([val], undefined, expect.anything())

    val.value++
    await nextTick()
    expect(spy).toBeCalledTimes(1)

    array[1] = 2
    await nextTick()
    expect(spy).toBeCalledTimes(2)
    expect(spy).toBeCalledWith([val, 2], [val, 2], expect.anything())
  })

  // #9916
  it('watching shallow reactive array with deep: false', async () => {
    class Foo {
      prop1: ShallowRef<string> = shallowRef('')
      prop2 = ''
    }

    const obj1 = new Foo()
    const obj2 = new Foo()

    const collection = shallowReactive([obj1, obj2])
    const cb = vi.fn()
    watch(collection, cb, { deep: false })

    collection[0].prop1.value = 'foo'
    await nextTick()
    // Should not trigger
    expect(cb).toBeCalledTimes(0)

    collection.push(new Foo())
    await nextTick()
    // Should trigger on array self mutation
    expect(cb).toBeCalledTimes(1)
  })

  it('should still respect deep: true on shallowReactive source', async () => {
    const obj = reactive({ a: 1 })
    const arr = shallowReactive([obj])

    let dummy
    watch(
      arr,
      () => {
        dummy = arr[0].a
      },
      { deep: true },
    )

    obj.a++
    await nextTick()
    expect(dummy).toBe(2)
  })

  it('watching multiple sources', async () => {
    const state = reactive({ count: 1 })
    const count = ref(1)
    const plus = computed(() => count.value + 1)

    let dummy
    watch([() => state.count, count, plus], (vals, oldVals) => {
      dummy = [vals, oldVals]
      // Assert types
      // eslint-disable-next-line unicorn/prefer-spread
      vals.concat(1)
      // eslint-disable-next-line unicorn/prefer-spread
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

  it('watching multiple sources: undefined initial values and immediate: true', async () => {
    const a = ref()
    const b = ref()
    let called = false
    watch(
      [a, b],
      ([newA, newB], [oldA, oldB]) => {
        called = true
        expect([newA, newB]).toMatchObject([undefined, undefined])
        expect([oldA, oldB]).toMatchObject([undefined, undefined])
      },
      { immediate: true },
    )
    await nextTick()
    expect(called).toBe(true)
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

  it('watching multiple sources: reactive object (with automatic deep: true)', async () => {
    const src = reactive({ count: 0 })
    let dummy
    watch([src], ([state]) => {
      dummy = state
      // Assert types
      state.count === 1
    })
    src.count++
    await nextTick()
    expect(dummy).toMatchObject({ count: 1 })
  })

  it('warn invalid watch source', () => {
    // @ts-expect-error
    watch(1, () => {})
    expect(`Invalid watch source`).toHaveBeenWarned()
  })

  it('warn invalid watch source: multiple sources', () => {
    watch([1], () => {})
    expect(`Invalid watch source`).toHaveBeenWarned()
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
      },
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
    const cleanup = vi.fn()
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
    const cleanup = vi.fn()
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
      { deep: true },
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

  it('watching deep ref', async () => {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    const state = reactive([count, double])

    let dummy
    watch(
      () => state,
      (state) => {
        dummy = [state[0].value, state[1].value]
      },
      { deep: true },
    )

    count.value++
    await nextTick()
    expect(dummy).toEqual([1, 2])
  })

  it('deep with symbols', async () => {
    // eslint-disable-next-line symbol-description
    const symbol1 = Symbol()
    // eslint-disable-next-line symbol-description
    const symbol2 = Symbol()
    // eslint-disable-next-line symbol-description
    const symbol3 = Symbol()
    // eslint-disable-next-line symbol-description
    const symbol4 = Symbol()

    const raw: any = {
      [symbol1]: {
        [symbol2]: 1,
      },
    }

    Object.defineProperty(raw, symbol3, {
      writable: true,
      enumerable: false,
      value: 1,
    })

    const state = reactive(raw)
    const spy = vi.fn()

    watch(() => state, spy, { deep: true })

    await nextTick()
    expect(spy).toHaveBeenCalledTimes(0)

    state[symbol1][symbol2] = 2
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)

    // Non-enumerable properties don't trigger deep watchers
    state[symbol3] = 3
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)

    // Adding a new symbol property
    state[symbol4] = 1
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(2)

    // Removing a symbol property
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete state[symbol4]
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('immediate', async () => {
    const count = ref(0)
    const cb = vi.fn()
    watch(count, cb, { immediate: true })
    expect(cb).toHaveBeenCalledTimes(1)
    count.value++
    await nextTick()
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('immediate: triggers when initial value is null', async () => {
    const state = ref(null)
    const spy = vi.fn()
    watch(() => state.value, spy, { immediate: true })
    expect(spy).toHaveBeenCalled()
  })

  it('immediate: triggers when initial value is undefined', async () => {
    const state = ref()
    const spy = vi.fn()
    watch(() => state.value, spy, { immediate: true })
    expect(spy).toHaveBeenCalledWith(undefined, undefined, expect.any(Function))
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
      // @ts-expect-error
      { immediate: false },
    )
    expect(dummy).toBe(0)
    expect(`"immediate" option is only respected`).toHaveBeenWarned()

    count.value++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('warn and not respect deep option when using effect', async () => {
    const arr = ref([1, [2]])
    const spy = vi.fn()
    watchEffect(
      () => {
        spy()
        return arr
      },
      // @ts-expect-error
      { deep: true },
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
    const onTrack = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1, bar: 2 })
    watchEffect(
      () => {
        dummy = [obj.foo, 'bar' in obj, Object.keys(obj)]
      },
      { onTrack },
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
    const onTrigger = vi.fn((e: DebuggerEvent) => {
      events.push(e)
    })
    const obj = reactive({ foo: 1 })
    watchEffect(
      () => {
        dummy = obj.foo
      },
      { onTrigger },
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

    // @ts-expect-error
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

  it('should work sync', () => {
    const v = ref(1)
    let calls = 0

    watch(
      v,
      () => {
        ++calls
      },
      {
        flush: 'sync',
      },
    )

    expect(calls).toBe(0)
    v.value++
    expect(calls).toBe(1)
  })

  test('should force trigger on triggerRef when watching a shallow ref', async () => {
    const v = shallowRef({ a: 1 })
    let sideEffect = 0
    watch(v, (obj) => {
      sideEffect = obj.a
    })

    // eslint-disable-next-line no-self-assign
    v.value = v.value
    await nextTick()
    // Should not trigger
    expect(sideEffect).toBe(0)

    v.value.a++
    await nextTick()
    // Should not trigger
    expect(sideEffect).toBe(0)

    triggerRef(v)
    await nextTick()
    // Should trigger now
    expect(sideEffect).toBe(2)
  })

  test('should force trigger on triggerRef when watching multiple sources: shallow ref array', async () => {
    const v = shallowRef([] as any)
    const spy = vi.fn()
    watch([v], () => {
      spy()
    })

    v.value.push(1)
    triggerRef(v)

    await nextTick()
    // Should trigger now
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('watchEffect should not recursively trigger itself', async () => {
    const spy = vi.fn()
    const price = ref(10)
    const history = ref<number[]>([])
    watchEffect(() => {
      history.value.push(price.value)
      spy()
    })
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('computed refs should not trigger watch if value has no change', async () => {
    const spy = vi.fn()
    const source = ref(0)
    const price = computed(() => source.value === 0)
    watch(price, spy)
    source.value++
    await nextTick()
    source.value++
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('watching sources: ref<any[]>', async () => {
    const foo = ref([1])
    const spy = vi.fn()
    watch(foo, () => {
      spy()
    })
    foo.value = [...foo.value]
    await nextTick()
    expect(spy).toBeCalledTimes(1)
  })

  test('watching multiple sources: computed', async () => {
    let count = 0
    const value = ref('1')
    const plus = computed(() => Boolean(value.value))
    watch([plus], () => {
      count++
    })
    value.value = '2'
    await nextTick()
    expect(plus.value).toBe(true)
    expect(count).toBe(0)
  })

  const options = [
    { name: 'only trigger once watch' },
    {
      deep: true,
      name: 'only trigger once watch with deep',
    },
    {
      flush: 'sync',
      name: 'only trigger once watch with flush: sync',
    },
    {
      flush: 'pre',
      name: 'only trigger once watch with flush: pre',
    },
    {
      immediate: true,
      name: 'only trigger once watch with immediate',
    },
  ] as const
  test.each(options)('$name', async (option) => {
    const count = ref(0)
    const cb = vi.fn()

    watch(count, cb, { once: true, ...option })

    count.value++
    await nextTick()

    expect(count.value).toBe(1)
    expect(cb).toHaveBeenCalledTimes(1)

    count.value++
    await nextTick()

    expect(count.value).toBe(2)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  test('OnCleanup also needs to be cleaned', async () => {
    const spy1 = vi.fn()
    const spy2 = vi.fn()
    const num = ref(0)

    watch(num, (value, _, onCleanup) => {
      if (value > 1) {
        return
      }

      spy1()
      onCleanup(() => {
        // OnCleanup also needs to be cleaned
        spy2()
      })
    })

    num.value++
    await nextTick()
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(0)

    num.value++
    await nextTick()

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)

    num.value++
    await nextTick()
    // Would not be calld when value>1
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)
  })

  test("effect should be removed from scope's effects after it is stopped", () => {
    const num = ref(0)
    let unwatch: () => void
    const scope = effectScope()
    scope.run(() => {
      unwatch = watch(num, () => {
        console.log(num.value)
      })
    })
    // @ts-expect-error
    expect(scope.effects.length).toBe(1)
    unwatch!()
    // @ts-expect-error
    expect(scope.effects.length).toBe(0)
  })

  test('circular reference', async () => {
    const obj = { a: 1 }
    // @ts-expect-error
    obj.b = obj
    const foo = ref(obj)
    const spy = vi.fn()

    watch(foo, spy, { deep: true })

    // @ts-expect-error
    foo.value.b.a = 2
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(foo.value.a).toBe(2)
  })

  /** Dividing line, the above tests is directly copy from vue.js **/

  it('watchSyncEffect', () => {
    const state = reactive({ count: 0 })
    let dummy
    watchSyncEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    expect(dummy).toBe(1)
  })

  it('warn when using old simple watch api', async () => {
    const count = ref(0)
    // @ts-expect-error
    watch(() => count.value)
    expect('`watch(fn, options?)` signature has been moved').toHaveBeenWarned()
  })

  it('should not trigger when value changed from NaN to NaN', async () => {
    const spy = vi.fn()
    const s = ref('a')
    watch(() => Number(s.value), spy)

    s.value = 'b'
    await nextTick()
    expect(spy).not.toBeCalled()
  })

  it('should work with circular object', async () => {
    const spy = vi.fn()
    const obj = { count: 0 }
    // @ts-expect-error
    obj.self = obj
    const source = reactive(obj)
    watch(source, spy)

    source.count = 1
    await nextTick()
    expect(spy).toBeCalledTimes(1)
  })

  it('warn and not respect once option when using effect', async () => {
    const count = ref(0)
    let dummy
    watchEffect(
      () => {
        dummy = count.value
      },
      // @ts-expect-error
      { once: true },
    )
    expect(dummy).toBe(0)
    expect(`"once" option is only respected`).toHaveBeenWarned()

    count.value++
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('watching multiple sources: reactive object with explicit deep: false', async () => {
    const src = reactive({
      state: {
        count: 0,
      },
    })
    let dummy
    watch(
      [src],
      ([{ state }]) => {
        dummy = state?.count
      },
      {
        deep: false,
      },
    )

    // Nested should not trigger
    src.state.count++
    await nextTick()
    expect(dummy).toBe(undefined)

    // Root level should trigger
    src.state = { count: 1 }
    await nextTick()
    expect(dummy).toBe(1)
  })

  // #9916
  it('watching multiple sources: shallow reactive array', async () => {
    class Foo {
      prop1: ShallowRef<string> = shallowRef('')
      prop2 = ''
    }

    const obj1 = new Foo()
    const obj2 = new Foo()

    const collection = shallowReactive([obj1, obj2])
    const cb = vi.fn()
    watch([collection], cb, { deep: false })

    collection[0].prop1.value = 'foo'
    await nextTick()
    // Should not trigger
    expect(cb).toBeCalledTimes(0)

    collection.push(new Foo())
    await nextTick()
    // Should trigger on array self mutation
    expect(cb).toBeCalledTimes(1)
  })
})
