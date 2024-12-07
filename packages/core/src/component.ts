import { shallowReactive, shallowReadonly, EffectScope } from '@vue/reactivity'
import { flushPostFlushCbs } from './scheduler'
import type { Config } from './page'
import { PageLifecycle } from './page'
import { deepToRaw, deepWatch } from './shared'
import type { Bindings, ComponentInstance } from './instance'
import { setCurrentComponent, unsetCurrentComponent } from './instance'
import { extend, exclude, isFunction, toHiddenField } from './utils'

export type ComponentContext = WechatMiniprogram.Component.InstanceProperties &
  Omit<
    WechatMiniprogram.Component.InstanceMethods<Record<string, any>>,
    'setData' | 'groupSetData' | 'hasBehavior'
  >

export type ComponentSetup<Props extends Record<string, any>> = (
  this: void,
  props: Readonly<Props>,
  context: ComponentContext,
) => Bindings

export type ComponentOptions<
  Props extends WechatMiniprogram.Component.PropertyOption,
  Data extends WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption,
  Behavior extends WechatMiniprogram.Component.BehaviorOption,
> = WechatMiniprogram.Component.Options<Data, Props, Methods, Behavior> & {
  setup?: ComponentSetup<
    PropertyOptionToData<WechatMiniprogram.Component.FilterUnknownType<Props>>
  >
}

/** * Temporary patch for https://github.com/wechat-miniprogram/api-typings/issues/97 ***/
type PropertyOptionToData<
  T extends WechatMiniprogram.Component.PropertyOption,
> = {
  [Name in keyof T]: PropertyToData<T[Name]>
}
type PropertyToData<T extends WechatMiniprogram.Component.AllProperty> =
  T extends WechatMiniprogram.Component.PropertyType ?
    WechatMiniprogram.Component.ValueType<T>
  : T extends WechatMiniprogram.Component.AllFullProperty ?
    T['optionalTypes'] extends OptionalTypes<infer Option> ?
      | WechatMiniprogram.Component.FullPropertyToData<T>
      | WechatMiniprogram.Component.ValueType<Option>
    : WechatMiniprogram.Component.FullPropertyToData<T>
  : never
type OptionalTypes<T extends WechatMiniprogram.Component.PropertyType> = T[]
/*************************************************************************************/

type Options = Record<string, any>

export enum ComponentLifecycle {
  ATTACHED = 'attached',
  READY = 'ready',
  MOVED = 'moved',
  DETACHED = 'detached',
  ERROR = 'error',
}

const SpecialLifecycleMap = {
  [PageLifecycle.ON_SHOW]: 'show',
  [PageLifecycle.ON_HIDE]: 'hide',
  [PageLifecycle.ON_RESIZE]: 'resize',
  [PageLifecycle.ON_ROUTE_DONE]: 'routeDone',
  [ComponentLifecycle.READY]: PageLifecycle.ON_READY,
}

export function defineComponent(
  setup: ComponentSetup<{}>,
  config?: Config,
): string

export function defineComponent<
  Props extends WechatMiniprogram.Component.PropertyOption,
  Data extends WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption,
  Behavior extends WechatMiniprogram.Component.BehaviorOption,
>(
  options: ComponentOptions<Props, Data, Methods, Behavior>,
  config?: Config,
): string

