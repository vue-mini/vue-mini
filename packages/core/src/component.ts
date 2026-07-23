import {
  shallowReactive,
  shallowReadonly,
  EffectScope,
  setCurrentScope,
} from '@vue/reactivity'
import { flushPostFlushCbs } from './scheduler'
import type { Config } from './page'
import { PageLifecycle } from './page'
import { deepToRaw, deepWatch } from './shared'
import type { Bindings, ComponentInstance } from './instance'
import {
  setCurrentComponent,
  unsetCurrentComponent,
  getLifecycleHooks,
} from './instance'
import { extend, exclude, isFunction } from './utils'

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
    this.__v_scope = new EffectScope()
    const scope = setCurrentScope(this.__v_scope)

    const rawProps: Record<string, any> = {}
    if (properties) {
      properties.forEach((property) => {
        rawProps[property] = this.data[property]
      })
    }

    this.__v_props = shallowReactive(rawProps)

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

    setCurrentComponent(this)
    try {
      let bindings: Bindings
      try {
        bindings = setup(
          /* istanbul ignore next -- @preserve */
          __DEV__ ? shallowReadonly(this.__v_props) : this.__v_props,
          context,
        )
      } finally {
        unsetCurrentComponent()
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
          // May call sub component's setup synchronously, so should call after unsetCurrentComponent()
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

    this.__v_scope.stop()
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
    options.methods.__v_listenPageScroll = () => true
  }

  if (
    options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined &&
    config.canShareToOthers
  ) {
    options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] = createReturnLifecycle(
      PageLifecycle.ON_SHARE_APP_MESSAGE,
      () => ({}),
    )

    /* istanbul ignore next -- @preserve */
    options.methods.__v_isInjectedShareToOthersHook = () => true
  }

  if (
    options.methods[PageLifecycle.ON_SHARE_TIMELINE] === undefined &&
    config.canShareToTimeline
  ) {
    options.methods[PageLifecycle.ON_SHARE_TIMELINE] = createReturnLifecycle(
      PageLifecycle.ON_SHARE_TIMELINE,
      () => ({}),
    )

    /* istanbul ignore next -- @preserve */
    options.methods.__v_isInjectedShareToTimelineHook = () => true
  }

  if (options.methods[PageLifecycle.ON_ADD_TO_FAVORITES] === undefined) {
    options.methods[PageLifecycle.ON_ADD_TO_FAVORITES] = createReturnLifecycle(
      PageLifecycle.ON_ADD_TO_FAVORITES,
      () => ({}),
    )

    /* istanbul ignore next -- @preserve */
    options.methods.__v_isInjectedFavoritesHook = () => true
  }

  if (options.methods[PageLifecycle.ON_SAVE_EXIT_STATE] === undefined) {
    options.methods[PageLifecycle.ON_SAVE_EXIT_STATE] = createReturnLifecycle(
      PageLifecycle.ON_SAVE_EXIT_STATE,
      () => ({ data: undefined }),
    )

    /* istanbul ignore next -- @preserve */
    options.methods.__v_isInjectedExitStateHook = () => true
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
        if (this.__v_props) {
          this.__v_props[property] = value
        }

        if (originObserver !== undefined) {
          originObserver.call(this, value)
        }
      }
    })
  }

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
  return function (this: ComponentInstance, ...args: any[]) {
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
  return function (this: ComponentInstance, ...args: any[]) {
    const [hook] = getLifecycleHooks(this, lifecycle)
    if (hook) {
      return hook(...args)
    }

    return getDefaultValue()
  }
}
