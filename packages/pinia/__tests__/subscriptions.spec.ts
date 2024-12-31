import { nextTick, ref } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore, MutationType } from '../src'

describe('subscriptions', () => {
  let pinia: Pinia

  const useStore = defineStore('main', () => ({
    user: ref('Eduardo'),
  }))

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('fires callback changed through $state', () => {
    const store = useStore()
    const spy = vi.fn()
    store.$subscribe(spy, { flush: 'sync' })
    store.$state.user = 'Cleiton'
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'main',
        type: MutationType.direct,
      }),
      store.$state,
    )
  })

  it('fires callback when changed througg store', async () => {
    const store = useStore()
    const spy = vi.fn()
    store.$subscribe(spy)
    expect(spy).toHaveBeenCalledTimes(0)
    store.user = 'Cleiton'
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('subscribe to changes done via patch', () => {
    const store = useStore()
    const spy = vi.fn()
    store.$subscribe(spy, { flush: 'sync' })

    const patch = { user: 'Cleiton' }
    store.$patch(patch)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: patch,
        storeId: 'main',
        type: MutationType.patchObject,
      }),
      store.$state,
    )
  })

  it('works with multiple different flush', async () => {
    const spyPre = vi.fn()
    const spySync = vi.fn()

    const s1 = useStore()
    s1.$subscribe(spyPre, { flush: 'pre' })
    s1.$subscribe(spySync, { flush: 'sync' })

    expect(spyPre).toHaveBeenCalledTimes(0)
    expect(spySync).toHaveBeenCalledTimes(0)

    s1.user = 'Edu'
    expect(spyPre).toHaveBeenCalledTimes(0)
    expect(spySync).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(spyPre).toHaveBeenCalledTimes(1)
    expect(spySync).toHaveBeenCalledTimes(1)

    s1.$patch({ user: 'a' })
    // Patch still triggers all subscriptions immediately
    expect(spyPre).toHaveBeenCalledTimes(2)
    expect(spySync).toHaveBeenCalledTimes(2)
    await nextTick()
    expect(spyPre).toHaveBeenCalledTimes(2)
    expect(spySync).toHaveBeenCalledTimes(2)

    s1.$patch((state) => {
      state.user = 'other'
    })
    expect(spyPre).toHaveBeenCalledTimes(3)
    expect(spySync).toHaveBeenCalledTimes(3)
    await nextTick()
    expect(spyPre).toHaveBeenCalledTimes(3)
    expect(spySync).toHaveBeenCalledTimes(3)
  })

  it('works with multiple different flush and multiple state changes', async () => {
    const spyPre = vi.fn()
    const spySync = vi.fn()

    const s1 = useStore()
    s1.$subscribe(spyPre, { flush: 'pre' })
    s1.$subscribe(spySync, { flush: 'sync' })

    s1.user = 'Edu'
    expect(spyPre).toHaveBeenCalledTimes(0)
    expect(spySync).toHaveBeenCalledTimes(1)
    s1.$patch({ user: 'a' })
    expect(spyPre).toHaveBeenCalledTimes(1)
    expect(spySync).toHaveBeenCalledTimes(2)
    await nextTick()
    expect(spyPre).toHaveBeenCalledTimes(1)
    expect(spySync).toHaveBeenCalledTimes(2)
  })

  it('unsubscribes callback when unsubscribe is called', () => {
    const spy = vi.fn()
    const store = useStore()
    const unsubscribe = store.$subscribe(spy, { flush: 'sync' })
    unsubscribe()
    store.$state.user = 'Cleiton'
    expect(spy).not.toHaveBeenCalled()
  })

  it('listeners are not affected when unsubscribe is called multiple times', () => {
    const func1 = vi.fn()
    const func2 = vi.fn()
    const store = useStore()
    const unsubscribe1 = store.$subscribe(func1, { flush: 'sync' })
    store.$subscribe(func2, { flush: 'sync' })
    unsubscribe1()
    unsubscribe1()
    store.$state.user = 'Cleiton'
    expect(func1).not.toHaveBeenCalled()
    expect(func2).toHaveBeenCalledTimes(1)
  })

  describe('multiple', () => {
    it('triggers subscribe only once', async () => {
      const s1 = useStore()
      const s2 = useStore()

      const spy1 = vi.fn()
      const spy2 = vi.fn()

      s1.$subscribe(spy1, { flush: 'sync' })
      s2.$subscribe(spy2, { flush: 'sync' })

      expect(spy1).toHaveBeenCalledTimes(0)
      expect(spy2).toHaveBeenCalledTimes(0)

      s1.user = 'Edu'

      expect(spy1).toHaveBeenCalledTimes(1)
      expect(spy2).toHaveBeenCalledTimes(1)
    })

    it('triggers pre subscriptions only once on $patch', async () => {
      const s1 = useStore()
      const spy1 = vi.fn()

      s1.$subscribe(spy1, { flush: 'pre' })

      // First mutation: works as expected
      s1.$patch({ user: 'Edu' })
      // Anything else than awaiting a non promise or Promise.resolve() works
      // eslint-disable-next-line @typescript-eslint/await-thenable, unicorn/no-unnecessary-await
      await false
      expect(spy1).toHaveBeenCalledTimes(1)
      expect(spy1).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: MutationType.direct }),
        s1.$state,
      )

      s1.$patch({ user: 'Myk' })
      await nextTick()

      expect(spy1).toHaveBeenCalledTimes(2)
      expect(spy1).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: MutationType.direct }),
        s1.$state,
      )
    })
  })

  it('subscribe is post by default', async () => {
    const spy = vi.fn()
    const store = useStore()
    store.$subscribe(spy)
    store.$state.user = 'Cleiton'
    expect(spy).toHaveBeenCalledTimes(0)
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'main',
        type: MutationType.direct,
      }),
      store.$state,
    )
  })

  it('subscribe once with patch', () => {
    const spy1 = vi.fn()
    const spy2 = vi.fn()
    const store = useStore()
    function once() {
      const unsubscribe = store.$subscribe(
        () => {
          spy1()
          unsubscribe()
        },
        { flush: 'sync' },
      )
    }

    once()
    store.$subscribe(spy2, { flush: 'sync' })
    expect(spy1).toHaveBeenCalledTimes(0)
    expect(spy2).toHaveBeenCalledTimes(0)
    store.$patch((state) => {
      state.user = 'a'
    })
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)
    store.$patch((state) => {
      state.user = 'b'
    })
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(2)
  })
})