export function defineComponent(optionsOrSetup: any, config?: Config): string {
  config = extend(
    {
      listenPageScroll: false,
      canShareToOthers: false,
      canShareToTimeline: false,
    },
    config,
  )
  let setup: ComponentSetup<Record<string, any>>
  let options: Options
  let properties: string[] | null = null
  if (isFunction(optionsOrSetup)) {
    setup = optionsOrSetup
    options = {}
  } else {
    if (optionsOrSetup.setup === undefined) {
      // eslint-disable-next-line new-cap
      return Component(optionsOrSetup)
    }

    setup = optionsOrSetup.setup
    options = exclude(optionsOrSetup, ['setup'])

    if (options.properties) {
      properties = Object.keys(options.properties)
    }
  }

  if (options.lifetimes === undefined) {
    options.lifetimes = {}
  }

  const originAttached =
    options.lifetimes[ComponentLifecycle.ATTACHED] ||
    options[ComponentLifecycle.ATTACHED]
  options.lifetimes[ComponentLifecycle.ATTACHED] = function (
    this: ComponentInstance,
  ) {
    this.__scope__ = new EffectScope()

    setCurrentComponent(this)
    const rawProps: Record<string, any> = {}
    if (properties) {
      properties.forEach((property) => {
        rawProps[property] = this.data[property]
      })
    }

    this.__props__ = shallowReactive(rawProps)

    const context: ComponentContext = {
      is: this.is,
      id: this.id,
      dataset: this.dataset,
      exitState: this.exitState,
      router: this.router,
      pageRouter: this.pageRouter,
      renderer: this.renderer,
      triggerEvent: this.triggerEvent.bind(this),
      createSelectorQuery: this.createSelectorQuery.bind(this),
      createIntersectionObserver: this.createIntersectionObserver.bind(this),
      createMediaQueryObserver: this.createMediaQueryObserver.bind(this),
      selectComponent: this.selectComponent.bind(this),
      selectAllComponents: this.selectAllComponents.bind(this),
      selectOwnerComponent: this.selectOwnerComponent.bind(this),
      getRelationNodes: this.getRelationNodes.bind(this),
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
    const bindings = setup(
      __DEV__ ?
        shallowReadonly(this.__props__)
      : /* istanbul ignore next -- @preserve */ this.__props__,
      context,
    )
    if (bindings !== undefined) {
      let data: Record<string, unknown> | undefined
      Object.keys(bindings).forEach((key) => {
        const value = bindings[key]
        if (isFunction(value)) {
          this[key] = value
          return
        }

        data = data || {}
        data[key] = deepToRaw(value)
        deepWatch.call(this, key, value)
      })
      if (data !== undefined) {
        this.setData(data, flushPostFlushCbs)
      }
    }

    unsetCurrentComponent()

    if (originAttached !== undefined) {
      originAttached.call(this)
    }
  }

  const detached = createComponentLifecycle(
    options,
    ComponentLifecycle.DETACHED,
  )
  options.lifetimes[ComponentLifecycle.DETACHED] = function (
    this: ComponentInstance,
  ) {
    detached.call(this)

    this.__scope__.stop()
  }

  const originReady =
    options.lifetimes[ComponentLifecycle.READY] ||
    options[ComponentLifecycle.READY]
  options.lifetimes[ComponentLifecycle.READY] = createLifecycle(
    SpecialLifecycleMap[ComponentLifecycle.READY],
    originReady,
  )
  options.lifetimes[ComponentLifecycle.MOVED] = createComponentLifecycle(
    options,
    ComponentLifecycle.MOVED,
  )
  options.lifetimes[ComponentLifecycle.ERROR] = createComponentLifecycle(
    options,
    ComponentLifecycle.ERROR,
  )

  if (options.methods === undefined) {
    options.methods = {}
  }

  if (
    options.methods[PageLifecycle.ON_PAGE_SCROLL] ||
    config.listenPageScroll
  ) {
    options.methods[PageLifecycle.ON_PAGE_SCROLL] = createPageLifecycle(
      options,
      PageLifecycle.ON_PAGE_SCROLL,
    )
    /* istanbul ignore next -- @preserve */
    options.methods.__listenPageScroll__ = () => true
  }

  if (
    options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined &&
    config.canShareToOthers
  ) {
    options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] = function (
      this: ComponentInstance,
      share: WechatMiniprogram.Page.IShareAppMessageOption,
    ): WechatMiniprogram.Page.ICustomShareContent {
      const hook = this[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)] as (
        share: WechatMiniprogram.Page.IShareAppMessageOption,
      ) => WechatMiniprogram.Page.ICustomShareContent
      if (hook) {
        return hook(share)
      }

      return {}
    }

    /* istanbul ignore next -- @preserve */
    options.methods.__isInjectedShareToOthersHook__ = () => true
  }

  if (
    options.methods[PageLifecycle.ON_SHARE_TIMELINE] === undefined &&
    config.canShareToTimeline
  ) {
    options.methods[PageLifecycle.ON_SHARE_TIMELINE] = function (
      this: ComponentInstance,
    ): WechatMiniprogram.Page.ICustomTimelineContent {
      const hook = this[
        toHiddenField(PageLifecycle.ON_SHARE_TIMELINE)
      ] as () => WechatMiniprogram.Page.ICustomTimelineContent
      if (hook) {
        return hook()
      }

      return {}
    }

    /* istanbul ignore next -- @preserve */
    options.methods.__isInjectedShareToTimelineHook__ = () => true
  }

  if (options.methods[PageLifecycle.ON_ADD_TO_FAVORITES] === undefined) {
    options.methods[PageLifecycle.ON_ADD_TO_FAVORITES] = function (
      this: ComponentInstance,
      favorites: WechatMiniprogram.Page.IAddToFavoritesOption,
    ): WechatMiniprogram.Page.IAddToFavoritesContent {
      const hook = this[toHiddenField(PageLifecycle.ON_ADD_TO_FAVORITES)] as (
        avorites: WechatMiniprogram.Page.IAddToFavoritesOption,
      ) => WechatMiniprogram.Page.IAddToFavoritesContent
      if (hook) {
        return hook(favorites)
      }

      return {}
    }

    /* istanbul ignore next -- @preserve */
    options.methods.__isInjectedFavoritesHook__ = () => true
  }

  if (options.methods[PageLifecycle.ON_SAVE_EXIT_STATE] === undefined) {
    options.methods[PageLifecycle.ON_SAVE_EXIT_STATE] = function (
      this: ComponentInstance,
    ): WechatMiniprogram.Page.ISaveExitState {
      const hook = this[
        toHiddenField(PageLifecycle.ON_SAVE_EXIT_STATE)
      ] as () => WechatMiniprogram.Page.ISaveExitState
      if (hook) {
        return hook()
      }

      return { data: undefined }
    }

    /* istanbul ignore next -- @preserve */
    options.methods.__isInjectedExitStateHook__ = () => true
  }

  options.methods[PageLifecycle.ON_LOAD] = createPageLifecycle(
    options,
    PageLifecycle.ON_LOAD,
  )
  options.methods[PageLifecycle.ON_PULL_DOWN_REFRESH] = createPageLifecycle(
    options,
    PageLifecycle.ON_PULL_DOWN_REFRESH,
  )
  options.methods[PageLifecycle.ON_REACH_BOTTOM] = createPageLifecycle(
    options,
    PageLifecycle.ON_REACH_BOTTOM,
  )
  options.methods[PageLifecycle.ON_TAB_ITEM_TAP] = createPageLifecycle(
    options,
    PageLifecycle.ON_TAB_ITEM_TAP,
  )

  if (options.pageLifetimes === undefined) {
    options.pageLifetimes = {}
  }

  options.pageLifetimes[SpecialLifecycleMap[PageLifecycle.ON_SHOW]] =
    createSpecialPageLifecycle(options, PageLifecycle.ON_SHOW)
  options.pageLifetimes[SpecialLifecycleMap[PageLifecycle.ON_HIDE]] =
    createSpecialPageLifecycle(options, PageLifecycle.ON_HIDE)
  options.pageLifetimes[SpecialLifecycleMap[PageLifecycle.ON_RESIZE]] =
    createSpecialPageLifecycle(options, PageLifecycle.ON_RESIZE)
  options.pageLifetimes[SpecialLifecycleMap[PageLifecycle.ON_ROUTE_DONE]] =
    createSpecialPageLifecycle(options, PageLifecycle.ON_ROUTE_DONE)

  if (properties) {
    if (options.observers === undefined) {
      options.observers = {}
    }

    properties.forEach((property) => {
      const originObserver = options.observers[property]
      options.observers[property] = function (
        this: ComponentInstance,
        value: any,
      ) {
        // Observer executes before attached
        if (this.__props__) {
          this.__props__[property] = value
        }

        if (originObserver !== undefined) {
          originObserver.call(this, value)
        }
      }
    })
  }

  // eslint-disable-next-line new-cap
  return Component(options)
}

