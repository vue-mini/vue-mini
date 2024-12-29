import { computed, ref, toRef, watch } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore } from '../src'

declare module '../src' {
  export interface PiniaCustomProperties<Id> {
    pluginN: number
    uid: number
    hasApp: boolean
    idFromPlugin: Id
    globalA: string
    globalB: string
    shared: number
    double: number
  }

  export interface PiniaCustomStateProperties<S> {
    pluginN: number
    shared: number
  }
}

describe('store plugins', () => {
  let pinia: Pinia

  const useStore = defineStore('test', () => {
    const incrementN = () => pinia._s.get('test')!.pluginN++

    const doubleN = computed(() => pinia._s.get('test')!.pluginN * 2)

    return { incrementN, doubleN }
  })

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('adds properties to stores', () => {
    pinia.use(({ store }) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!store.$state.hasOwnProperty('pluginN')) {
        // @ts-expect-error: cannot be a ref yet
        store.$state.pluginN = ref(20)
      }

      // @ts-expect-error: TODO: allow setting refs
      store.pluginN = toRef(store.$state, 'pluginN')
      return { uid: 0 }
    })

    const store = useStore()

    expect(store.$state.pluginN).toBe(20)
    expect(store.pluginN).toBe(20)
    expect(store.uid).toBeDefined()
    // @ts-expect-error: pluginN is a number
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.pluginN.notExisting
    // @ts-expect-error: it should always be 'test'
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.idFromPlugin === 'hello'
  })

  it('overrides $reset', () => {
    const useStore = defineStore('main', () => {
      const n = ref(0)
      const $reset = () => {
        n.value = 0
      }

      return { n, $reset }
    })

    pinia.use(({ store }) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!store.$state.hasOwnProperty('pluginN')) {
        // @ts-expect-error: cannot be a ref yet
        store.$state.pluginN = ref(20)
      }

      // @ts-expect-error: TODO: allow setting refs
      store.pluginN = toRef(store.$state, 'pluginN')

      const originalReset = store.$reset.bind(store)
      return {
        uid: 0,
        $reset() {
          originalReset()
          store.pluginN = 20
        },
      }
    })

    const store = useStore()

    store.pluginN = 200
    store.$reset()
    expect(store.$state.pluginN).toBe(20)
    expect(store.pluginN).toBe(20)
  })

  it('can install plugins before installing pinia', () => {
    pinia.use(() => ({ pluginN: 1 }))
    pinia.use(() => ({ uid: 0 }))
    pinia.use(() => ({ hasApp: true }))

    const store = useStore()

    expect(store.pluginN).toBe(1)
    expect(store.uid).toBeDefined()
    expect(store.hasApp).toBe(true)
  })

  it('can be used in actions', () => {
    pinia.use(() => ({ pluginN: 20 }))
    const store = useStore()
    expect(store.incrementN()).toBe(20)
  })

  it('can be used in getters', () => {
    pinia.use(() => ({ pluginN: 20 }))
    const store = useStore()
    expect(store.doubleN).toBe(40)
  })

  it('allows chaining', () => {
    pinia.use(() => ({ globalA: 'a' })).use(() => ({ globalB: 'b' }))
    const store = useStore()
    expect(store.globalA).toBe('a')
    expect(store.globalB).toBe('b')
  })

  it('shares the same ref among stores', () => {
    pinia.use(({ store }) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!store.$state.hasOwnProperty('shared')) {
        // @ts-expect-error: cannot be a ref yet
        store.$state.shared = ref(20)
      }

      // @ts-expect-error: TODO: allow setting refs
      store.shared = toRef(store.$state, 'shared')
    })

    const store = useStore()
    const store2 = useStore()

    expect(store.$state.shared).toBe(20)
    expect(store.shared).toBe(20)
    expect(store2.$state.shared).toBe(20)
    expect(store2.shared).toBe(20)

    store.$state.shared = 10
    expect(store.$state.shared).toBe(10)
    expect(store.shared).toBe(10)
    expect(store2.$state.shared).toBe(10)
    expect(store2.shared).toBe(10)

    store.shared = 1
    expect(store.$state.shared).toBe(1)
    expect(store.shared).toBe(1)
    expect(store2.$state.shared).toBe(1)
    expect(store2.shared).toBe(1)
  })

  it('passes the options of a setup store', async () => {
    const useStore = defineStore('main', () => {
      const n = ref(0)

      function increment() {
        n.value++
      }

      const a = computed(() => 'a')

      return { n, increment, a }
    })

    await new Promise<void>((resolve) => {
      pinia.use((context) => {
        expect(context.options).toEqual({
          actions: {
            increment: expect.any(Function),
          },
        })
        ;(context.store as any).increment()
        expect((context.store as any).n).toBe(1)
        resolve()
      })

      useStore()
    })
  })

  it('run inside store effect', async () => {
    pinia.use(({ store }) => ({
      // @ts-expect-error: invalid computed
      double: computed(() => store.$state.n * 2),
    }))

    const useStore = defineStore('main', () => {
      const n = ref(1)
      return { n }
    })

    const store = useStore()

    const spy = vi.fn()
    const { stop } = watch(() => store.double, spy, { flush: 'sync' })

    expect(spy).toHaveBeenCalledTimes(0)

    store.n++
    expect(spy).toHaveBeenCalledTimes(1)
    // `disposePinia` will trigger the watch, and the `store.$state` will be undefined,
    // so need to stop the watch before disposing the pinia
    stop()
  })

  it('only executes plugins once after multiple installs', async () => {
    const spy = vi.fn()
    pinia.use(spy)
    useStore()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
