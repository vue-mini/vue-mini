import {
  definePage,
  ref,
  computed,
  nextTick,
  onReady,
  onShow,
  onHide,
  onUnload,
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
      Page: (options: Record<string, any>) => void
    }
  }
}
let page: Record<string, any>
global.Page = (options: Record<string, any>) => {
  page = options
}

describe('page', () => {
  mockWarn()

  it('binding', async () => {
    definePage(() => {
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
    page.setData = function(data: Record<string, unknown>) {
      this.data = this.data || {}
      Object.keys(data).forEach(key => {
        this.data[key] = data[key]
      })
    }

    page.onLoad()
    expect(page.data.num).toBe(0)
    expect(page.data.count).toBe(0)
    expect(page.data.double).toBe(0)

    page.increment()
    await nextTick()
    expect(page.data.count).toBe(1)
    expect(page.data.double).toBe(2)

    page.onUnload()
    page.increment()
    await nextTick()
    expect(page.data.count).toBe(1)
    expect(page.data.double).toBe(2)
  })

  it('onLoad', () => {
    const arg = {}
    const onLoad = jest.fn()
    const setup = jest.fn()
    definePage({ onLoad, setup })
    page.is = 'is'
    page.route = 'route'
    page.onLoad(arg)
    expect(onLoad).toBeCalledWith(arg)
    expect(setup).toBeCalledWith(arg, { is: 'is', route: 'route' })
  })

  it('onReady', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onReady: fn,
      setup() {
        onReady(injectedFn1)
        onReady(injectedFn2)
      }
    })
    page.onLoad()
    page.onReady()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onShow', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onShow: fn,
      setup() {
        onShow(injectedFn1)
        onShow(injectedFn2)
      }
    })
    page.onLoad()
    page.onShow()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onHide', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onHide: fn,
      setup() {
        onHide(injectedFn1)
        onHide(injectedFn2)
      }
    })
    page.onLoad()
    page.onHide()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onUnload', async () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onUnload: fn,
      setup() {
        onUnload(injectedFn1)
        onUnload(injectedFn2)
      }
    })
    page.onLoad()
    page.onUnload()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onPullDownRefresh', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onPullDownRefresh: fn,
      setup() {
        onPullDownRefresh(injectedFn1)
        onPullDownRefresh(injectedFn2)
      }
    })
    page.onLoad()
    page.onPullDownRefresh()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onReachBottom', () => {
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onReachBottom: fn,
      setup() {
        onReachBottom(injectedFn1)
        onReachBottom(injectedFn2)
      }
    })
    page.onLoad()
    page.onReachBottom()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onResize', () => {
    const arg = {}
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onResize: fn,
      setup() {
        onResize(injectedFn1)
        onResize(injectedFn2)
      }
    })
    page.onLoad()
    page.onResize(arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  it('onTabItemTap', () => {
    const arg = {}
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onTabItemTap: fn,
      setup() {
        onTabItemTap(injectedFn1)
        onTabItemTap(injectedFn2)
      }
    })
    page.onLoad()
    page.onTabItemTap(arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  it('onPageScroll', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onPageScroll(() => {})
    expect('Page specific lifecycle').toHaveBeenWarned()

    definePage(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onPageScroll(() => {})
    })
    page.onLoad()
    expect('onPageScroll() hook only').toHaveBeenWarned()

    const arg = {}
    const fn = jest.fn()
    const injectedFn1 = jest.fn()
    const injectedFn2 = jest.fn()
    definePage({
      onPageScroll: fn,
      setup() {
        onPageScroll(injectedFn1)
        onPageScroll(injectedFn2)
      }
    })
    page.onLoad()
    page.onPageScroll(arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)

    const injectedFn = jest.fn()
    definePage(
      () => {
        onPageScroll(injectedFn)
      },
      { listenPageScroll: true }
    )
    page.onLoad()
    page.onPageScroll(arg)
    expect(injectedFn).toBeCalledWith(arg)
  })

  it('onShareAppMessage', () => {
    onShareAppMessage(() => ({}))
    expect('Page specific lifecycle').toHaveBeenWarned()

    definePage({
      onShareAppMessage() {
        return {}
      },
      setup() {
        onShareAppMessage(() => ({}))
      }
    })
    page.onLoad()
    expect('onShareAppMessage() hook only').toHaveBeenWarned()

    definePage(() => {
      onShareAppMessage(() => ({}))
      onShareAppMessage(() => ({}))
    })
    page.onLoad()
    expect('onShareAppMessage() hook can only').toHaveBeenWarned()

    const arg = {}
    const fn = jest.fn(() => ({ title: 'test' }))
    definePage(() => {
      onShareAppMessage(fn)
    })
    page.onLoad()
    const shareContent = page.onShareAppMessage(arg)
    expect(fn).toBeCalledWith(arg)
    expect(shareContent).toEqual({ title: 'test' })

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    definePage(() => {})
    expect(page.onShareAppMessage(arg)).toEqual({})
  })

  it('no setup', () => {
    const options = {}
    definePage(options)
    expect(page).toBe(options)
  })
})
