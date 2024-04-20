import type { InjectionKey, Ref } from '../src'
import { provide, inject, ref, nextTick, readonly, reactive } from '../src'

// Reference: https://vue-composition-api-rfc.netlify.com/api.html#provide-inject

describe('provide/inject', () => {
  it('string keys', () => {
    provide('foo', 1)
    const foo = inject('foo')
    expect(foo).toBe(1)
  })

  it('symbol keys', () => {
    // Also verifies InjectionKey type sync
    const key: InjectionKey<number> = Symbol('key')
    provide(key, 1)
    const foo = inject(key) || 1
    expect(foo + 1).toBe(2)
  })

  it('default values', () => {
    provide('foo', 'foo')
    // Default value should be ignored if value is provided
    const foo = inject('foo', 'fooDefault')
    // Default value should be used if value is not provided
    const bar = inject('bar', 'bar')
    expect(foo + bar).toBe('foobar')
  })

  it('default values with factory function', () => {
    provide('foo', 'foo')
    // Default value should be ignored if value is provided
    const foo = inject('foo', () => 'fooDefault', true)
    // Default value should be used if value is not provided
    const bar = inject('bar', () => 'bar', true)
    expect(foo + bar).toBe('foobar')
  })

  it('override providers', () => {
    provide('foo', 'foo')
    provide('bar', 'bar')

    // Override value
    provide('foo', 'fooOverride')
    provide('baz', 'baz')

    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz')

    expect([foo, bar, baz].join(',')).toBe('fooOverride,bar,baz')
  })

  it('reactivity with refs', async () => {
    const count = ref(1)
    provide('count', count)

    const injectedCount = inject<Ref<number>>('count')!
    expect(injectedCount.value).toBe(1)

    count.value++
    await nextTick()
    expect(injectedCount.value).toBe(2)
  })

  it('reactivity with readonly refs', async () => {
    const count = ref(1)
    provide('count', readonly(count))

    const injectedCount = inject<Ref<number>>('count')!
    // Should not work
    injectedCount.value++
    expect(injectedCount.value).toBe(1)
    expect(
      `Set operation on key "value" failed: target is readonly`,
    ).toHaveBeenWarned()

    // Source mutation should still work
    count.value++
    await nextTick()
    expect(injectedCount.value).toBe(2)
  })

  it('reactivity with objects', async () => {
    const rootState = reactive({ count: 1 })
    provide('state', rootState)

    const state = inject<typeof rootState>('state')!
    expect(state.count).toBe(1)

    rootState.count++
    await nextTick()
    expect(state.count).toBe(2)
  })

  it('reactivity with readonly objects', async () => {
    const rootState = reactive({ count: 1 })
    provide('state', readonly(rootState))

    const state = inject<typeof rootState>('state')!
    // Should not work
    state.count++
    expect(state.count).toBe(1)
    expect(
      `Set operation on key "count" failed: target is readonly`,
    ).toHaveBeenWarned()

    rootState.count++
    await nextTick()
    expect(state.count).toBe(2)
  })

  it('should warn unfound', () => {
    const foo = inject(Symbol('foo'))
    expect(foo).toBeUndefined()
    expect(`injection "Symbol(foo)" not found.`).toHaveBeenWarned()
  })

  it('should not warn when default value is undefined', () => {
    inject(Symbol('foo'), undefined)
    expect(`injection "Symbol(foo)" not found.`).not.toHaveBeenWarned()
  })
})
