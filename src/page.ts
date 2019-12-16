import {
  isRef,
  isReactive,
  isReadonly,
  toRaw,
  effect,
  stop,
  ReactiveEffect
} from '@next-vue/reactivity'
import { isObject, isPlainObject, isFunction, toHiddenField } from './utils'

type Query = Record<string, string | undefined>
interface Context {
  route: string
}
type Setup = (query?: Query, context?: Context) => Record<string, unknown>
interface Page {
  [key: string]: any
  route: string
  setData: (data: Record<string, unknown>) => void
}
interface Scroll {
  scrollTop: number
}
interface Share {
  from: 'button' | 'menu'
  target: object | undefined
  webViewUrl?: string
}
interface ShareContent {
  title?: string
  path?: string
  imageUrl?: string
}
interface Resize {
  size: {
    windowWidth: number
    windowHeight: number
  }
}
interface Tap {
  index: string
  pagePath: string
  text: string
}
interface Options {
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
interface Config {
  listenPageScroll: boolean
}
interface PageOptions {
  [key: string]: unknown
  onLoad?: (this: Page, query: Query) => void
  onShareAppMessage?: (this: Page, share: Share) => ShareContent | void
  _isInjectedShareHook?: true
  _listenPageScroll?: true
}

const enum PageLifecycle {
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

let currentPage: Page | null = null

export function createPage(
  optionsOrSetup?: Options | Setup,
  config: Config = { listenPageScroll: false }
): PageOptions | void {
  if (optionsOrSetup === undefined) {
    return
  }

  if (!isPlainObject(optionsOrSetup) && !isFunction(optionsOrSetup)) {
    console.warn(
      'The "createPage" function only accept an object or a function as parameter.'
    )
    return
  }

  let setup: Setup
  let pageOptions: PageOptions
  if (isPlainObject(optionsOrSetup)) {
    const options = optionsOrSetup
    if (options.setup === undefined) {
      return options
    }

    if (!isFunction(options.setup)) {
      console.warn('The "setup" hook must be a function.')
      return options
    }

    const { setup: setupOption, ...restOptions } = options
    setup = setupOption
    pageOptions = restOptions
  } else {
    setup = optionsOrSetup
    pageOptions = {}
  }

  const originOnLoad = pageOptions.onLoad
  if (originOnLoad !== undefined && !isFunction(originOnLoad)) {
    console.warn('The "onLoad" hook must be a function.')
  }

  pageOptions.onLoad = function(this: Page, query: Query) {
    currentPage = this
    const context: Context = { route: this.route }
    const binding = setup(query, context)
    if (binding !== undefined && isPlainObject(binding)) {
      Object.keys(binding).forEach(key => {
        const value = binding[key]
        if (isFunction(value)) {
          this[key] = value
          return
        }

        deepWatch.call(this, key, binding[key])
      })
    } else if (binding !== undefined) {
      console.warn('The "setup" hook must return an object.')
    }

    if (isFunction(originOnLoad)) {
      originOnLoad.call(this, query)
    }

    currentPage = null
  }

  addHook(pageOptions, PageLifecycle.ON_SHOW)
  addHook(pageOptions, PageLifecycle.ON_READY)
  addHook(pageOptions, PageLifecycle.ON_HIDE)
  addHook(pageOptions, PageLifecycle.ON_UNLOAD)
  addHook(pageOptions, PageLifecycle.ON_PULL_DOWN_REFRESH)
  addHook(pageOptions, PageLifecycle.ON_REACH_BOTTOM)
  addHook(pageOptions, PageLifecycle.ON_RESIZE)
  addHook(pageOptions, PageLifecycle.ON_TAB_ITEM_TAP)
  if (isFunction(pageOptions.onPageScroll) || config.listenPageScroll) {
    addHook(pageOptions, PageLifecycle.ON_PAGE_SCROLL)
    pageOptions._listenPageScroll = true
  }

  if (!isFunction(pageOptions.onShareAppMessage)) {
    if (pageOptions.onShareAppMessage !== undefined) {
      console.warn('The "onShareAppMessage" hook must be a function.')
    }

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

  return pageOptions
}

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
        if (isFunction(hook)) {
          currentPage[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)] = hook
        } else {
          console.warn(
            'Lifecycle injection APIs only accept a function as parameter.'
          )
        }
      } else {
        console.warn('The "onShareAppMessage" hook can only be called once.')
      }
    } else {
      console.warn('The "onShareAppMessage" hook already exists.')
    }
  } else {
    console.warn(
      'Lifecycle injection APIs can only be used during execution of setup().'
    )
  }
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

  if (Array.isArray(x)) {
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
    if (Array.isArray(row)) {
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

  if (Array.isArray(value)) {
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

function addHook(target: PageOptions, lifecycle: PageLifecycle): void {
  const originHook = target[lifecycle]
  if (originHook !== undefined && !isFunction(originHook)) {
    console.warn(`The "${lifecycle}" hook must be a function.`)
  }

  target[lifecycle] = function(this: Page, ...args: any[]) {
    const hooks = this[toHiddenField(lifecycle)]
    if (hooks) {
      hooks.forEach((hook: any) => hook(...args))
    }

    if (isFunction(originHook)) {
      originHook.call(this, ...args)
    }
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
        if (isFunction(hook)) {
          if (currentPage[toHiddenField(lifecycle)] === undefined) {
            currentPage[toHiddenField(lifecycle)] = []
          }

          currentPage[toHiddenField(lifecycle)].push(hook)
        } else {
          console.warn(
            'Lifecycle injection APIs only accept a function as parameter.'
          )
        }
      } else {
        console.warn('Please set "listenPageScroll" config to true frist.')
      }
    } else {
      console.warn(
        'Lifecycle injection APIs can only be used during execution of setup().'
      )
    }
  }
}
