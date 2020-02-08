import {
  defineComponent,
  ref,
  computed,
  nextTick,
  isReadonly,
  onAttach,
  onReady,
  onMove,
  onDetach,
  onError,
  onLoad,
  onShow,
  onHide,
  onPullDownRefresh,
  onReachBottom,
  onResize,
  onTabItemTap,
  onPageScroll,
  onShareAppMessage
} from '../src'
import { mockWarn } from './mock-warn'

// Mocks
declare global {
  namespace NodeJS {
    interface Global {
      Component: (options: Record<string, any>) => void
    }
  }
}
let component: Record<string, any>
global.Component = (options: Record<string, any>) => {
  component = {
    ...options,
    is: '',
    id: '',
    dataset: {},
    triggerEvent() {},
    createSelectorQuery() {},
    createIntersectionObserver() {},
    selectComponent() {},
    selectAllComponents() {},
    selectOwnerComponent() {},
    getRelationNodes() {},
    groupSetData() {},
    getTabBar() {},
    getPageId() {},
    animate() {},
    clearAnimation() {},
    setData(data: Record<string, unknown>) {
      this.data = this.data || {}
      Object.keys(data).forEach(key => {
        this.data[key] = data[key]
      })
    }
  }
}

describe('component', () => {
  mockWarn()

  it('binding', async () => {
    defineComponent(() => {
      const num = 0
      const count = ref(0)
      const double = computed(() => count.value * 2)
      const increment = (): void => {
        count.value++
      }

      return {
        num,
        count,
        double,
        increment
      }
    })

    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect(component.data.num).toBe(0)
    expect(component.data.count).toBe(0)
    expect(component.data.double).toBe(0)

    component.increment()
    await nextTick()
    expect(component.data.count).toBe(1)
    expect(component.data.double).toBe(2)

    component.lifetimes.detached.call(component)
    component.increment()
    await nextTick()
    expect(component.data.count).toBe(1)
    expect(component.data.double).toBe(2)
  })

  it('props', async () => {
    defineComponent({
      properties: {
        count: Number
      },
      setup(props) {
        expect(isReadonly(props)).toBe(true)
        expect(props.count).toBe(0)
        const double = computed(() => props.count * 2)
        return { double }
      }
    })

    component.data = { count: 0 }
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect(component.data.double).toBe(0)

    component.data.count = 1
    component.observers.count.call(component, component.data.count)
    await nextTick()
    expect(component.data.double).toBe(2)
  })

  it('observer', () => {
    const fn = jest.fn()
    defineComponent({
      properties: {
        count: Number
      },
      setup() {},
      observers: {
        count: fn
      }
    })
    component.data = { count: 0 }
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.observers.count.call(component, component.data.count)
    expect(fn).toBeCalledWith(0)
  })

  it('context', () => {
    defineComponent((_, context) => {
      expect(context.is).toBe('')
      expect(context.triggerEvent).toBeInstanceOf(Function)
      return { num: 0 }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect(component.data.num).toBe(0)
  })

  it('created', () => {
    const fn = jest.fn()
    defineComponent({
      lifetimes: { created: fn },
      setup() {}
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect(fn).toBeCalledTimes(1)
  })

  it('legacy created', () => {
    const fn = jest.fn()
    defineComponent({
      created: fn,
      setup() {}
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect(fn).toBeCalledTimes(1)
  })

  it('attached', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      lifetimes: { attached: fn },
      setup() {
        onAttach(injectedFn1)
        onAttach(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('legacy attached', () => {
    const fn = jest.fn()
    defineComponent({
      attached: fn,
      setup() {}
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect(fn).toBeCalledTimes(1)
  })

  it('ready', () => {
    onReady(() => {})
    expect('onReady() hook can only').toHaveBeenWarned()

    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      lifetimes: { ready: fn },
      setup() {
        onReady(injectedFn1)
        onReady(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.lifetimes.ready.call(component)
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('legacy ready', () => {
    const fn = jest.fn()
    defineComponent({
      ready: fn,
      setup() {}
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.lifetimes.ready.call(component)
    expect(fn).toBeCalledTimes(1)
  })

  it('moved', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      lifetimes: { moved: fn },
      setup() {
        onMove(injectedFn1)
        onMove(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.lifetimes.moved.call(component)
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('legacy moved', () => {
    const fn = jest.fn()
    defineComponent({
      moved: fn,
      setup() {}
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.lifetimes.moved.call(component)
    expect(fn).toBeCalledTimes(1)
  })

  it('detached', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      lifetimes: { detached: fn },
      setup() {
        onDetach(injectedFn1)
        onDetach(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.lifetimes.detached.call(component)
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('legacy detached', () => {
    const fn = jest.fn()
    defineComponent({
      detached: fn,
      setup() {}
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.lifetimes.detached.call(component)
    expect(fn).toBeCalledTimes(1)
  })

  it('error', () => {
    const error = new Error()
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      lifetimes: { error: fn },
      setup() {
        onError(injectedFn1)
        onError(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.lifetimes.error.call(component, error)
    expect(fn).toBeCalledWith(error)
    expect(injectedFn1).toBeCalledWith(error)
    expect(injectedFn2).toBeCalledWith(error)
  })

  it('legacy error', () => {
    const error = new Error()
    const fn = jest.fn()
    defineComponent({
      error: fn,
      setup() {}
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.lifetimes.error.call(component, error)
    expect(fn).toBeCalledWith(error)
  })

  it('onLoad', () => {
    const arg = {}
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      methods: { onLoad: fn },
      setup() {
        onLoad(injectedFn1)
        onLoad(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.methods.onLoad.call(component, arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  it('onPullDownRefresh', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      methods: { onPullDownRefresh: fn },
      setup() {
        onPullDownRefresh(injectedFn1)
        onPullDownRefresh(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.methods.onPullDownRefresh.call(component)
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onReachBottom', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      methods: { onReachBottom: fn },
      setup() {
        onReachBottom(injectedFn1)
        onReachBottom(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.methods.onReachBottom.call(component)
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onTabItemTap', () => {
    const arg = {}
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      methods: { onTabItemTap: fn },
      setup() {
        onTabItemTap(injectedFn1)
        onTabItemTap(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.methods.onTabItemTap.call(component, arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  it('onPageScroll', () => {
    onPageScroll(() => {})
    expect('Page specific lifecycle').toHaveBeenWarned()

    defineComponent(() => {
      onPageScroll(() => {})
    })
    component._listenPageScroll = component.methods._listenPageScroll
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect('onPageScroll() hook only').toHaveBeenWarned()

    const arg = {}
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      methods: { onPageScroll: fn },
      setup() {
        onPageScroll(injectedFn1)
        onPageScroll(injectedFn2)
      }
    })
    component._listenPageScroll = component.methods._listenPageScroll
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.methods.onPageScroll.call(component, arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)

    const injectedFn = jest.fn()
    defineComponent(
      () => {
        onPageScroll(injectedFn)
      },
      { listenPageScroll: true }
    )
    component._listenPageScroll = component.methods._listenPageScroll
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.methods.onPageScroll.call(component, arg)
    expect(injectedFn).toBeCalledWith(arg)
  })

  it('onShareAppMessage', () => {
    onShareAppMessage(() => ({}))
    expect('Page specific lifecycle').toHaveBeenWarned()

    defineComponent({
      methods: {
        onShareAppMessage() {
          return {}
        }
      },
      setup() {
        onShareAppMessage(() => ({}))
      }
    })
    component._isInjectedShareHook = component.methods._isInjectedShareHook
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect('onShareAppMessage() hook only').toHaveBeenWarned()

    defineComponent(() => {
      onShareAppMessage(() => ({}))
      onShareAppMessage(() => ({}))
    })
    component._isInjectedShareHook = component.methods._isInjectedShareHook
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    expect('onShareAppMessage() hook can only').toHaveBeenWarned()

    const arg = {}
    const fn = jest.fn(() => ({ title: 'test' }))
    defineComponent(() => {
      onShareAppMessage(fn)
    })
    component._isInjectedShareHook = component.methods._isInjectedShareHook
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    const shareContent = component.methods.onShareAppMessage.call(
      component,
      arg
    )
    expect(fn).toBeCalledWith(arg)
    expect(shareContent).toEqual({ title: 'test' })

    defineComponent(() => {})
    expect(component.methods.onShareAppMessage.call(component, arg)).toEqual({})
  })

  it('onShow', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      pageLifetimes: { show: fn },
      setup() {
        onShow(injectedFn1)
        onShow(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.pageLifetimes.show.call(component)
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onHide', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      pageLifetimes: { hide: fn },
      setup() {
        onHide(injectedFn1)
        onHide(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.pageLifetimes.hide.call(component)
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onResize', () => {
    const arg = {}
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    defineComponent({
      pageLifetimes: { resize: fn },
      setup() {
        onResize(injectedFn1)
        onResize(injectedFn2)
      }
    })
    component.lifetimes.created.call(component)
    component.lifetimes.attached.call(component)
    component.pageLifetimes.resize.call(component, arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  it('inject component lifecycle outside setup', () => {
    onAttach(() => {})
    expect('Component specific lifecycle').toHaveBeenWarned()
  })

  it('no setup', () => {
    const options = {}
    defineComponent(options)
    expect(component).toBeInstanceOf(Object)
  })
})
