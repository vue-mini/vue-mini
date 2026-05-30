import {
  definePage,
  ref,
  reactive,
  computed,
  readonly,
  watch,
  watchEffect,
  watchPostEffect,
  nextTick,
  effectScope,
  dataFn,
  onReady,
  onShow,
  onHide,
  onUnload,
  onRouteDone,
  onPullDownRefresh,
  onReachBottom,
  onResize,
  onTabItemTap,
  onPageScroll,
  onShareAppMessage,
  onShareTimeline,
  onAddToFavorites,
  onSaveExitState,
} from '../src'
import { getEffectsCount } from './utils'

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

describe('page', () => {
  it('raw binding', () => {
    definePage(() => {
      const count = 0
      return { count }
    })
    page.onLoad()
    expect(page.data.count).toBe(0)
  })

  it('ref binding', async () => {
    definePage(() => {
      const count = ref(0)
      const double = computed(() => count.value * 2)
      const increment = (): void => {
        count.value++
      }

      const add = ref(increment)

      return {
        add,
        count,
        double,
        increment,
      }
    })
    page.onLoad()
    expect(page.data.count).toBe(0)
    expect(page.data.double).toBe(0)
    expect(page.data.add).toBeInstanceOf(Function)

    page.increment()
    await nextTick()
    expect(page.data.count).toBe(1)
    expect(page.data.double).toBe(2)
  })

  it('reactive binding', async () => {
    definePage(() => {
      const state: { count: number; double: number } = reactive({
        count: 0,
        double: computed(() => state.count * 2),
      })
      const increment = (): void => {
        state.count++
      }

      return {
        state,
        increment,
      }
    })
    page.onLoad()
    expect(page.data.state).toEqual({ count: 0, double: 0 })

    page.increment()
    await nextTick()
    expect(page.data.state).toEqual({ count: 1, double: 2 })
  })

  it('readonly binding', () => {
    definePage(() => {
      const state = readonly({ count: 0 })
      return { state }
    })
    page.onLoad()
    expect(page.data.state).toEqual({ count: 0 })
  })

  it('array binding', async () => {
    definePage(() => {
      const count = ref(0)
      const double = computed(() => count.value * 2)
      const increment = (): void => {
        count.value++
      }

      return {
        arr: [count, double],
        increment,
      }
    })
    page.onLoad()
    expect(page.data.arr).toEqual([0, 0])

    page.increment()
    await nextTick()
    expect(page.data.arr).toEqual([1, 2])
  })

  it('object binding', async () => {
    definePage(() => {
      const count = ref(0)
      const double = computed(() => count.value * 2)
      const increment = (): void => {
        count.value++
      }

      return {
        obj: { count, double },
        increment,
      }
    })
    page.onLoad()
    expect(page.data.obj).toEqual({ count: 0, double: 0 })

    page.increment()
    await nextTick()
    expect(page.data.obj).toEqual({ count: 1, double: 2 })
  })

  it('data function binding', async () => {
    definePage(() => {
      const plus = dataFn((a: number, b: number) => a + b)
      return { plus }
    })
    page.onLoad()
    expect(page.data.plus(0, 1)).toBe(1)
    expect(page.data.plus(1, 1)).toBe(2)
    expect(getEffectsCount(page.__scope__)).toBe(2)
    page.onUnload()
    expect(getEffectsCount(page.__scope__)).toBe(0)

    definePage(() => {
      const count = ref(0)

      const add = dataFn((num: number) => count.value + num)

      const increment = (): void => {
        count.value++
      }

      return { add, increment }
    })
    page.setData = vi.fn(page.setData)
    page.onLoad()
    expect(page.setData).toHaveBeenCalledTimes(1)
    expect(page.data.add(1)).toBe(1)
    page.increment()
    await nextTick()
    expect(page.setData).toHaveBeenCalledTimes(2)
    expect(page.data.add(1)).toBe(2)
    page.increment()
    await nextTick()
    expect(page.setData).toHaveBeenCalledTimes(3)
    expect(page.data.add(1)).toBe(3)
  })

  it('error binding', () => {
    definePage(() => {
      const sym = Symbol('sym')
      return { sym }
    })
    expect(() => page.onLoad()).toThrow('Symbol value is not supported')
  })

  it('unbundling', async () => {
    definePage(() => {
      const count = ref(0)
      const double = computed(() => count.value * 2)
      const increment = (): void => {
        count.value++
      }

      return {
        count,
        double,
        increment,
      }
    })
    page.onLoad()
    expect(getEffectsCount(page.__scope__)).toBe(2)

    page.increment()
    page.onUnload()
    await nextTick()
    expect(page.data.count).toBe(0)
    expect(page.data.double).toBe(0)
    expect(getEffectsCount(page.__scope__)).toBe(0)
  })

  it('should batch multiple state changes into a single setData call with only changed keys', async () => {
    definePage(() => {
      const state1 = ref(0)
      const state2 = ref(0)
      const state3 = ref(0)

      const increment = () => {
        state2.value++
        state2.value++
        state3.value++
      }

      return { state1, state2, state3, increment }
    })

    page.setData = vi.fn(function (this: any, data: Record<string, unknown>) {
      this.data = this.data || {}
      Object.keys(data).forEach((key) => {
        this.data[key] = data[key]
      })
    })

    page.onLoad()
    expect(page.data).toEqual({ state1: 0, state2: 0, state3: 0 })
    expect(page.setData).toHaveBeenCalledTimes(1)
    expect(page.setData).toHaveBeenCalledWith(
      { state1: 0, state2: 0, state3: 0 },
      expect.any(Function),
    )

    page.increment()
    await nextTick()
    expect(page.data).toEqual({ state1: 0, state2: 2, state3: 1 })
    expect(page.setData).toHaveBeenCalledTimes(2)
    expect(page.setData).toHaveBeenLastCalledWith(
      { state2: 2, state3: 1 },
      expect.any(Function),
    )
  })

  it('watch', async () => {
    let dummy: number
    let stopper: () => void
    definePage(() => {
      const count = ref(0)
      const increment = (): void => {
        count.value++
      }

      stopper = watchEffect(() => {
        dummy = count.value
      })
      return {
        count,
        increment,
      }
    })
    page.onLoad()
    await nextTick()
    expect(dummy!).toBe(0)
    expect(page.data.count).toBe(0)
    // The other is `count` sync watcher
    expect(getEffectsCount(page.__scope__)).toBe(2)

    page.increment()
    await nextTick()
    expect(dummy!).toBe(1)
    expect(page.data.count).toBe(1)

    stopper!()
    stopper!()
    page.increment()
    await nextTick()
    expect(dummy!).toBe(1)
    expect(page.data.count).toBe(2)
    expect(getEffectsCount(page.__scope__)).toBe(1)
  })

  it('post watch', async () => {
    let foo: number | undefined
    let bar: number | undefined
    definePage(() => {
      const count = ref(0)
      const increment = (): void => {
        count.value++
      }

      watchPostEffect(() => {
        foo = count.value
      })

      watch(
        count,
        () => {
          bar = count.value
        },
        { flush: 'post' },
      )

      return {
        count,
        increment,
      }
    })
    page.onLoad()
    await nextTick()
    expect(foo).toBe(undefined)
    expect(bar).toBe(undefined)
    expect(page.data.count).toBe(0)

    renderCb()
    expect(foo).toBe(0)
    expect(bar).toBe(undefined)
    expect(page.data.count).toBe(0)

    page.increment()
    await nextTick()
    expect(foo).toBe(0)
    expect(bar).toBe(undefined)
    expect(page.data.count).toBe(1)

    renderCb()
    expect(foo).toBe(1)
    expect(bar).toBe(1)
    expect(page.data.count).toBe(1)
  })

  it('no post watch', async () => {
    definePage(() => {
      const count = ref(0)
      const increment = (): void => {
        count.value++
      }

      return {
        count,
        increment,
      }
    })
    page.onLoad()
    expect(page.data.count).toBe(0)

    page.increment()
    await nextTick()
    expect(page.data.count).toBe(1)

    renderCb()
    expect(page.data.count).toBe(1)
  })

  it('watch should not register in owner page if created inside detached scope', () => {
    definePage(() => {
      effectScope(true).run(() => {
        watch(
          () => 1,
          () => {},
        )
      })
      return {}
    })
    page.onLoad()
    expect(getEffectsCount(page.__scope__)).toBe(0)
  })

  it('onLoad', () => {
    const arg = {}
    const onLoad = vi.fn()
    const setup = vi.fn((query, context) => {
      expect(query).toBe(arg)
      expect(context.is).toBe('')
      expect(context.getOpenerEventChannel).toBeInstanceOf(Function)
      expect(context.getAppBar).toBe(undefined)
    })
    definePage({ onLoad, setup })
    page.onLoad(arg)
    expect(onLoad).toBeCalledWith(arg)
    expect(setup).toBeCalledTimes(1)
  })

  it('context: high library version', () => {
    definePage((_, context) => {
      expect(context.getAppBar).toBeInstanceOf(Function)
    })
    const extendedPage = { ...page, getAppBar() {} }
    // @ts-expect-error
    extendedPage.onLoad()
  })

  it('onReady', () => {
    onReady(() => {})
    expect('onReady() hook can only').toHaveBeenWarned()

    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onReady: fn,
      setup() {
        onReady(injectedFn1)
        onReady(injectedFn2)
      },
    })
    page.onLoad()
    page.onReady()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onShow', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onShow: fn,
      setup() {
        onShow(injectedFn1)
        onShow(injectedFn2)
      },
    })
    page.onLoad()
    page.onShow()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onHide', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onHide: fn,
      setup() {
        onHide(injectedFn1)
        onHide(injectedFn2)
      },
    })
    page.onLoad()
    page.onHide()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onUnload', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onUnload: fn,
      setup() {
        onUnload(injectedFn1)
        onUnload(injectedFn2)
      },
    })
    page.onLoad()
    page.onUnload()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onRouteDone', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onRouteDone: fn,
      setup() {
        onRouteDone(injectedFn1)
        onRouteDone(injectedFn2)
      },
    })
    page.onLoad()
    page.onRouteDone()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onPullDownRefresh', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onPullDownRefresh: fn,
      setup() {
        onPullDownRefresh(injectedFn1)
        onPullDownRefresh(injectedFn2)
      },
    })
    page.onLoad()
    page.onPullDownRefresh()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onReachBottom', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onReachBottom: fn,
      setup() {
        onReachBottom(injectedFn1)
        onReachBottom(injectedFn2)
      },
    })
    page.onLoad()
    page.onReachBottom()
    expect(fn).toBeCalledTimes(1)
    expect(injectedFn1).toBeCalledTimes(1)
    expect(injectedFn2).toBeCalledTimes(1)
  })

  it('onResize', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onResize: fn,
      setup() {
        onResize(injectedFn1)
        onResize(injectedFn2)
      },
    })
    page.onLoad()
    page.onResize(arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  it('onTabItemTap', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onTabItemTap: fn,
      setup() {
        onTabItemTap(injectedFn1)
        onTabItemTap(injectedFn2)
      },
    })
    page.onLoad()
    page.onTabItemTap(arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)
  })

  it('onPageScroll', () => {
    onPageScroll(() => {})
    expect('Page specific lifecycle').toHaveBeenWarned()

    definePage(() => {
      onPageScroll(() => {})
    })
    page.onLoad()
    expect('onPageScroll() hook only').toHaveBeenWarned()

    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    definePage({
      onPageScroll: fn,
      setup() {
        onPageScroll(injectedFn1)
        onPageScroll(injectedFn2)
      },
    })
    page.onLoad()
    page.onPageScroll(arg)
    expect(fn).toBeCalledWith(arg)
    expect(injectedFn1).toBeCalledWith(arg)
    expect(injectedFn2).toBeCalledWith(arg)

    const injectedFn = vi.fn()
    definePage(
      () => {
        onPageScroll(injectedFn)
      },
      { listenPageScroll: true },
    )
    page.onLoad()
    page.onPageScroll(arg)
    expect(injectedFn).toBeCalledWith(arg)

    definePage(() => {})
    expect(page.onPageScroll).toBeUndefined()
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
      },
    })
    page.onLoad()
    expect('onShareAppMessage() hook only').toHaveBeenWarnedTimes(1)

    definePage(() => {
      onShareAppMessage(() => ({}))
    })
    page.onLoad()
    expect('onShareAppMessage() hook only').toHaveBeenWarnedTimes(2)

    definePage(
      () => {
        onShareAppMessage(() => ({}))
        onShareAppMessage(() => ({}))
      },
      { canShareToOthers: true },
    )
    page.onLoad()
    expect('onShareAppMessage() hook can only').toHaveBeenWarned()

    const arg = {}
    const fn = vi.fn(() => ({ title: 'test' }))
    definePage(
      () => {
        onShareAppMessage(fn)
      },
      { canShareToOthers: true },
    )
    page.onLoad()
    const shareContent = page.onShareAppMessage(arg)
    expect(fn).toBeCalledWith(arg)
    expect(shareContent).toEqual({ title: 'test' })

    definePage(() => {}, { canShareToOthers: true })
    expect(page.onShareAppMessage(arg)).toEqual({})

    definePage(() => {})
    expect(page.onShareAppMessage).toBeUndefined()
  })

  it('onShareTimeline', () => {
    onShareTimeline(() => ({}))
    expect('Page specific lifecycle').toHaveBeenWarned()

    definePage({
      onShareTimeline() {
        return {}
      },
      setup() {
        onShareTimeline(() => ({}))
      },
    })
    page.onLoad()
    expect('onShareTimeline() hook only').toHaveBeenWarnedTimes(1)

    definePage(() => {
      onShareTimeline(() => ({}))
    })
    page.onLoad()
    expect('onShareTimeline() hook only').toHaveBeenWarnedTimes(2)

    definePage(
      () => {
        onShareTimeline(() => ({}))
        onShareTimeline(() => ({}))
      },
      { canShareToTimeline: true },
    )
    page.onLoad()
    expect('onShareTimeline() hook can only').toHaveBeenWarned()

    const fn = vi.fn(() => ({ title: 'test' }))
    definePage(
      () => {
        onShareTimeline(fn)
      },
      { canShareToTimeline: true },
    )
    page.onLoad()
    const shareContent = page.onShareTimeline()
    expect(fn).toBeCalledWith()
    expect(shareContent).toEqual({ title: 'test' })

    definePage(() => {}, { canShareToTimeline: true })
    expect(page.onShareTimeline()).toEqual({})

    definePage(() => {})
    expect(page.onShareTimeline).toBeUndefined()
  })

  it('onAddToFavorites', () => {
    onAddToFavorites(() => ({}))
    expect('Page specific lifecycle').toHaveBeenWarned()

    definePage({
      onAddToFavorites() {
        return {}
      },
      setup() {
        onAddToFavorites(() => ({}))
      },
    })
    page.onLoad()
    expect('onAddToFavorites() hook only').toHaveBeenWarned()

    definePage(() => {
      onAddToFavorites(() => ({}))
      onAddToFavorites(() => ({}))
    })
    page.onLoad()
    expect('onAddToFavorites() hook can only').toHaveBeenWarned()

    const arg = {}
    const fn = vi.fn(() => ({ title: 'test' }))
    definePage(() => {
      onAddToFavorites(fn)
    })
    page.onLoad()
    const favoritesContent = page.onAddToFavorites(arg)
    expect(fn).toBeCalledWith(arg)
    expect(favoritesContent).toEqual({ title: 'test' })

    definePage(() => {})
    expect(page.onAddToFavorites(arg)).toEqual({})
  })

  it('onSaveExitState', () => {
    onSaveExitState(() => ({ data: undefined }))
    expect('Page specific lifecycle').toHaveBeenWarned()

    definePage({
      onSaveExitState() {
        return { data: undefined }
      },
      setup() {
        onSaveExitState(() => ({ data: undefined }))
      },
    })
    page.onLoad()
    expect('onSaveExitState() hook only').toHaveBeenWarned()

    definePage(() => {
      onSaveExitState(() => ({ data: undefined }))
      onSaveExitState(() => ({ data: undefined }))
    })
    page.onLoad()
    expect('onSaveExitState() hook can only').toHaveBeenWarned()

    definePage(() => {
      onSaveExitState(() => ({ data: { foo: 'foo' } }))
    })
    page.onLoad()
    const exitState = page.onSaveExitState()
    expect(exitState).toEqual({ data: { foo: 'foo' } })

    definePage(() => {})
    expect(page.onSaveExitState()).toEqual({ data: undefined })
  })

  it('inject lifecycle outside setup', () => {
    onShow(() => {})
    expect('Page specific lifecycle').toHaveBeenWarned()
  })

  it('no setup', () => {
    const options = {}
    definePage(options)
    expect(page).toBeInstanceOf(Object)
  })
})
