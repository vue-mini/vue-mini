import type { AppInstance, PageInstance, ComponentInstance } from './instance'
import { currentApp, currentComponent, getCurrentInstance } from './instance'
import { AppLifecycle } from './app'
import type { Query } from './page'
import { PageLifecycle } from './page'
import { ComponentLifecycle } from './component'
import { toHiddenField } from './utils'

const pageHookWarn =
  'Page specific lifecycle injection APIs can only be used during execution of setup() in definePage() or defineComponent().'

export const onAppShow: (
  hook: (options: WechatMiniprogram.App.LaunchShowOption) => unknown,
) => void = createAppHook(AppLifecycle.ON_SHOW)
export const onAppHide: (hook: () => unknown) => void = createAppHook(
  AppLifecycle.ON_HIDE,
)
export const onAppError: (hook: (error: string) => unknown) => void =
  createAppHook(AppLifecycle.ON_ERROR)
export const onPageNotFound: (
  hook: (options: WechatMiniprogram.App.PageNotFoundOption) => unknown,
) => void = createAppHook(AppLifecycle.ON_PAGE_NOT_FOUND)
export const onUnhandledRejection: (
  hook: (
    options: WechatMiniprogram.OnUnhandledRejectionListenerResult,
  ) => unknown,
) => void = createAppHook(AppLifecycle.ON_UNHANDLED_REJECTION)
export const onThemeChange: (
  hook: (options: WechatMiniprogram.OnThemeChangeListenerResult) => unknown,
) => void = createAppHook(AppLifecycle.ON_THEME_CHANGE)

export const onShow: (hook: () => unknown) => void = createPageHook(
  PageLifecycle.ON_SHOW,
)
export const onHide: (hook: () => unknown) => void = createPageHook(
  PageLifecycle.ON_HIDE,
)
export const onUnload: (hook: () => unknown) => void = createPageHook(
  PageLifecycle.ON_UNLOAD,
)
export const onRouteDone: (hook: () => unknown) => void = createPageHook(
  PageLifecycle.ON_ROUTE_DONE,
)
export const onPullDownRefresh: (hook: () => unknown) => void = createPageHook(
  PageLifecycle.ON_PULL_DOWN_REFRESH,
)
export const onReachBottom: (hook: () => unknown) => void = createPageHook(
  PageLifecycle.ON_REACH_BOTTOM,
)
export const onResize: (
  hook: (resize: WechatMiniprogram.Page.IResizeOption) => unknown,
) => void = createPageHook(PageLifecycle.ON_RESIZE)
export const onTabItemTap: (
  hook: (tap: WechatMiniprogram.Page.ITabItemTapOption) => unknown,
) => void = createPageHook(PageLifecycle.ON_TAB_ITEM_TAP)

