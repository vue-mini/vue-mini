import {
  defineComponent,
  ref,
  reactive,
  computed,
  readonly,
  watch,
  watchEffect,
  watchPostEffect,
  nextTick,
  isReadonly,
  effectScope,
  onReady,
  onMove,
  onDetach,
  onError,
  onLoad,
  onShow,
  onHide,
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

// Mocks
let component: Record<string, any>
let renderCb: () => void
// @ts-expect-error
global.Component = (options: Record<string, any>) => {
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
    setData(data: Record<string, unknown>, callback: () => void) {
      this.data = this.data || {}
      Object.keys(data).forEach((key) => {
        this.data[key] = data[key]
      })

      renderCb = callback
    },
  }
}

describe('component', () => {
  it('raw binding', () => {
    defineComponent(() => {
      const count = 0
      return { count }
    })
    component.lifetimes.attached.call(component)
    expect(component.data.count).toBe(0)
  })

  it('ref binding', async () => {
    defineComponent(() => {
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
    component.lifetimes.attached.call(component)
    expect(component.data.count).toBe(0)
    expect(component.data.double).toBe(0)
    expect(component.data.add).toBeInstanceOf(Function)

    component.increment()
    await nextTick()
    expect(component.data.count).toBe(1)
    expect(component.data.double).toBe(2)
  })

  it('reactive binding', async () => {
    defineComponent(() => {
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
    component.lifetimes.attached.call(component)
    expect(component.data.state).toEqual({ count: 0, double: 0 })

    component.increment()
    await nextTick()
    expect(component.data.state).toEqual({ count: 1, double: 2 })
  })

  it('readonly binding', () => {
    defineComponent(() => {
      const state = readonly({ count: 0 })
      return { state }
    })
    component.lifetimes.attached.call(component)
    expect(component.data.state).toEqual({ count: 0 })
  })

  it('array binding', async () => {
    defineComponent(() => {
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
    component.lifetimes.attached.call(component)
    expect(component.data.arr).toEqual([0, 0])

    component.increment()
    await nextTick()
    expect(component.data.arr).toEqual([1, 2])
  })

  it('object binding', async () => {
    defineComponent(() => {
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
    component.lifetimes.attached.call(component)
    expect(component.data.obj).toEqual({ count: 0, double: 0 })

    component.increment()
    await nextTick()
    expect(component.data.obj).toEqual({ count: 1, double: 2 })
  })

  it('error binding', () => {
    defineComponent(() => {
      const sym = Symbol('sym')
      return { sym }
    })
    expect(() => {
      component.lifetimes.attached.call(component)
    }).toThrow('Symbol value is not supported')
  })

  it('unbundling', async () => {
    defineComponent(() => {
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
    component.lifetimes.attached.call(component)
    expect(component.__scope__.effects.length).toBe(3)

    component.increment()
    component.lifetimes.detached.call(component)
    await nextTick()
    expect(component.data.count).toBe(0)
    expect(component.data.double).toBe(0)
  })

  it('watch', async () => {
    let dummy: number
    let stopper: () => void
    defineComponent(() => {
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
    component.lifetimes.attached.call(component)
    await nextTick()
    expect(dummy!).toBe(0)
    expect(component.data.count).toBe(0)
    // The other is `count` sync watcher
    expect(component.__scope__.effects.length).toBe(2)

    component.increment()
    await nextTick()
    expect(dummy!).toBe(1)
    expect(component.data.count).toBe(1)

    stopper!()
    stopper!()
    component.increment()
    await nextTick()
    expect(dummy!).toBe(1)
    expect(component.data.count).toBe(2)
    expect(component.__scope__.effects.length).toBe(1)
  })

  it('post watch', async () => {
    let foo: number | undefined
    let bar: number | undefined
    defineComponent(() => {
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
    component.lifetimes.attached.call(component)
    await nextTick()
    expect(foo).toBe(0)
    expect(bar).toBe(undefined)
    expect(component.data.count).toBe(0)

    component.increment()
    await nextTick()
    expect(foo).toBe(0)
    expect(bar).toBe(undefined)
    expect(component.data.count).toBe(1)

    renderCb()
    expect(foo).toBe(1)
    expect(bar).toBe(1)
    expect(component.data.count).toBe(1)
  })

  it('no post watch', async () => {
    defineComponent(() => {
      const count = ref(0)
      const increment = (): void => {
        count.value++
      }

      return {
        count,
        increment,
      }
    })
    component.lifetimes.attached.call(component)
    expect(component.data.count).toBe(0)

    component.increment()
    await nextTick()
    expect(component.data.count).toBe(1)

    renderCb()
    expect(component.data.count).toBe(1)
  })

  it('watch should not register in owner component if created inside detached scope', () => {
    defineComponent(() => {
      effectScope(true).run(() => {
        watch(
          () => 1,
          () => {},
        )
      })
      return {}
    })
    component.lifetimes.attached.call(component)
    expect(component.__scope__.effects.length).toBe(0)
  })

  it('props', async () => {
    defineComponent({
      properties: {
        count: Number,
      },
      setup(props) {
        expect(isReadonly(props)).toBe(true)
        expect(props.count).toBe(0)
        const double = computed(() => props.count * 2)
        return { double }
      },
    })

    component.data = { count: 0 }
    component.observers.count.call(component, component.data.count)
    component.lifetimes.attached.call(component)
    expect(component.data.double).toBe(0)

    component.data.count = 1
    component.observers.count.call(component, component.data.count)
    await nextTick()
    expect(component.data.double).toBe(2)
  })

  it('multiple instances', async () => {
    defineComponent({
      properties: {
        count: Number,
      },
      setup(props) {
        const double = computed(() => props.count * 2)
        return { double }
      },
    })

    const instance1 = Object.create(component)
    const instance2 = Object.create(component)

    instance1.data = { count: 0 }
    instance2.data = { count: 1 }
    instance1.observers.count.call(instance1, instance1.data.count)
    instance2.observers.count.call(instance2, instance2.data.count)
    instance1.lifetimes.attached.call(instance1)
    instance2.lifetimes.attached.call(instance2)
    expect(instance1.data.double).toBe(0)
    expect(instance2.data.double).toBe(2)

    instance1.data.count = 1
    instance2.data.count = 2
    instance1.observers.count.call(instance1, instance1.data.count)
    instance2.observers.count.call(instance2, instance2.data.count)
    await nextTick()
    expect(instance1.data.double).toBe(2)
    expect(instance2.data.double).toBe(4)
  })

  it('observer', () => {
    const fn = vi.fn()
    defineComponent({
      properties: {
        count: Number,
      },
      setup() {},
      observers: {
        count: fn,
      },
    })
    component.data = { count: 0 }
    component.lifetimes.attached.call(component)
    component.observers.count.call(component, component.data.count)
    expect(fn).toHaveBeenCalledWith(0)
  })

  it('context', () => {
    defineComponent((_, context) => {
      expect(context.is).toBe('')
      expect(context.triggerEvent).toBeInstanceOf(Function)
      return { num: 0 }
    })
    component.lifetimes.attached.call(component)
    expect(component.data.num).toBe(0)
  })

  it('attached', () => {
    const fn = vi.fn()
    defineComponent({
      lifetimes: { attached: fn },
      setup() {},
    })
    component.lifetimes.attached.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('legacy attached', () => {
    const fn = vi.fn()
    defineComponent({
      attached: fn,
      setup() {},
    })
    component.lifetimes.attached.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('ready', () => {
    onReady(() => {})
    expect('onReady() hook can only').toHaveBeenWarned()

    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      lifetimes: { ready: fn },
      setup() {
        onReady(injectedFn1)
        onReady(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.lifetimes.ready.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('legacy ready', () => {
    const fn = vi.fn()
    defineComponent({
      ready: fn,
      setup() {},
    })
    component.lifetimes.attached.call(component)
    component.lifetimes.ready.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('moved', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      lifetimes: { moved: fn },
      setup() {
        onMove(injectedFn1)
        onMove(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.lifetimes.moved.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('legacy moved', () => {
    const fn = vi.fn()
    defineComponent({
      moved: fn,
      setup() {},
    })
    component.lifetimes.attached.call(component)
    component.lifetimes.moved.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('detached', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      lifetimes: { detached: fn },
      setup() {
        onDetach(injectedFn1)
        onDetach(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.lifetimes.detached.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('legacy detached', () => {
    const fn = vi.fn()
    defineComponent({
      detached: fn,
      setup() {},
    })
    component.lifetimes.attached.call(component)
    component.lifetimes.detached.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('error', () => {
    const error = new Error('unknown')
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      lifetimes: { error: fn },
      setup() {
        onError(injectedFn1)
        onError(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.lifetimes.error.call(component, error)
    expect(fn).toHaveBeenCalledWith(error)
    expect(injectedFn1).toHaveBeenCalledWith(error)
    expect(injectedFn2).toHaveBeenCalledWith(error)
  })

  it('legacy error', () => {
    const error = new Error('unknown')
    const fn = vi.fn()
    defineComponent({
      error: fn,
      setup() {},
    })
    component.lifetimes.attached.call(component)
    component.lifetimes.error.call(component, error)
    expect(fn).toHaveBeenCalledWith(error)
  })

  it('onLoad', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      methods: { onLoad: fn },
      setup() {
        onLoad(injectedFn1)
        onLoad(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.methods.onLoad.call(component, arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)
  })

  it('onPullDownRefresh', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      methods: { onPullDownRefresh: fn },
      setup() {
        onPullDownRefresh(injectedFn1)
        onPullDownRefresh(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.methods.onPullDownRefresh.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('onReachBottom', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      methods: { onReachBottom: fn },
      setup() {
        onReachBottom(injectedFn1)
        onReachBottom(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.methods.onReachBottom.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('onTabItemTap', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      methods: { onTabItemTap: fn },
      setup() {
        onTabItemTap(injectedFn1)
        onTabItemTap(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.methods.onTabItemTap.call(component, arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)
  })

  it('onPageScroll', () => {
    onPageScroll(() => {})
    expect('Page specific lifecycle').toHaveBeenWarned()

    defineComponent(() => {
      onPageScroll(() => {})
    })
    component.__listenPageScroll__ = component.methods.__listenPageScroll__
    component.lifetimes.attached.call(component)
    expect('onPageScroll() hook only').toHaveBeenWarned()

    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      methods: { onPageScroll: fn },
      setup() {
        onPageScroll(injectedFn1)
        onPageScroll(injectedFn2)
      },
    })
    component.__listenPageScroll__ = component.methods.__listenPageScroll__
    component.lifetimes.attached.call(component)
    component.methods.onPageScroll.call(component, arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)

    const injectedFn = vi.fn()
    defineComponent(
      () => {
        onPageScroll(injectedFn)
      },
      { listenPageScroll: true },
    )
    component.__listenPageScroll__ = component.methods.__listenPageScroll__
    component.lifetimes.attached.call(component)
    component.methods.onPageScroll.call(component, arg)
    expect(injectedFn).toHaveBeenCalledWith(arg)
  })

  it('onShareAppMessage', () => {
    onShareAppMessage(() => ({}))
    expect('Page specific lifecycle').toHaveBeenWarned()

    defineComponent({
      methods: {
        onShareAppMessage() {
          return {}
        },
      },
      setup() {
        onShareAppMessage(() => ({}))
      },
    })
    component.onShareAppMessage = component.methods.onShareAppMessage
    component.__isInjectedShareToOthersHook__ =
      component.methods.__isInjectedShareToOthersHook__
    component.lifetimes.attached.call(component)
    expect('onShareAppMessage() hook only').toHaveBeenWarnedTimes(1)

    defineComponent(() => {
      onShareAppMessage(() => ({}))
    })
    component.onShareAppMessage = component.methods.onShareAppMessage
    component.__isInjectedShareToOthersHook__ =
      component.methods.__isInjectedShareToOthersHook__
    component.lifetimes.attached.call(component)
    expect('onShareAppMessage() hook only').toHaveBeenWarnedTimes(2)

    defineComponent(
      () => {
        onShareAppMessage(() => ({}))
        onShareAppMessage(() => ({}))
      },
      { canShareToOthers: true },
    )
    component.onShareAppMessage = component.methods.onShareAppMessage
    component.__isInjectedShareToOthersHook__ =
      component.methods.__isInjectedShareToOthersHook__
    component.lifetimes.attached.call(component)
    expect('onShareAppMessage() hook can only').toHaveBeenWarned()

    const arg = {}
    const fn = vi.fn(() => ({ title: 'test' }))
    defineComponent(
      () => {
        onShareAppMessage(fn)
      },
      { canShareToOthers: true },
    )
    component.onShareAppMessage = component.methods.onShareAppMessage
    component.__isInjectedShareToOthersHook__ =
      component.methods.__isInjectedShareToOthersHook__
    component.lifetimes.attached.call(component)
    const shareContent = component.methods.onShareAppMessage.call(
      component,
      arg,
    )
    expect(fn).toHaveBeenCalledWith(arg)
    expect(shareContent).toEqual({ title: 'test' })

    defineComponent(() => {}, { canShareToOthers: true })
    expect(component.methods.onShareAppMessage.call(component, arg)).toEqual({})

    defineComponent(() => {})
    expect(component.methods.onShareAppMessage).toBeUndefined()
  })

  it('onShareTimeline', () => {
    onShareTimeline(() => ({}))
    expect('Page specific lifecycle').toHaveBeenWarned()

    defineComponent({
      methods: {
        onShareTimeline() {
          return {}
        },
      },
      setup() {
        onShareTimeline(() => ({}))
      },
    })
    component.onShareTimeline = component.methods.onShareTimeline
    component.__isInjectedShareToTimelineHook__ =
      component.methods.__isInjectedShareToTimelineHook__
    component.lifetimes.attached.call(component)
    expect('onShareTimeline() hook only').toHaveBeenWarnedTimes(1)

    defineComponent(() => {
      onShareTimeline(() => ({}))
    })
    component.onShareTimeline = component.methods.onShareTimeline
    component.__isInjectedShareToTimelineHook__ =
      component.methods.__isInjectedShareToTimelineHook__
    component.lifetimes.attached.call(component)
    expect('onShareTimeline() hook only').toHaveBeenWarnedTimes(2)

    defineComponent(
      () => {
        onShareTimeline(() => ({}))
        onShareTimeline(() => ({}))
      },
      { canShareToTimeline: true },
    )
    component.onShareTimeline = component.methods.onShareTimeline
    component.__isInjectedShareToTimelineHook__ =
      component.methods.__isInjectedShareToTimelineHook__
    component.lifetimes.attached.call(component)
    expect('onShareTimeline() hook can only').toHaveBeenWarned()

    const fn = vi.fn(() => ({ title: 'test' }))
    defineComponent(
      () => {
        onShareTimeline(fn)
      },
      { canShareToTimeline: true },
    )
    component.onShareTimeline = component.methods.onShareTimeline
    component.__isInjectedShareToTimelineHook__ =
      component.methods.__isInjectedShareToTimelineHook__
    component.lifetimes.attached.call(component)
    const shareContent = component.methods.onShareTimeline.call(component)
    expect(fn).toHaveBeenCalledWith()
    expect(shareContent).toEqual({ title: 'test' })

    defineComponent(() => {}, { canShareToTimeline: true })
    expect(component.methods.onShareTimeline.call(component)).toEqual({})

    defineComponent(() => {})
    expect(component.methods.onShareTimeline).toBeUndefined()
  })

  it('onAddToFavorites', () => {
    onAddToFavorites(() => ({}))
    expect('Page specific lifecycle').toHaveBeenWarned()

    defineComponent({
      methods: {
        onAddToFavorites() {
          return {}
        },
      },
      setup() {
        onAddToFavorites(() => ({}))
      },
    })
    component.__isInjectedFavoritesHook__ =
      component.methods.__isInjectedFavoritesHook__
    component.lifetimes.attached.call(component)
    expect('onAddToFavorites() hook only').toHaveBeenWarned()

    defineComponent(() => {
      onAddToFavorites(() => ({}))
      onAddToFavorites(() => ({}))
    })
    component.__isInjectedFavoritesHook__ =
      component.methods.__isInjectedFavoritesHook__
    component.lifetimes.attached.call(component)
    expect('onAddToFavorites() hook can only').toHaveBeenWarned()

    const arg = {}
    const fn = vi.fn(() => ({ title: 'test' }))
    defineComponent(() => {
      onAddToFavorites(fn)
    })
    component.__isInjectedFavoritesHook__ =
      component.methods.__isInjectedFavoritesHook__
    component.lifetimes.attached.call(component)
    const favoritesContent = component.methods.onAddToFavorites.call(
      component,
      arg,
    )
    expect(fn).toHaveBeenCalledWith(arg)
    expect(favoritesContent).toEqual({ title: 'test' })

    defineComponent(() => {})
    expect(component.methods.onAddToFavorites.call(component, arg)).toEqual({})
  })

  it('onSaveExitState', () => {
    onSaveExitState(() => ({ data: undefined }))
    expect('Page specific lifecycle').toHaveBeenWarned()

    defineComponent({
      methods: {
        onSaveExitState() {
          return { data: undefined }
        },
      },
      setup() {
        onSaveExitState(() => ({ data: undefined }))
      },
    })
    component.__isInjectedExitStateHook__ =
      component.methods.__isInjectedExitStateHook__
    component.lifetimes.attached.call(component)
    expect('onSaveExitState() hook only').toHaveBeenWarned()

    defineComponent(() => {
      onSaveExitState(() => ({ data: undefined }))
      onSaveExitState(() => ({ data: undefined }))
    })
    component.__isInjectedExitStateHook__ =
      component.methods.__isInjectedExitStateHook__
    component.lifetimes.attached.call(component)
    expect('onSaveExitState() hook can only').toHaveBeenWarned()

    defineComponent(() => {
      onSaveExitState(() => ({ data: { foo: 'foo' } }))
    })
    component.__isInjectedExitStateHook__ =
      component.methods.__isInjectedExitStateHook__
    component.lifetimes.attached.call(component)
    const exitSate = component.methods.onSaveExitState.call(component)
    expect(exitSate).toEqual({ data: { foo: 'foo' } })

    defineComponent(() => {})
    expect(component.methods.onSaveExitState.call(component)).toEqual({
      data: undefined,
    })
  })

  it('onShow', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      pageLifetimes: { show: fn },
      setup() {
        onShow(injectedFn1)
        onShow(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.pageLifetimes.show.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('onHide', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      pageLifetimes: { hide: fn },
      setup() {
        onHide(injectedFn1)
        onHide(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.pageLifetimes.hide.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('onResize', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      pageLifetimes: { resize: fn },
      setup() {
        onResize(injectedFn1)
        onResize(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.pageLifetimes.resize.call(component, arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)
  })

  it('onRouteDone', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    defineComponent({
      pageLifetimes: { routeDone: fn },
      setup() {
        onRouteDone(injectedFn1)
        onRouteDone(injectedFn2)
      },
    })
    component.lifetimes.attached.call(component)
    component.pageLifetimes.routeDone.call(component)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('inject component lifecycle outside setup', () => {
    onMove(() => {})
    expect('Component specific lifecycle').toHaveBeenWarned()
  })

  it('no setup', () => {
    const options = {}
    defineComponent(options)
    expect(component).toBeInstanceOf(Object)
  })
})
