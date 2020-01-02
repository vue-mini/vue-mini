import { stop } from '@next-vue/reactivity'
import { setCurrentPage, Page } from './instance'
import { deepToRaw, deepWatch } from './shared'
import { isFunction, toHiddenField } from './utils'

export type Query = Record<string, string | undefined>
export type PageContext = WechatMiniprogram.Page.InstanceProperties
export type Bindings = Record<string, any> | void
export type PageOptions<
  RawBindings extends Bindings,
  Data extends WechatMiniprogram.Page.DataOption,
  Custom extends WechatMiniprogram.Page.CustomOption
> = ({ setup: (query: Query, context: PageContext) => RawBindings } & Custom &
  Partial<WechatMiniprogram.Page.Data<Data>> &
  Partial<WechatMiniprogram.Page.ILifetime>) &
  ThisType<WechatMiniprogram.Page.Instance<Data, Custom>>
export interface Config {
  listenPageScroll: boolean
}
export type OutputPageOptions = Record<string, any>

export const enum PageLifecycle {
  ON_LOAD = 'onLoad',
  ON_SHOW = 'onShow',
  ON_READY = 'onReady',
  ON_HIDE = 'onHide',
  ON_UNLOAD = 'onUnload',
  ON_PULL_DOWN_REFRESH = 'onPullDownRefresh',
  ON_REACH_BOTTOM = 'onReachBottom',
  ON_PAGE_SCROLL = 'onPageScroll',
  ON_SHARE_APP_MESSAGE = 'onShareAppMessage',
  ON_RESIZE = 'onResize',
  ON_TAB_ITEM_TAP = 'onTabItemTap'
}

export function createPage<RawBindings extends Bindings>(
  setup: (query: Query, context: PageContext) => RawBindings,
  config?: Config
): OutputPageOptions

export function createPage<
  RawBindings extends Bindings,
  Data extends WechatMiniprogram.Page.DataOption,
  Custom extends WechatMiniprogram.Page.CustomOption
>(
  options: PageOptions<RawBindings, Data, Custom>,
  config?: Config
): OutputPageOptions

export function createPage(
  optionsOrSetup: any,
  config: Config = { listenPageScroll: false }
): OutputPageOptions {
  let setup: (query: Query, context: PageContext) => Bindings
  let options: OutputPageOptions
  if (isFunction(optionsOrSetup)) {
    setup = optionsOrSetup
    options = {}
  } else {
    if (optionsOrSetup.setup === undefined) {
      return optionsOrSetup
    }

    const { setup: setupOption, ...restOptions } = optionsOrSetup
    setup = setupOption
    options = restOptions
  }

  const originOnLoad = options[PageLifecycle.ON_LOAD]
  options[PageLifecycle.ON_LOAD] = function(this: Page, query: Query) {
    setCurrentPage(this)
    const context: PageContext = { is: this.is, route: this.route }
    const bindings = setup(query, context)
    if (bindings !== undefined) {
      Object.keys(bindings).forEach(key => {
        const value = bindings[key]
        if (isFunction(value)) {
          this[key] = value
          return
        }

        this.setData({ [key]: deepToRaw(value) })
        deepWatch.call(this, key, value)
      })
    }

    if (originOnLoad !== undefined) {
      originOnLoad.call(this, query)
    }

    setCurrentPage(null)
  }

  const onUnload = createLifecycle(options, PageLifecycle.ON_UNLOAD)
  options[PageLifecycle.ON_UNLOAD] = function(this: Page) {
    onUnload.call(this)

    if (this._effects) {
      this._effects.forEach(effect => stop(effect))
    }
  }

  if (options[PageLifecycle.ON_PAGE_SCROLL] || config.listenPageScroll) {
    options[PageLifecycle.ON_PAGE_SCROLL] = createLifecycle(
      options,
      PageLifecycle.ON_PAGE_SCROLL
    )
    options._listenPageScroll = () => true
  }

  if (options[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined) {
    options[PageLifecycle.ON_SHARE_APP_MESSAGE] = function(
      this: Page,
      share: WechatMiniprogram.Page.IShareAppMessageOption
    ): WechatMiniprogram.Page.ICustomShareContent {
      const hook = this[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)] as (
        share: WechatMiniprogram.Page.IShareAppMessageOption
      ) => WechatMiniprogram.Page.ICustomShareContent
      if (hook) {
        return hook(share)
      }

      return {}
    }

    options._isInjectedShareHook = () => true
  }

  options[PageLifecycle.ON_SHOW] = createLifecycle(
    options,
    PageLifecycle.ON_SHOW
  )
  options[PageLifecycle.ON_READY] = createLifecycle(
    options,
    PageLifecycle.ON_READY
  )
  options[PageLifecycle.ON_HIDE] = createLifecycle(
    options,
    PageLifecycle.ON_HIDE
  )
  options[PageLifecycle.ON_PULL_DOWN_REFRESH] = createLifecycle(
    options,
    PageLifecycle.ON_PULL_DOWN_REFRESH
  )
  options[PageLifecycle.ON_REACH_BOTTOM] = createLifecycle(
    options,
    PageLifecycle.ON_REACH_BOTTOM
  )
  options[PageLifecycle.ON_RESIZE] = createLifecycle(
    options,
    PageLifecycle.ON_RESIZE
  )
  options[PageLifecycle.ON_TAB_ITEM_TAP] = createLifecycle(
    options,
    PageLifecycle.ON_TAB_ITEM_TAP
  )

  return options
}

function createLifecycle(
  options: OutputPageOptions,
  lifecycle: PageLifecycle
): (...args: any[]) => void {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const originLifecycle = options[lifecycle] as Function
  return function(this: Page, ...args: any[]) {
    const hooks = this[toHiddenField(lifecycle)]
    if (hooks) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      originLifecycle.call(this, ...args)
    }
  }
}
