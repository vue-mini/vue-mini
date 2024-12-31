import { ref, reactive, computed } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore } from '../src'

describe('actions', () => {
  let pinia: Pinia

  const useStore = defineStore('main', () => {
    const a = ref(true)
    const nested = reactive({
      foo: 'foo',
      a: { b: 'string' },
    })

    const nonA = computed(() => !a.value)
    const otherComputed = computed(() => nonA.value)

    const getNonA = async () => nonA.value

    const toggle = () => {
      a.value = !a.value
    }

    const simple = () => {
      toggle()
      return 'simple'
    }

    const setFoo = (foo: string) => {
      nested.foo = foo
    }

    const combined = () => {
      toggle()
      setFoo('bar')
    }

    const throws = () => {
      throw new Error('fail')
    }

    const rejects = async () => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'fail'
    }

    return {
      a,
      nested,
      nonA,
      otherComputed,
      getNonA,
      simple,
      toggle,
      setFoo,
      combined,
      throws,
      rejects,
    }
  })

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('can use the store as this', () => {
    const store = useStore()
    expect(store.$state.a).toBe(true)
    store.toggle()
    expect(store.$state.a).toBe(false)
  })

  it('can call other actions', () => {
    const store = useStore()
    expect(store.$state.a).toBe(true)
    expect(store.$state.nested.foo).toBe('foo')
    store.combined()
    expect(store.$state.a).toBe(false)
    expect(store.$state.nested.foo).toBe('bar')
  })

  it('throws errors', () => {
    const store = useStore()
    expect(() => store.throws()).toThrowError('fail')
  })

  it('throws async errors', async () => {
    const store = useStore()
    expect.assertions(1)
    await expect(store.rejects()).rejects.toBe('fail')
  })

  it('can catch async errors', async () => {
    const store = useStore()
    expect.assertions(3)
    const spy = vi.fn()
    // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
    await expect(store.rejects().catch(spy)).resolves.toBe(undefined)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('fail')
  })

  it('can destructure actions', () => {
    const store = useStore()
    const { simple } = store
    expect(simple()).toBe('simple')
  })
})
