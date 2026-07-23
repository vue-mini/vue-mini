import { EffectScope, setCurrentScope } from '@vue/reactivity'
import { flushPostFlushCbs } from './scheduler'
import type { Bindings, PageInstance } from './instance'
import { setCurrentPage, unsetCurrentPage, getLifecycleHooks } from './instance'
import { deepToRaw, deepWatch } from './shared'
import { extend, exclude, isFunction } from './utils'

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
  context: PageContext,
) => Bindings
export type PageOptions<
  Data extends WechatMiniprogram.Page.DataOption,
  Custom extends WechatMiniprogram.Page.CustomOption,
> = { setup?: PageSetup } & WechatMiniprogram.Page.Options<Data, Custom>
export interface Config {
  listenPageScroll?: boolean
  canShareToOthers?: boolean
  canShareToTimeline?: boolean
}
type Options = Record<string, any>

export enum PageLifecycle {
  ON_LOAD = 'onLoad',
  ON_SHOW = 'onShow',
  ON_READY = 'onReady',
  ON_HIDE = 'onHide',
  ON_UNLOAD = 'onUnload',
  ON_ROUTE_DONE = 'onRouteDone',
  ON_PULL_DOWN_REFRESH = 'onPullDownRefresh',
  ON_REACH_BOTTOM = 'onReachBottom',
  ON_PAGE_SCROLL = 'onPageScroll',
  ON_SHARE_APP_MESSAGE = 'onShareAppMessage',
  ON_SHARE_TIMELINE = 'onShareTimeline',
  ON_ADD_TO_FAVORITES = 'onAddToFavorites',
  ON_RESIZE = 'onResize',
  ON_TAB_ITEM_TAP = 'onTabItemTap',
  ON_SAVE_EXIT_STATE = 'onSaveExitState',
}

export function definePage(setup: PageSetup, config?: Config): void

export function definePage<
  Data extends WechatMiniprogram.Page.DataOption,
  Custom extends WechatMiniprogram.Page.CustomOption,
>(options: PageOptions<Data, Custom>, config?: Config): void

