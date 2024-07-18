import {
  createApp,
  ref,
  computed,
  watchEffect,
  nextTick,
  onAppShow,
  onAppHide,
  onAppError,
  onPageNotFound,
  onUnhandledRejection,
  onThemeChange,
} from '../src'

// Mocks
let app: Record<string, any>
// @ts-expect-error
global.App = (options: Record<string, any>) => {
  app = options
}

describe('app', () => {
  it('binding', async () => {
    createApp(() => {
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
        increment,
      }
    })
    app.onLaunch()
    expect(app.num).toBe(0)
    expect(app.count.value).toBe(0)
    expect(app.double.value).toBe(0)

    let dummy
    watchEffect(() => {
      dummy = app.count.value
    })
    await nextTick()
    expect(dummy).toBe(0)

    app.increment()
    expect(app.count.value).toBe(1)
    expect(app.double.value).toBe(2)

    await nextTick()
    expect(dummy).toBe(1)
  })

  it('onLaunch', () => {
    const arg = {}
    const onLaunch = vi.fn()
    const setup = vi.fn()
    createApp({ onLaunch, setup })
    app.onLaunch(arg)
    expect(onLaunch).toHaveBeenCalledWith(arg)
    expect(setup).toHaveBeenCalledWith(arg)
  })

  it('onShow', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    createApp({
      onShow: fn,
      setup() {
        onAppShow(injectedFn1)
        onAppShow(injectedFn2)
      },
    })
    app.onLaunch()
    app.onShow(arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)
  })

  it('onHide', () => {
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    createApp({
      onHide: fn,
      setup() {
        onAppHide(injectedFn1)
        onAppHide(injectedFn2)
      },
    })
    app.onLaunch()
    app.onHide()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(injectedFn1).toHaveBeenCalledTimes(1)
    expect(injectedFn2).toHaveBeenCalledTimes(1)
  })

  it('onError', () => {
    const arg = ''
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    createApp({
      onError: fn,
      setup() {
        onAppError(injectedFn1)
        onAppError(injectedFn2)
      },
    })
    app.onLaunch()
    app.onError(arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)
  })

  it('onPageNotFound', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    createApp({
      onPageNotFound: fn,
      setup() {
        onPageNotFound(injectedFn1)
        onPageNotFound(injectedFn2)
      },
    })
    app.onLaunch()
    app.onPageNotFound(arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)
  })

  it('onUnhandledRejection', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    createApp({
      onUnhandledRejection: fn,
      setup() {
        onUnhandledRejection(injectedFn1)
        onUnhandledRejection(injectedFn2)
      },
    })
    app.onLaunch()
    app.onUnhandledRejection(arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)
  })

  it('onThemeChange', () => {
    const arg = {}
    const fn = vi.fn()
    const injectedFn1 = vi.fn()
    const injectedFn2 = vi.fn()
    createApp({
      onThemeChange: fn,
      setup() {
        onThemeChange(injectedFn1)
        onThemeChange(injectedFn2)
      },
    })
    app.onLaunch()
    app.onThemeChange(arg)
    expect(fn).toHaveBeenCalledWith(arg)
    expect(injectedFn1).toHaveBeenCalledWith(arg)
    expect(injectedFn2).toHaveBeenCalledWith(arg)
  })

  it('inject lifecycle outside setup', () => {
    onAppShow(() => {})
    expect('App specific lifecycle').toHaveBeenWarned()
  })

  it('no injected lifecycle', () => {
    const fn = vi.fn()
    createApp({
      onHide: fn,
      setup() {
        return { num: 0 }
      },
    })
    app.onLaunch()
    expect(app.num).toBe(0)

    app.onHide()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('only injected lifecycle', () => {
    const fn = vi.fn()
    createApp(() => {
      onAppHide(fn)
    })
    app.onLaunch()
    app.onHide()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('no setup', () => {
    const options = {}
    createApp(options)
    expect(app).toBeInstanceOf(Object)
  })
})
