import {
  currentPage,
  currentComponent,
  getCurrentInstance,
  Page,
  Component
} from './instance'
import { ComponentLifecycle } from './component'
import { PageLifecycle, Query } from './page'
import { toHiddenField } from './utils'

const warnMsg =
  'Lifecycle injection APIs can only be used during execution of setup().'

export const onShow = createHook(PageLifecycle.ON_SHOW)
export const onHide = createHook(PageLifecycle.ON_HIDE)
export const onUnload = createHook(PageLifecycle.ON_UNLOAD)
export const onPullDownRefresh = createHook(PageLifecycle.ON_PULL_DOWN_REFRESH)
export const onReachBottom = createHook(PageLifecycle.ON_REACH_BOTTOM)
export const onResize = createHook<
  (resize: WechatMiniprogram.Page.IResizeOption) => unknown
>(PageLifecycle.ON_RESIZE)
export const onTabItemTap = createHook<
  (tap: WechatMiniprogram.Page.ITabItemTapOption) => unknown
>(PageLifecycle.ON_TAB_ITEM_TAP)
export const onPageScroll = (
  hook: (scroll: WechatMiniprogram.Page.IPageScrollOption) => unknown
): void => {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    if (currentInstance._listenPageScroll) {
      injectHook(currentInstance, PageLifecycle.ON_PAGE_SCROLL, hook)
    } else if (__DEV__) {
      console.warn(
        'onPageScroll() hook only works when `listenPageScroll` is configured to true.'
      )
    }
  } else if (__DEV__) {
    console.warn(warnMsg)
  }
}

export const onShareAppMessage = (
  hook: (
    share: WechatMiniprogram.Page.IShareAppMessageOption
  ) => WechatMiniprogram.Page.ICustomShareContent
): void => {
  if (currentPage) {
    if (currentPage._isInjectedShareHook) {
      const hiddenField = toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)
      if (currentPage[hiddenField] === undefined) {
        currentPage[hiddenField] = hook
      } else if (__DEV__) {
        console.warn('onShareAppMessage() hook can only be called once.')
      }
    } else if (__DEV__) {
      console.warn(
        'onShareAppMessage() hook only works when `onShareAppMessage` option is not exist.'
      )
    }
  } else if (__DEV__) {
    console.warn(warnMsg)
  }
}

export const onReady = (hook: () => unknown): void => {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    const lifecycle = currentPage
      ? PageLifecycle.ON_READY
      : ComponentLifecycle.READY
    injectHook(currentInstance, lifecycle, hook)
  } else if (__DEV__) {
    console.warn(warnMsg)
  }
}

export const onLoad = createComponentHook<(query: Query) => unknown>(
  PageLifecycle.ON_LOAD
)
export const onAttach = createComponentHook(ComponentLifecycle.ATTACHED)
export const onMove = createComponentHook(ComponentLifecycle.MOVED)
export const onDetach = createComponentHook(ComponentLifecycle.DETACHED)
export const onError = createComponentHook<(error: Error) => unknown>(
  ComponentLifecycle.ERROR
)

function createHook<T extends Function = () => unknown>(
  lifecycle: PageLifecycle
) {
  return (hook: T): void => {
    const currentInstance = getCurrentInstance()
    if (currentInstance) {
      injectHook(currentInstance, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(warnMsg)
    }
  }
}

function createComponentHook<T extends Function = () => unknown>(
  lifecycle: PageLifecycle.ON_LOAD | ComponentLifecycle
) {
  return (hook: T): void => {
    if (currentComponent) {
      injectHook(currentComponent, lifecycle, hook)
    } else if (__DEV__) {
      console.warn(
        `Component specific lifecycle injection APIs can only be used during execution of setup() in defineComponent().`
      )
    }
  }
}

function injectHook(
  currentInstance: Page | Component,
  lifecycle: PageLifecycle | ComponentLifecycle,
  hook: Function
): void {
  const hiddenField = toHiddenField(lifecycle)
  if (currentInstance[hiddenField] === undefined) {
    currentInstance[hiddenField] = []
  }

  currentInstance[hiddenField].push(hook)
}
