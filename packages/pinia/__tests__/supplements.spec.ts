import { definePage, nextTick, ref } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore, storeToRefs } from '../src'

// Mocks
let page: Record<string, any>
let renderCb: () => void
// @ts-expect-error
globalThis.Page = (options: Record<string, any>) => {
  page = {
    ...options,
    is: '',
    route: '',
    options: {},
    createSelectorQuery() {},
    createIntersectionObserver() {},
    createMediaQueryObserver() {},
    selectComponent() {},
    selectAllComponents() {},
    getTabBar() {},
    getPageId() {},
    animate() {},
    clearAnimation() {},
    getOpenerEventChannel() {},
    applyAnimatedStyle() {},
    clearAnimatedStyle() {},
    setUpdatePerformanceListener() {},
    getPassiveEvent() {},
    setPassiveEvent() {},
    setInitialRenderingCache() {},
    setData(data: Record<string, unknown>, callback: () => void) {
      this.data = this.data || {}
      Object.keys(data).forEach((key) => {
        this.data[key] = data[key]
      })

      renderCb = callback
    },
  }
}

describe('supplements', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('subscription', async () => {
    const spyPre = vi.fn()
    const spySync = vi.fn()
    const useStore = defineStore('main', () => ({
      user: ref('Eduardo'),
    }))

    const s1 = useStore()
    s1.$subscribe(spyPre, { flush: 'pre' })
    s1.$subscribe(spySync, { flush: 'sync' })

    expect(spyPre).toHaveBeenCalledTimes(0)
    expect(spySync).toHaveBeenCalledTimes(0)

    s1.$patch({ user: 'Edu' })
    expect(spyPre).toHaveBeenCalledTimes(1)
    expect(spySync).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(spyPre).toHaveBeenCalledTimes(1)
    expect(spySync).toHaveBeenCalledTimes(1)

    s1.user = 'a'
    expect(spyPre).toHaveBeenCalledTimes(1)
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

    s1.user = 'b'
    expect(spyPre).toHaveBeenCalledTimes(3)
    expect(spySync).toHaveBeenCalledTimes(4)
    await nextTick()
    expect(spyPre).toHaveBeenCalledTimes(4)
    expect(spySync).toHaveBeenCalledTimes(4)

    s1.$patch({ user: 'c' })
    expect(spyPre).toHaveBeenCalledTimes(5)
    expect(spySync).toHaveBeenCalledTimes(5)
    // Should be executed synchronously after the patch.
    s1.user = 'd'
    expect(spyPre).toHaveBeenCalledTimes(5)
    expect(spySync).toHaveBeenCalledTimes(6)
    await nextTick()
    expect(spyPre).toHaveBeenCalledTimes(6)
    expect(spySync).toHaveBeenCalledTimes(6)
  })

  it('post subscription', async () => {
    const spy1 = vi.fn()
    const spy2 = vi.fn()
    const useStore = defineStore('main', () => ({
      user: ref('Eduardo'),
    }))

    definePage(() => {
      const s1 = useStore()
      s1.$subscribe(spy1, { flush: 'post' })
      const { user } = storeToRefs(s1)
      return { user }
    })
    page.onLoad()

    const s1 = useStore()
    s1.$subscribe(spy2, { flush: 'post' })

    expect(page.data.user).toBe('Eduardo')

    s1.user = 'Edu'
    await nextTick()
    expect(spy1).toHaveBeenCalledTimes(0)
    expect(spy2).toHaveBeenCalledTimes(0)
    expect(page.data.user).toBe('Edu')
    renderCb()
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)
    expect(page.data.user).toBe('Edu')

    s1.$patch({ user: 'a' })
    expect(spy1).toHaveBeenCalledTimes(2)
    expect(spy2).toHaveBeenCalledTimes(2)
    await nextTick()
    expect(page.data.user).toBe('a')
    renderCb()
    expect(spy1).toHaveBeenCalledTimes(2)
    expect(spy2).toHaveBeenCalledTimes(2)

    s1.$patch((state) => {
      state.user = 'other'
    })
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(3)
    await nextTick()
    expect(page.data.user).toBe('other')
    renderCb()
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(3)

    s1.user = 'b'
    await nextTick()
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(3)
    expect(page.data.user).toBe('b')
    renderCb()
    expect(spy1).toHaveBeenCalledTimes(4)
    expect(spy2).toHaveBeenCalledTimes(4)
    expect(page.data.user).toBe('b')

    s1.$patch({ user: 'c' })
    expect(spy1).toHaveBeenCalledTimes(5)
    expect(spy2).toHaveBeenCalledTimes(5)
    // Should be executed synchronously after the patch.
    s1.user = 'd'
    await nextTick()
    expect(spy1).toHaveBeenCalledTimes(5)
    expect(spy2).toHaveBeenCalledTimes(5)
    expect(page.data.user).toBe('d')
    renderCb()
    expect(spy1).toHaveBeenCalledTimes(6)
    expect(spy2).toHaveBeenCalledTimes(6)
  })

  it('remove subscription on unmount', async () => {
    const spy1 = vi.fn()
    const spy2 = vi.fn()
    const useStore = defineStore('main', () => ({
      user: ref('Eduardo'),
    }))

    definePage(() => {
      const s1 = useStore()
      s1.$subscribe(spy1, { flush: 'sync' })
    })
    page.onLoad()

    const s1 = useStore()
    const s2 = useStore()

    s2.$subscribe(spy2, { flush: 'sync' })

    expect(spy1).toHaveBeenCalledTimes(0)
    expect(spy2).toHaveBeenCalledTimes(0)

    s1.user = 'Edu'
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)

    s1.$patch({ user: 'a' })
    expect(spy1).toHaveBeenCalledTimes(2)
    expect(spy2).toHaveBeenCalledTimes(2)

    s1.$patch((state) => {
      state.user = 'other'
    })
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(3)

    page.onUnload()
    await nextTick()

    s1.$patch({ user: 'b' })
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(4)
    s1.$patch((state) => {
      state.user = 'c'
    })
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(5)
    s1.user = 'd'
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(6)
  })

  it('remove action subscription on unmount', async () => {
    const spy1 = vi.fn()
    const spy2 = vi.fn()
    const useStore = defineStore('main', () => {
      const name = ref('Eduardo')

      const changeName = (newName: string) => {
        name.value = newName
      }

      return {
        name,
        changeName,
      }
    })

    definePage(() => {
      const s1 = useStore()
      s1.$onAction(spy1)
    })
    page.onLoad()

    const s1 = useStore()
    const s2 = useStore()

    s2.$onAction(spy2)

    expect(spy1).toHaveBeenCalledTimes(0)
    expect(spy2).toHaveBeenCalledTimes(0)

    s1.changeName('Cleiton')

    expect(spy2).toHaveBeenCalledTimes(1)
    expect(spy1).toHaveBeenCalledTimes(1)

    s1.changeName('other')
    expect(spy1).toHaveBeenCalledTimes(2)
    expect(spy2).toHaveBeenCalledTimes(2)

    page.onUnload()
    await nextTick()

    s1.changeName('again')
    expect(spy1).toHaveBeenCalledTimes(2)
    expect(spy2).toHaveBeenCalledTimes(3)
  })

  it('$patch', () => {
    const useStore = defineStore('main', () => ({ foo: ref('foo') }))
    const s1 = useStore()
    const patch = Object.create({ bar: 'bar' })
    patch.foo = 'f'
    s1.$patch(patch)
    expect(s1.$state).toEqual({ foo: 'f' })
  })
})
