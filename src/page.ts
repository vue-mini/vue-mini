import {
  isRef,
  isReactive,
  isReadonly,
  toRaw,
  stop,
  ReactiveEffect
} from '@next-vue/reactivity'
import { watch, StopHandle } from './watch'
import {
  isArray,
  getType,
  isSimpleValue,
  isObject,
  isPlainObject,
  isFunction,
  toHiddenField
} from './utils'

type Query = Record<string, string | undefined>
interface Context {
  route: string
}
export type Setup = (
  query?: Query,
  context?: Context
) => Record<string, unknown> | void
interface Page {
  [key: string]: any
  route: string
  setData: (data: Record<string, unknown>) => void
  _isInjectedShareHook?: true
  _listenPageScroll?: true
  _effects?: ReactiveEffect[]
}
export interface Scroll {
  scrollTop: number
}
export interface Share {
  from: 'button' | 'menu'
  target: object | undefined
  webViewUrl?: string
}
export interface ShareContent {
  title?: string
  path?: string
  imageUrl?: string
}
export interface Resize {
  size: {
    windowWidth: number
    windowHeight: number
  }
}
export interface Tap {
  index: string
  pagePath: string
  text: string
}
export interface Options {
  [key: string]: unknown
  setup?: Setup
  onLoad?: (this: Page, query?: Query) => unknown
  onShow?: (this: Page) => unknown
  onReady?: (this: Page) => unknown
  onHide?: (this: Page) => unknown
  onUnload?: (this: Page) => unknown
  onPullDownRefresh?: (this: Page) => unknown
  onReachBottom?: (this: Page) => unknown
  onPageScroll?: (this: Page, scroll?: Scroll) => unknown
  onShareAppMessage?: (this: Page, share?: Share) => ShareContent | void
  onResize?: (this: Page, resize?: Resize) => unknown
  onTabItemTap?: (this: Page, tap?: Tap) => unknown
}
export interface Config {
  listenPageScroll: boolean
}
interface PageOptions {
  [key: string]: unknown
  onLoad?: (this: Page, query: Query) => void
  onShareAppMessage?: (this: Page, share: Share) => ShareContent | void
  _isInjectedShareHook?: true
  _listenPageScroll?: true
}

