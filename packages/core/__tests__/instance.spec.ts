import { definePage, defineComponent, ref, onShow } from '../src'

// Mocks
let component: Record<string, any>
// @ts-expect-error
globalThis.Component = (options: Record<string, any>) => {
  component = {
    ...options,
    is: '',
    id: '',
    dataset: {},
    triggerEvent() {},
    createSelectorQuery() {},
    createIntersectionObserver() {},
    createMediaQueryObserver() {},
    selectComponent() {},
    selectAllComponents() {},
    selectOwnerComponent() {},
    getRelationNodes() {},
    groupSetData() {},
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
    setData(data: Record<string, unknown>) {
      this.data = this.data || {}
      Object.keys(data).forEach((key) => {
        this.data[key] = data[key]
      })
    },
  }
}

let page: Record<string, any>
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
    setData(data: Record<string, unknown>) {
      this.data = this.data || {}
      Object.keys(data).forEach((key) => {
        this.data[key] = data[key]
      })
      if (component) {
        component.lifetimes.attached.call(component)
      }
    },
  }
}

describe('instance', () => {
  test('unset current instance', () => {
    const fn = vi.fn()

    defineComponent(() => {
      onShow(fn)
    })

    definePage(() => {
      const show = ref(false)
      return { show }
    })
    page.onLoad()
    page.onShow()
    expect(fn).toHaveBeenCalledTimes(0)

    component.pageLifetimes.show.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