export const onPageScroll = (
  hook: (scroll: WechatMiniprogram.Page.IPageScrollOption) => unknown,
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else -- @preserve  */
  if (currentInstance) {
    /* istanbul ignore else -- @preserve   */
    if (currentInstance.__listenPageScroll__) {
      injectHook(currentInstance, PageLifecycle.ON_PAGE_SCROLL, hook)
    } else if (__DEV__) {
      console.warn(
        'onPageScroll() hook only works when `listenPageScroll` is configured to true.',
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onShareAppMessage = (
  hook: (
    share: WechatMiniprogram.Page.IShareAppMessageOption,
  ) =>
    | WechatMiniprogram.Page.ICustomShareContent
    | WechatMiniprogram.Page.IAsyncCustomShareContent
    | Promise<WechatMiniprogram.Page.ICustomShareContent>
    | void
    | Promise<void>,
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else -- @preserve  */
  if (currentInstance) {
    /* istanbul ignore else -- @preserve  */
    if (
      currentInstance[PageLifecycle.ON_SHARE_APP_MESSAGE] &&
      currentInstance.__isInjectedShareToOthersHook__
    ) {
      const hiddenField = toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)
      /* istanbul ignore else -- @preserve  */
      if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onShareAppMessage() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onShareAppMessage() hook only works when `onShareAppMessage` option is not exist and `canShareToOthers` is configured to true.',
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onShareTimeline = (
  hook: () => WechatMiniprogram.Page.ICustomTimelineContent | void,
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else -- @preserve  */
  if (currentInstance) {
    /* istanbul ignore else -- @preserve  */
    if (
      currentInstance[PageLifecycle.ON_SHARE_TIMELINE] &&
      currentInstance.__isInjectedShareToTimelineHook__
    ) {
      const hiddenField = toHiddenField(PageLifecycle.ON_SHARE_TIMELINE)
      /* istanbul ignore else -- @preserve  */
      if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onShareTimeline() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onShareTimeline() hook only works when `onShareTimeline` option is not exist and `canShareToTimeline` is configured to true.',
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onAddToFavorites = (
  hook: (
    share: WechatMiniprogram.Page.IAddToFavoritesOption,
  ) => WechatMiniprogram.Page.IAddToFavoritesContent,
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else -- @preserve  */
  if (currentInstance) {
    /* istanbul ignore else -- @preserve  */
    if (currentInstance.__isInjectedFavoritesHook__) {
      const hiddenField = toHiddenField(PageLifecycle.ON_ADD_TO_FAVORITES)
      /* istanbul ignore else -- @preserve  */
      if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onAddToFavorites() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onAddToFavorites() hook only works when `onAddToFavorites` option is not exist.',
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onSaveExitState = (
  hook: () => WechatMiniprogram.Page.ISaveExitState,
): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else -- @preserve  */
  if (currentInstance) {
    /* istanbul ignore else -- @preserve  */
    if (currentInstance.__isInjectedExitStateHook__) {
      const hiddenField = toHiddenField(PageLifecycle.ON_SAVE_EXIT_STATE)
      /* istanbul ignore else -- @preserve  */
      if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onSaveExitState() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onSaveExitState() hook only works when `onSaveExitState` option is not exist.',
      )
    }
  } else if (__DEV__) {
    console.warn(pageHookWarn)
  }
}

export const onReady = (hook: () => unknown): void => {
  const currentInstance = getCurrentInstance()
  /* istanbul ignore else -- @preserve  */
  if (currentInstance) {
    injectHook(currentInstance, PageLifecycle.ON_READY, hook)
  } else if (__DEV__) {
    console.warn(
      'onReady() hook can only be called during execution of setup() in definePage() or defineComponent().',
    )
  }
}

export const onLoad: (hook: (query: Query) => unknown) => void =
  createComponentHook(PageLifecycle.ON_LOAD)
export const onMove: (hook: () => unknown) => void = createComponentHook(
  ComponentLifecycle.MOVED,
)
export const onDetach: (hook: () => unknown) => void = createComponentHook(
  ComponentLifecycle.DETACHED,
)
export const onError: (
  hook: (error: WechatMiniprogram.Error) => unknown,
) => void = createComponentHook(ComponentLifecycle.ERROR)

function createAppHook(lifecycle: AppLifecycle) {
  return (hook: Function): void => {
    /* istanbul ignore else -- @preserve  */
    if (currentApp) {
      injectHook(currentApp, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(
        'App specific lifecycle injection APIs can only be used during execution of setup() in createApp().',
      )
    }
  }
}

function createPageHook(lifecycle: PageLifecycle) {
  return (hook: Function): void => {
    const currentInstance = getCurrentInstance()
    /* istanbul ignore else -- @preserve  */
    if (currentInstance) {
      injectHook(currentInstance, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(pageHookWarn)
    }
  }
}

function createComponentHook(
  lifecycle: PageLifecycle.ON_LOAD | ComponentLifecycle,
) {
  return (hook: Function): void => {
    /* istanbul ignore else -- @preserve  */
    if (currentComponent) {
      injectHook(currentComponent, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(
        'Component specific lifecycle injection APIs can only be used during execution of setup() in defineComponent().',
      )
    }
  }
}

function injectHook(
  currentInstance: AppInstance | PageInstance | ComponentInstance,
  lifecycle: AppLifecycle | PageLifecycle | ComponentLifecycle,
  hook: Function,
): void {
  const hiddenField = toHiddenField(lifecycle)
  if (currentInstance[hiddenField] === undefined) {
    currentInstance[hiddenField] = []
  }

  currentInstance[hiddenField].push(hook)
}
