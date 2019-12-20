import {
  isRef,
  isReactive,
  isReadonly,
  toRaw,
  effect,
  stop,
  ReactiveEffect
} from '@next-vue/reactivity'
import {
  isArray,
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

        deepWatch.call(this, key, binding[key])
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
  if (!isObject(x)) {
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

  return x
}

function deepWatch(this: Page, key: string, value: unknown): void {
  if (!isObject(value) || isReadonly(value)) {
    this.setData({ [key]: deepToRaw(value) })
    return
  }

  if (isRef(value)) {
    effect(() => this.setData({ [key]: deepToRaw(value.value) }))
    return deepWatch.call(this, key, value.value)
  }

  if (isReactive(value)) {
    const row = toRaw(value)
    if (isArray(row)) {
      const effects = new Set<ReactiveEffect<void>>()
      effect(() => {
        this.setData({ [key]: deepToRaw(value) })
        effects.forEach(effect => stop(effect))
        const { length } = value as unknown[]
        for (let i = 0; i < length; i++) {
          const k = `${key}[${i}]`
          effects.add(
            effect(() => {
              if (i in value) {
                this.setData({ [k]: deepToRaw((value as unknown[])[i]) })
              }
            })
          )
          deepWatch.call(this, k, (value as unknown[])[i])
        }
      })
      return
    }

    if (isPlainObject(row)) {
      const effects = new Set<ReactiveEffect<void>>()
      effect(() => {
        this.setData({ [key]: deepToRaw(value) })
        effects.forEach(effect => stop(effect))
        Object.keys(value).forEach(name => {
          const k = `${key}.${name}`
          effects.add(
            effect(() => {
              if (name in value) {
                this.setData({
                  [k]: deepToRaw((value as { [name: string]: unknown })[name])
                })
              }
            })
          )
          deepWatch.call(this, k, (value as { [name: string]: unknown })[name])
        })
      })
      return
    }
  }

  if (isArray(value)) {
    this.setData({ [key]: deepToRaw(value) })
    value.forEach((_, index) => {
      deepWatch.call(this, `${key}[${index}]`, value[index])
    })
    return
  }

  if (isPlainObject(value)) {
    this.setData({ [key]: deepToRaw(value) })
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
