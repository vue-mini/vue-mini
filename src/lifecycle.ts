import {
  Scroll,
  Share,
  ShareContent,
  Resize,
  Tap,
  PageLifecycle,
  currentPage
} from './page'
import { toHiddenField } from './utils'

const warnMsg =
  'Lifecycle injection APIs can only be used during execution of setup().'

export const onShow = createHook(PageLifecycle.ON_SHOW)
export const onReady = createHook(PageLifecycle.ON_READY)
export const onHide = createHook(PageLifecycle.ON_HIDE)
export const onUnload = createHook(PageLifecycle.ON_UNLOAD)
export const onPullDownRefresh = createHook(PageLifecycle.ON_PULL_DOWN_REFRESH)
export const onReachBottom = createHook(PageLifecycle.ON_REACH_BOTTOM)
export const onPageScroll = createHook<(scroll?: Scroll) => unknown>(
  PageLifecycle.ON_PAGE_SCROLL
)
export const onResize = createHook<(resize?: Resize) => unknown>(
  PageLifecycle.ON_RESIZE
)
export const onTabItemTap = createHook<(tap?: Tap) => unknown>(
  PageLifecycle.ON_TAB_ITEM_TAP
)
export const onShareAppMessage = (
  hook: (share?: Share) => ShareContent | void
): void => {
  if (currentPage) {
    if (currentPage._isInjectedShareHook) {
      if (
        currentPage[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)] ===
        undefined
      ) {
        currentPage[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)] = hook
      } else {
        console.warn('onShareAppMessage() hook can only be called once.')
      }
    } else {
      console.warn(
        'onShareAppMessage() hook only works when `onShareAppMessage` option is not exist.'
      )
    }
  } else {
    console.warn(warnMsg)
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function createHook<T extends Function = () => unknown>(
  lifecycle: PageLifecycle
) {
  return (hook: T): void => {
    if (currentPage) {
      if (
        lifecycle !== PageLifecycle.ON_PAGE_SCROLL ||
        currentPage._listenPageScroll
      ) {
        if (currentPage[toHiddenField(lifecycle)] === undefined) {
          currentPage[toHiddenField(lifecycle)] = []
        }

        currentPage[toHiddenField(lifecycle)].push(hook)
      } else {
        console.warn(
          'onPageScroll() hook only works when `listenPageScroll` is configured to true.'
        )
      }
    } else {
      console.warn(warnMsg)
    }
  }
}