function createComponentLifecycle(
  options: Options,
  lifecycle: ComponentLifecycle,
): (...args: any[]) => void {
  const originLifecycle = options.lifetimes[lifecycle] || options[lifecycle]
  return createLifecycle(lifecycle, originLifecycle)
}

function createPageLifecycle(
  options: Options,
  lifecycle: PageLifecycle,
): (...args: any[]) => void {
  const originLifecycle = options.methods[lifecycle]
  return createLifecycle(lifecycle, originLifecycle)
}

function createSpecialPageLifecycle(
  options: Options,
  lifecycle:
    | PageLifecycle.ON_SHOW
    | PageLifecycle.ON_HIDE
    | PageLifecycle.ON_RESIZE
    | PageLifecycle.ON_ROUTE_DONE,
): (...args: any[]) => void {
  const originLifecycle = options.pageLifetimes[SpecialLifecycleMap[lifecycle]]
  return createLifecycle(lifecycle, originLifecycle)
}

function createLifecycle(
  lifecycle: ComponentLifecycle | PageLifecycle,
  originLifecycle: Function | undefined,
): (...args: any[]) => void {
  const hiddenField = toHiddenField(lifecycle)
  return function (this: ComponentInstance, ...args: any[]) {
    const hooks = this[hiddenField]
    if (hooks) {
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      originLifecycle.call(this, ...args)
    }
  }
}