export const enum PageLifecycle {
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

// eslint-disable-next-line import/no-mutable-exports
export let currentPage: Page | null = null

export function createPage(
  optionsOrSetup: Options | Setup,
  config: Config = { listenPageScroll: false }
): PageOptions | void {
  let setup: Setup
  let pageOptions: PageOptions
  if (isFunction(optionsOrSetup)) {
    setup = optionsOrSetup
    pageOptions = {}
  } else {
    const options = optionsOrSetup
    if (options.setup === undefined) {
      return options
    }

    const { setup: setupOption, ...restOptions } = options
    setup = setupOption
    pageOptions = restOptions
  }

  const originOnLoad = pageOptions.onLoad
  pageOptions.onLoad = function(this: Page, query: Query) {
    currentPage = this
    const context: Context = { route: this.route }
    const binding = setup(query, context)
    if (binding !== undefined) {
      Object.keys(binding).forEach(key => {
        const value = binding[key]
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

    currentPage = null
  }

  const onUnload = createLifecycle(pageOptions, PageLifecycle.ON_UNLOAD)
  pageOptions.onUnload = function(this: Page) {
    if (this._effects) {
      this._effects.forEach(effect => stop(effect))
    }

    onUnload.call(this)
  }

  if (pageOptions.onPageScroll || config.listenPageScroll) {
    pageOptions[PageLifecycle.ON_PAGE_SCROLL] = createLifecycle(
      pageOptions,
      PageLifecycle.ON_PAGE_SCROLL
    )
    pageOptions._listenPageScroll = true
  }

  if (pageOptions.onShareAppMessage === undefined) {
    pageOptions.onShareAppMessage = function(
      this: Page,
      share: Share
    ): ShareContent | void {
      const hook = this[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)] as (
        share: Share
      ) => ShareContent | void
      if (hook) {
        const shareContent = hook(share)
        if (shareContent !== undefined) {
          return shareContent
        }
      }
    }

    pageOptions._isInjectedShareHook = true
  }

  pageOptions[PageLifecycle.ON_SHOW] = createLifecycle(
    pageOptions,
    PageLifecycle.ON_SHOW
  )
  pageOptions[PageLifecycle.ON_READY] = createLifecycle(
    pageOptions,
    PageLifecycle.ON_READY
  )
  pageOptions[PageLifecycle.ON_HIDE] = createLifecycle(
    pageOptions,
    PageLifecycle.ON_HIDE
  )
  pageOptions[PageLifecycle.ON_PULL_DOWN_REFRESH] = createLifecycle(
    pageOptions,
    PageLifecycle.ON_PULL_DOWN_REFRESH
  )
  pageOptions[PageLifecycle.ON_REACH_BOTTOM] = createLifecycle(
    pageOptions,
    PageLifecycle.ON_REACH_BOTTOM
  )
  pageOptions[PageLifecycle.ON_RESIZE] = createLifecycle(
    pageOptions,
    PageLifecycle.ON_RESIZE
  )
  pageOptions[PageLifecycle.ON_TAB_ITEM_TAP] = createLifecycle(
    pageOptions,
    PageLifecycle.ON_TAB_ITEM_TAP
  )

  return pageOptions
}

function deepToRaw(x: unknown): unknown {
  if (isSimpleValue(x)) {
    return x
  }

  if (isRef(x)) {
    return deepToRaw(x.value)
  }

  if (isReactive(x) || isReadonly(x)) {
    return deepToRaw(toRaw(x))
  }

  if (isArray(x)) {
    return x.map(item => deepToRaw(item))
  }

  if (isPlainObject(x)) {
    const obj: { [key: string]: unknown } = {}
    Object.keys(x).forEach(key => {
      obj[key] = deepToRaw(x[key])
    })
    return obj
  }

  throw new TypeError(`${getType(x)} value is not supported`)
}

function deepWatch(this: Page, key: string, value: unknown): void {
  if (!isObject(value) || isReadonly(value)) {
    return
  }

  if (isRef(value)) {
    watch(
      () => value.value,
      () => this.setData({ [key]: deepToRaw(value.value) }),
      { lazy: true }
    )
    deepWatch.call(this, key, value.value)
    return
  }

  if (isReactive(value)) {
    const row = toRaw(value)
    if (isArray(row)) {
      const stoppers = new Set<StopHandle>()
      const watchArrayItem = (arr: unknown[]): void => {
        for (let i = 0; i < arr.length; i++) {
          const k = `${key}[${i}]`
          stoppers.add(
            watch(
              () => arr[i],
              () => {
                if (i in arr) {
                  this.setData({ [k]: deepToRaw(arr[i]) })
                }
              },
              { lazy: true }
            )
          )
          deepWatch.call(this, k, arr[i])
        }
      }

      watch(
        () => (value as unknown[]).length,
        (_, __, onCleanup) => {
          this.setData({ [key]: deepToRaw(value) })
          watchArrayItem(value as unknown[])
          onCleanup(() => stoppers.forEach(stopper => stopper()))
        },
        { lazy: true }
      )
      watchArrayItem(value as unknown[])
      return
    }

    if (isPlainObject(row)) {
      const stoppers = new Set<StopHandle>()
      const watchObjectItem = (obj: Record<string, unknown>): void => {
        Object.keys(obj).forEach(name => {
          const k = `${key}.${name}`
          stoppers.add(
            watch(
              () => obj[name],
              () => {
                if (name in obj) {
                  this.setData({ [k]: deepToRaw(obj[name]) })
                }
              },
              { lazy: true }
            )
          )
        })
      }

      watch(
        () => Object.keys(value),
        (_, __, onCleanup) => {
          this.setData({ [key]: deepToRaw(value) })
          watchObjectItem(value as Record<string, unknown>)
          onCleanup(() => stoppers.forEach(stopper => stopper()))
        },
        { lazy: true }
      )
      watchObjectItem(value as Record<string, unknown>)
      return
    }

    return
  }

  if (isArray(value)) {
    value.forEach((_, index) => {
      deepWatch.call(this, `${key}[${index}]`, value[index])
    })
    return
  }

  if (isPlainObject(value)) {
    Object.keys(value).forEach(name => {
      deepWatch.call(this, `${key}.${name}`, value[name])
    })
  }
}

function createLifecycle(
  target: PageOptions,
  lifecycle: PageLifecycle
): (...args: any[]) => void {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const originLifecycle = target[lifecycle] as Function
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
