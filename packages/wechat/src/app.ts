import type { Bindings, AppInstance } from './instance'
import { setCurrentApp, unsetCurrentApp } from './instance'
import { isFunction, toHiddenField } from './utils'

export type AppSetup = (
  this: void,
  options: WechatMiniprogram.App.LaunchShowOption,
) => Bindings
export type AppOptions<T extends WechatMiniprogram.IAnyObject> = {
  setup?: AppSetup
} & WechatMiniprogram.App.Options<T>
type Options = Record<string, any>

export enum AppLifecycle {
  ON_LAUNCH = 'onLaunch',
  ON_SHOW = 'onShow',
  ON_HIDE = 'onHide',
  ON_ERROR = 'onError',
  ON_PAGE_NOT_FOUND = 'onPageNotFound',
  ON_UNHANDLED_REJECTION = 'onUnhandledRejection',
  ON_THEME_CHANGE = 'onThemeChange',
}

export function createApp(setup: AppSetup): void

export function createApp<T extends WechatMiniprogram.IAnyObject>(
  options: AppOptions<T>,
): void

export function createApp(optionsOrSetup: any): void {
  let setup: AppSetup
  let options: Options
  if (isFunction(optionsOrSetup)) {
    setup = optionsOrSetup
    options = {}
  } else {
    if (optionsOrSetup.setup === undefined) {
      // eslint-disable-next-line new-cap
      App(optionsOrSetup)
      return
    }

    const { setup: setupOption, ...restOptions } = optionsOrSetup
    setup = setupOption
    options = restOptions
  }

  const originOnLaunch = options[AppLifecycle.ON_LAUNCH]
  options[AppLifecycle.ON_LAUNCH] = function (
    this: AppInstance,
    options: WechatMiniprogram.App.LaunchShowOption,
  ) {
    setCurrentApp(this)
    const bindings = setup(options)
    if (bindings !== undefined) {
      Object.keys(bindings).forEach((key) => {
        this[key] = bindings[key]
      })
    }

    unsetCurrentApp()

    if (originOnLaunch !== undefined) {
      originOnLaunch.call(this, options)
    }
  }

  options[AppLifecycle.ON_SHOW] = createLifecycle(options, AppLifecycle.ON_SHOW)
  options[AppLifecycle.ON_HIDE] = createLifecycle(options, AppLifecycle.ON_HIDE)
  options[AppLifecycle.ON_ERROR] = createLifecycle(
    options,
    AppLifecycle.ON_ERROR,
  )
  options[AppLifecycle.ON_PAGE_NOT_FOUND] = createLifecycle(
    options,
    AppLifecycle.ON_PAGE_NOT_FOUND,
  )
  options[AppLifecycle.ON_UNHANDLED_REJECTION] = createLifecycle(
    options,
    AppLifecycle.ON_UNHANDLED_REJECTION,
  )
  options[AppLifecycle.ON_THEME_CHANGE] = createLifecycle(
    options,
    AppLifecycle.ON_THEME_CHANGE,
  )

  // eslint-disable-next-line new-cap
  App(options)
}

function createLifecycle(
  options: Options,
  lifecycle: AppLifecycle,
): (...args: any[]) => void {
  const originLifecycle = options[lifecycle] as Function
  return function (this: AppInstance, ...args: any[]) {
    const hooks = this[toHiddenField(lifecycle)]
    if (hooks) {
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      originLifecycle.call(this, ...args)
    }
  }
}
