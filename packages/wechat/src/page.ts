import { stop } from '@vue/reactivity'
import { Bindings, PageInstance, setCurrentPage } from './instance'
import { deepToRaw, deepWatch } from './shared'
import { isFunction, toHiddenField } from './utils'

export type Query = Record<string, string | undefined>
export type PageContext = WechatMiniprogram.Page.InstanceProperties &
  Omit<
    WechatMiniprogram.Page.InstanceMethods<Record<string, any>>,
    | 'setData'
    | 'groupSetData'
    | 'hasBehavior'
    | 'triggerEvent'
    | 'selectOwnerComponent'
    | 'getRelationNodes'
  >
export type PageSetup = (
  this: void,
  query: Query,
  context: PageContext
) => Bindings
export type PageOptions<
  Data extends WechatMiniprogram.Page.DataOption,
  Custom extends WechatMiniprogram.Page.CustomOption
> = { setup?: PageSetup } & WechatMiniprogram.Page.Options<Data, Custom>
export interface Config {
  listenPageScroll?: boolean
  canShareToOthers?: boolean
  canShareToTimeline?: boolean
}
type Options = Record<string, any>

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
  ON_SHARE_TIMELINE = 'onShareTimeline',
  ON_ADD_TO_FAVORITES = 'onAddToFavorites',
  ON_RESIZE = 'onResize',
  ON_TAB_ITEM_TAP = 'onTabItemTap',
}

export function definePage(setup: PageSetup, config?: Config): void

export function definePage<
  Data extends WechatMiniprogram.Page.DataOption,
  Custom extends WechatMiniprogram.Page.CustomOption
>(options: PageOptions<Data, Custom>, config?: Config): void

export function definePage(optionsOrSetup: any, config?: Config): void {
  config = {
    listenPageScroll: false,
    canShareToOthers: false,
    canShareToTimeline: false,
    ...config,
  }
  let setup: PageSetup
  let options: Options
  if (isFunction(optionsOrSetup)) {
    setup = optionsOrSetup
    options = {}
  } else {
    if (optionsOrSetup.setup === undefined) {
      // eslint-disable-next-line new-cap
      return Page(optionsOrSetup)
    }

    const { setup: setupOption, ...restOptions } = optionsOrSetup
    setup = setupOption
    options = restOptions
  }

  const originOnLoad = options[PageLifecycle.ON_LOAD]
  options[PageLifecycle.ON_LOAD] = function (this: PageInstance, query: Query) {
    setCurrentPage(this)
    const context: PageContext = {
      is: this.is,
      route: this.route,
      options: this.options,
      createSelectorQuery: this.createSelectorQuery.bind(this),
      createIntersectionObserver: this.createIntersectionObserver.bind(this),
      selectComponent: this.selectComponent.bind(this),
      selectAllComponents: this.selectAllComponents.bind(this),
      getTabBar: this.getTabBar.bind(this),
      getPageId: this.getPageId.bind(this),
      animate: this.animate.bind(this),
      clearAnimation: this.clearAnimation.bind(this),
      getOpenerEventChannel: this.getOpenerEventChannel.bind(this),
    }
    const bindings = setup(query, context)
    if (bindings !== undefined) {
      Object.keys(bindings).forEach((key) => {
        const value = bindings[key]
        if (isFunction(value)) {
          this[key] = value
          return
        }

        this.setData({ [key]: deepToRaw(value) })
        deepWatch.call(this, key, value)
      })
    }

    setCurrentPage(null)

    if (originOnLoad !== undefined) {
      originOnLoad.call(this, query)
    }
  }

  const onUnload = createLifecycle(options, PageLifecycle.ON_UNLOAD)
  options[PageLifecycle.ON_UNLOAD] = function (this: PageInstance) {
    onUnload.call(this)

    if (this.__effects__) {
      this.__effects__.forEach((effect) => stop(effect))
    }
  }

  if (options[PageLifecycle.ON_PAGE_SCROLL] || config.listenPageScroll) {
    options[PageLifecycle.ON_PAGE_SCROLL] = createLifecycle(
      options,
      PageLifecycle.ON_PAGE_SCROLL
    )
    /* istanbul ignore next */
    options.__listenPageScroll__ = () => true
  }

  if (
    options[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined &&
    config.canShareToOthers
  ) {
    options[PageLifecycle.ON_SHARE_APP_MESSAGE] = function (
      this: PageInstance,
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

    /* istanbul ignore next */
    options.__isInjectedShareToOthersHook__ = () => true
  }

  if (
    options[PageLifecycle.ON_SHARE_TIMELINE] === undefined &&
    config.canShareToTimeline
  ) {
    options[PageLifecycle.ON_SHARE_TIMELINE] = function (
      this: PageInstance
    ): WechatMiniprogram.Page.ICustomTimelineContent {
      const hook = this[
        toHiddenField(PageLifecycle.ON_SHARE_TIMELINE)
      ] as () => WechatMiniprogram.Page.ICustomTimelineContent
      if (hook) {
        return hook()
      }

      return {}
    }

    /* istanbul ignore next */
    options.__isInjectedShareToTimelineHook__ = () => true
  }

  if (options[PageLifecycle.ON_ADD_TO_FAVORITES] === undefined) {
    options[PageLifecycle.ON_ADD_TO_FAVORITES] = function (
      this: PageInstance,
      favorites: WechatMiniprogram.Page.IAddToFavoritesOption
    ): WechatMiniprogram.Page.IAddToFavoritesContent {
      const hook = this[toHiddenField(PageLifecycle.ON_ADD_TO_FAVORITES)] as (
        favorites: WechatMiniprogram.Page.IAddToFavoritesOption
      ) => WechatMiniprogram.Page.IAddToFavoritesContent
      if (hook) {
        return hook(favorites)
      }

      return {}
    }

    /* istanbul ignore next */
    options.__isInjectedFavoritesHook__ = () => true
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

  // eslint-disable-next-line new-cap
  return Page(options)
}

function createLifecycle(
  options: Options,
  lifecycle: PageLifecycle
): (...args: any[]) => void {
  const originLifecycle = options[lifecycle] as Function
  return function (this: PageInstance, ...args: any[]) {
    const hooks = this[toHiddenField(lifecycle)]
    if (hooks) {
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      originLifecycle.call(this, ...args)
    }
  }
}
