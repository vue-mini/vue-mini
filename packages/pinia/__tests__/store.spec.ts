import { ref, watch } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore } from '../src'

describe('store', () => {
  let pinia: Pinia

  const useStore = defineStore('main', () => {
    const a = ref(true)
    const nested = ref({
      foo: 'foo',
      a: { b: 'string' },
    })
    return { a, nested }
  })

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('reuses a store', () => {
    const useStore = defineStore('main', () => ({}))
    expect(useStore()).toBe(useStore())
  })

  it('sets the initial state', () => {
    const store = useStore()
    expect(store.$state).toEqual({
      a: true,
      nested: {
        foo: 'foo',
        a: { b: 'string' },
      },
    })
  })

  it('can create an empty state if no state is provided', () => {
    const store = defineStore('some', () => ({}))()

    expect(store.$state).toEqual({})
  })

  it('can replace its state', () => {
    const store = useStore()
    const spy = vi.fn()
    watch(() => store.a, spy, { flush: 'sync' })
    expect(store.a).toBe(true)

    expect(spy).toHaveBeenCalledTimes(0)
    // @ts-expect-error
    store.$state = {
      a: false,
      nested: {
        foo: 'bar',
        a: {
          b: 'hey',
        },
      },
    }
    expect(spy).toHaveBeenCalledTimes(1)

    expect(store.$state).toEqual({
      a: false,
      nested: {
        foo: 'bar',
        a: { b: 'hey' },
      },
    })
  })

  it('can be disposed', () => {
    const useStore = defineStore('main', () => {
      const n = ref(0)
      return { n }
    })

    const store = useStore()
    const spy = vi.fn()

    store.$subscribe(spy, { flush: 'sync' })
    pinia.state.value.main.n++
    expect(spy).toHaveBeenCalledTimes(1)

    expect(useStore()).toBe(store)
    store.$dispose()
    pinia.state.value.main.n++

    expect(spy).toHaveBeenCalledTimes(1)

    expect(useStore()).not.toBe(store)
  })
})