export function definePage(optionsOrSetup: any, config?: Config): void {
  config = extend(
    {
      listenPageScroll: false,
      canShareToOthers: false,
      canShareToTimeline: false,
    },
    config,
  )
  let setup: PageSetup
  let options: Options
  if (isFunction(optionsOrSetup)) {
    setup = optionsOrSetup
    options = {}
  } else {
    if (optionsOrSetup.setup === undefined) {
      Page(optionsOrSetup)
      return
    }

    setup = optionsOrSetup.setup
    options = exclude(optionsOrSetup, ['setup'])
  }

  const originOnLoad = options[PageLifecycle.ON_LOAD]
  options[PageLifecycle.ON_LOAD] = function (this: PageInstance, query: Query) {
    this.__v_scope = new EffectScope()
    const scope = setCurrentScope(this.__v_scope)

    const context: PageContext = {
      is: this.is,
      route: this.route,
      options: this.options,
      exitState: this.exitState,
      router: this.router,
      pageRouter: this.pageRouter,
      renderer: this.renderer,
      createSelectorQuery: this.createSelectorQuery.bind(this),
      createIntersectionObserver: this.createIntersectionObserver.bind(this),
      createMediaQueryObserver: this.createMediaQueryObserver.bind(this),
      selectComponent: this.selectComponent.bind(this),
      selectAllComponents: this.selectAllComponents.bind(this),
      getTabBar: this.getTabBar.bind(this),
      getPageId: this.getPageId.bind(this),
      animate: this.animate.bind(this),
      clearAnimation: this.clearAnimation.bind(this),
      getOpenerEventChannel: this.getOpenerEventChannel.bind(this),
      applyAnimatedStyle: this.applyAnimatedStyle.bind(this),
      clearAnimatedStyle: this.clearAnimatedStyle.bind(this),
      setUpdatePerformanceListener:
        this.setUpdatePerformanceListener.bind(this),
      getPassiveEvent: this.getPassiveEvent.bind(this),
      setPassiveEvent: this.setPassiveEvent.bind(this),
      setInitialRenderingCache: this.setInitialRenderingCache.bind(this),
      getAppBar: this.getAppBar && this.getAppBar.bind(this),
    }

    setCurrentPage(this)
    try {
      let bindings: Bindings
      try {
        bindings = setup(query, context)
      } finally {
        unsetCurrentPage()
      }

      if (bindings !== undefined) {
        Object.keys(bindings).forEach((key) => {
          const value = bindings[key]
          if (isFunction(value)) {
            this[key] = value
            return
          }

          this.__v_data = this.__v_data || {}
          this.__v_data[key] = deepToRaw(value)
          deepWatch.call(this, key, value)
        })
        if (this.__v_data !== undefined) {
          // May call sub component's setup synchronously, so should call after unsetCurrentPage()
          this.__v_setData = () => {
            const data = this.__v_data!
            this.__v_data = undefined
            this.setData(data, flushPostFlushCbs)
          }
          this.__v_setData()
        }
      }
    } finally {
      setCurrentScope(scope)
    }

    if (originOnLoad !== undefined) {
      originOnLoad.call(this, query)
    }
  }

  const onUnload = createLifecycle(options, PageLifecycle.ON_UNLOAD)
  options[PageLifecycle.ON_UNLOAD] = function (this: PageInstance) {
    onUnload.call(this)

    this.__v_scope.stop()
  }

  if (options[PageLifecycle.ON_PAGE_SCROLL] || config.listenPageScroll) {
    options[PageLifecycle.ON_PAGE_SCROLL] = createLifecycle(
      options,
      PageLifecycle.ON_PAGE_SCROLL,
    )
    /* istanbul ignore next -- @preserve */
    options.__v_listenPageScroll = () => true
  }

  if (
    options[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined &&
    config.canShareToOthers
  ) {
    options[PageLifecycle.ON_SHARE_APP_MESSAGE] = createReturnLifecycle(
      PageLifecycle.ON_SHARE_APP_MESSAGE,
      () => ({}),
    )

    /* istanbul ignore next -- @preserve */
    options.__v_isInjectedShareToOthersHook = () => true
  }

  if (
    options[PageLifecycle.ON_SHARE_TIMELINE] === undefined &&
    config.canShareToTimeline
  ) {
    options[PageLifecycle.ON_SHARE_TIMELINE] = createReturnLifecycle(
      PageLifecycle.ON_SHARE_TIMELINE,
      () => ({}),
    )

    /* istanbul ignore next -- @preserve */
    options.__v_isInjectedShareToTimelineHook = () => true
  }

  if (options[PageLifecycle.ON_ADD_TO_FAVORITES] === undefined) {
    options[PageLifecycle.ON_ADD_TO_FAVORITES] = createReturnLifecycle(
      PageLifecycle.ON_ADD_TO_FAVORITES,
      () => ({}),
    )

    /* istanbul ignore next -- @preserve */
    options.__v_isInjectedFavoritesHook = () => true
  }

  if (options[PageLifecycle.ON_SAVE_EXIT_STATE] === undefined) {
    options[PageLifecycle.ON_SAVE_EXIT_STATE] = createReturnLifecycle(
      PageLifecycle.ON_SAVE_EXIT_STATE,
      () => ({ data: undefined }),
    )

    /* istanbul ignore next -- @preserve */
    options.__v_isInjectedExitStateHook = () => true
  }

  options[PageLifecycle.ON_SHOW] = createLifecycle(
    options,
    PageLifecycle.ON_SHOW,
  )
  options[PageLifecycle.ON_READY] = createLifecycle(
    options,
    PageLifecycle.ON_READY,
  )
  options[PageLifecycle.ON_HIDE] = createLifecycle(
    options,
    PageLifecycle.ON_HIDE,
  )
  options[PageLifecycle.ON_ROUTE_DONE] = createLifecycle(
    options,
    PageLifecycle.ON_ROUTE_DONE,
  )
  options[PageLifecycle.ON_PULL_DOWN_REFRESH] = createLifecycle(
    options,
    PageLifecycle.ON_PULL_DOWN_REFRESH,
  )
  options[PageLifecycle.ON_REACH_BOTTOM] = createLifecycle(
    options,
    PageLifecycle.ON_REACH_BOTTOM,
  )
  options[PageLifecycle.ON_RESIZE] = createLifecycle(
    options,
    PageLifecycle.ON_RESIZE,
  )
  options[PageLifecycle.ON_TAB_ITEM_TAP] = createLifecycle(
    options,
    PageLifecycle.ON_TAB_ITEM_TAP,
  )

  Page(options)
}

function createLifecycle(
  options: Options,
  lifecycle: PageLifecycle,
): (...args: any[]) => void {
  const originLifecycle = options[lifecycle] as Function
  return function (this: PageInstance, ...args: any[]) {
    getLifecycleHooks(this, lifecycle).forEach((hook) => hook(...args))

    if (originLifecycle !== undefined) {
      originLifecycle.call(this, ...args)
    }
  }
}

function createReturnLifecycle(
  lifecycle: PageLifecycle,
  getDefaultValue: () => any,
): (...args: any[]) => any {
  return function (this: PageInstance, ...args: any[]) {
    const [hook] = getLifecycleHooks(this, lifecycle)
    if (hook) {
      return hook(...args)
    }

    return getDefaultValue()
  }
}
