import {
  currentApp,
  currentComponent,
  getCurrentInstance,
  AppInstance,
  PageInstance,
  ComponentInstance,
} from './instance'
import { AppLifecycle } from './app'
import { PageLifecycle, Query } from './page'
import { ComponentLifecycle } from './component'
import { toHiddenField } from './utils'

const pageHookWarn =
  'Page specific lifecycle injection APIs can only be used during execution of setup() in definePage() or defineComponent().'

export const onAppShow = createAppHook<
  (options: WechatMiniprogram.App.LaunchShowOption) => unknown
>(AppLifecycle.ON_SHOW)
export const onAppHide = createAppHook(AppLifecycle.ON_HIDE)
export const onAppError = createAppHook<(error: string) => unknown>(
  AppLifecycle.ON_ERROR
)
export const onPageNotFound = createAppHook<
  (options: WechatMiniprogram.App.PageNotFoundOption) => unknown
>(AppLifecycle.ON_PAGE_NOT_FOUND)
export const onUnhandledRejection = createAppHook<
  (options: WechatMiniprogram.OnUnhandledRejectionCallbackResult) => unknown
>(AppLifecycle.ON_UNHANDLED_REJECTION)
export const onThemeChange = createAppHook<
  (options: WechatMiniprogram.OnThemeChangeCallbackResult) => unknown
>(AppLifecycle.ON_THEME_CHANGE)

export const onShow = createPageHook(PageLifecycle.ON_SHOW)
export const onHide = createPageHook(PageLifecycle.ON_HIDE)
export const onUnload = createPageHook(PageLifecycle.ON_UNLOAD)
export const onPullDownRefresh = createPageHook(
  PageLifecycle.ON_PULL_DOWN_REFRESH
)
export const onReachBottom = createPageHook(PageLifecycle.ON_REACH_BOTTOM)
export const onResize = createPageHook<
  (resize: WechatMiniprogram.Page.IResizeOption) => unknown
>(PageLifecycle.ON_RESIZE)
export const onTabItemTap = createPageHook<
  (tap: WechatMiniprogram.Page.ITabItemTapOption) => unknown
>(PageLifecycle.ON_TAB_ITEM_TAP)

export const onPageScroll = (
  hook: (scroll: WechatMiniprogram.Page.IPageScrollOption) => unknown
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else  */
  if (currentInstance) {
    /* istanbul ignore else  */
    if (currentInstance.__listenPageScroll__) {
      injectHook(currentInstance, PageLifecycle.ON_PAGE_SCROLL, hook)
    } else if (__DEV__) {
      console.warn(
        'onPageScroll() hook only works when `listenPageScroll` is configured to true.'
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onShareAppMessage = (
  hook: (
    share: WechatMiniprogram.Page.IShareAppMessageOption
  ) => WechatMiniprogram.Page.ICustomShareContent
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else  */
  if (currentInstance) {
    /* istanbul ignore else  */
    if (
      currentInstance[PageLifecycle.ON_SHARE_APP_MESSAGE] &&
      currentInstance.__isInjectedShareToOthersHook__
    ) {
      const hiddenField = toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)
      /* istanbul ignore else  */
      if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onShareAppMessage() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onShareAppMessage() hook only works when `onShareAppMessage` option is not exist and `canShareToOthers` is configured to true.'
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onShareTimeline = (
  hook: () => WechatMiniprogram.Page.ICustomTimelineContent
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else  */
  if (currentInstance) {
    /* istanbul ignore else  */
    if (
      currentInstance[PageLifecycle.ON_SHARE_TIMELINE] &&
      currentInstance.__isInjectedShareToTimelineHook__
    ) {
      const hiddenField = toHiddenField(PageLifecycle.ON_SHARE_TIMELINE)
      /* istanbul ignore else  */
      if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onShareTimeline() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onShareTimeline() hook only works when `onShareTimeline` option is not exist and `canShareToTimeline` is configured to true.'
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onAddToFavorites = (
  hook: (
    share: WechatMiniprogram.Page.IAddToFavoritesOption
  ) => WechatMiniprogram.Page.IAddToFavoritesContent
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else  */
  if (currentInstance) {
    /* istanbul ignore else  */
    if (currentInstance.__isInjectedFavoritesHook__) {
      const hiddenField = toHiddenField(PageLifecycle.ON_ADD_TO_FAVORITES)
      /* istanbul ignore else  */
      if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onAddToFavorites() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onAddToFavorites() hook only works when `onAddToFavorites` option is not exist.'
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onReady = (hook: () => unknown): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else  */
  if (currentInstance) {
    injectHook(currentInstance, PageLifecycle.ON_READY, hook)
  } else if (__DEV__) {
    console.warn(
      'onReady() hook can only be called during execution of setup() in definePage() or defineComponent().'
    )
  }
}

export const onLoad = createComponentHook<(query: Query) => unknown>(
  PageLifecycle.ON_LOAD
)
export const onMove = createComponentHook(ComponentLifecycle.MOVED)
export const onDetach = createComponentHook(ComponentLifecycle.DETACHED)
export const onError = createComponentHook<(error: Error) => unknown>(
  ComponentLifecycle.ERROR
)

function createAppHook<T extends Function = () => unknown>(
  lifecycle: AppLifecycle
) {
  return (hook: T): void => {
    /* istanbul ignore else  */
    if (currentApp) {
      injectHook(currentApp, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(
        'App specific lifecycle injection APIs can only be used during execution of setup() in createApp().'
      )
    }
  }
}

function createPageHook<T extends Function = () => unknown>(
  lifecycle: PageLifecycle
) {
  return (hook: T): void => {
    const currentInstance = getCurrentInstance()
    /* istanbul ignore else  */
    if (currentInstance) {
      injectHook(currentInstance, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(pageHookWarn)
    }
  }
}

function createComponentHook<T extends Function = () => unknown>(
  lifecycle: PageLifecycle.ON_LOAD | ComponentLifecycle
) {
  return (hook: T): void => {
    /* istanbul ignore else  */
    if (currentComponent) {
      injectHook(currentComponent, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(
        'Component specific lifecycle injection APIs can only be used during execution of setup() in defineComponent().'
      )
    }
  }
}

function injectHook(
  currentInstance: AppInstance | PageInstance | ComponentInstance,
  lifecycle: AppLifecycle | PageLifecycle | ComponentLifecycle,
  hook: Function
): void {
  const hiddenField = toHiddenField(lifecycle)
  if (currentInstance[hiddenField] === undefined) {
    currentInstance[hiddenField] = []
  }

  currentInstance[hiddenField].push(hook)
}
