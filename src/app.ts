import { Bindings } from './page'
import { setCurrentApp, AppInstance } from './instance'
import { isFunction, toHiddenField } from './utils'

export type AppSetup<RawBindings extends Bindings = Bindings> = (
  this: void,
  options: WechatMiniprogram.App.LaunchShowOption
) => RawBindings
export type AppOptions<
  RawBindings extends Bindings = Bindings,
  Custom extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject
> = WechatMiniprogram.App.Options<Custom> & {
  setup?: AppSetup<RawBindings>
  // Temporary patch for https://github.com/wechat-miniprogram/api-typings/issues/99
  onUnhandledRejection?: (
    options: WechatMiniprogram.OnUnhandledRejectionCallbackResult
  ) => void
}
type Options = Record<string, any>

export const enum AppLifecycle {
  ON_LAUNCH = 'onLaunch',
  ON_SHOW = 'onShow',
  ON_HIDE = 'onHide',
  ON_ERROR = 'onError',
  ON_PAGE_NOT_FOUND = 'onPageNotFound',
  ON_UNHANDLED_REJECTION = 'onUnhandledRejection'
}

export function createApp<RawBindings extends Bindings>(
  setup: AppSetup<RawBindings>
): void

export function createApp<
  RawBindings extends Bindings,
  Custom extends WechatMiniprogram.IAnyObject
>(options: AppOptions<RawBindings, Custom>): void

export function createApp(optionsOrSetup: AppOptions | AppSetup): void {
  let setup: AppSetup
  let options: Options
  if (isFunction(optionsOrSetup)) {
    setup = optionsOrSetup
    options = {}
  } else {
    if (optionsOrSetup.setup === undefined) {
      // eslint-disable-next-line new-cap
      return App(optionsOrSetup)
    }

    const { setup: setupOption, ...restOptions } = optionsOrSetup
    setup = setupOption
    options = restOptions
  }

  const originOnLaunch = options[AppLifecycle.ON_LAUNCH]
  options[AppLifecycle.ON_LAUNCH] = function(
    this: AppInstance,
    options: WechatMiniprogram.App.LaunchShowOption
  ) {
    setCurrentApp(this)
    const bindings = setup(options)
    if (bindings !== undefined) {
      Object.keys(bindings).forEach(key => {
        this[key] = bindings[key]
      })
    }

    setCurrentApp(null)

    if (originOnLaunch !== undefined) {
      originOnLaunch.call(this, options)
    }
  }

  options[AppLifecycle.ON_SHOW] = createLifecycle(options, AppLifecycle.ON_SHOW)
  options[AppLifecycle.ON_HIDE] = createLifecycle(options, AppLifecycle.ON_HIDE)
  options[AppLifecycle.ON_ERROR] = createLifecycle(
    options,
    AppLifecycle.ON_ERROR
  )
  options[AppLifecycle.ON_PAGE_NOT_FOUND] = createLifecycle(
    options,
    AppLifecycle.ON_PAGE_NOT_FOUND
  )
  options[AppLifecycle.ON_UNHANDLED_REJECTION] = createLifecycle(
    options,
    AppLifecycle.ON_UNHANDLED_REJECTION
  )

  // eslint-disable-next-line new-cap
  return App(options)
}

function createLifecycle(
  options: Options,
  lifecycle: AppLifecycle
): (...args: any[]) => void {
  const originLifecycle = options[lifecycle] as Function
  return function(this: AppInstance, ...args: any[]) {
    const hooks = this[toHiddenField(lifecycle)]
    if (hooks) {
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      originLifecycle.call(this, ...args)
    }
  }
}
