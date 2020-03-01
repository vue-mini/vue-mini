import { stop, shallowReadonly, lock, unlock } from '@next-vue/reactivity'
import { PageLifecycle, Config, Bindings } from './page'
import { deepToRaw, deepWatch } from './shared'
import { setCurrentComponent, ComponentInstance } from './instance'
import { isFunction, toHiddenField } from './utils'

export type ComponentContext = WechatMiniprogram.Component.InstanceProperties &
  Omit<
    WechatMiniprogram.Component.InstanceMethods<Record<string, unknown>>,
    'setData' | 'hasBehavior'
  >

export type ComponentSetup<
  Props extends Record<string, any> = Record<string, any>,
  RawBindings extends Bindings = Bindings
> = (
  this: void,
  props: Readonly<Props>,
  context: ComponentContext
) => RawBindings

export type ComponentOptionsWithoutProps<
  RawBindings extends Bindings = Bindings,
  Data extends WechatMiniprogram.Component.DataOption = WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption = WechatMiniprogram.Component.MethodOption
> = WechatMiniprogram.Component.Options<
  Data,
  WechatMiniprogram.Component.PropertyOption,
  Methods
> & { properties?: undefined } & {
  // eslint-disable-next-line @typescript-eslint/ban-types
  setup?: ComponentSetup<{}, RawBindings>
}

export type ComponentOptionsWithProps<
  Props extends WechatMiniprogram.Component.PropertyOption = WechatMiniprogram.Component.PropertyOption,
  RawBindings extends Bindings = Bindings,
  Data extends WechatMiniprogram.Component.DataOption = WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption = WechatMiniprogram.Component.MethodOption
> = WechatMiniprogram.Component.Options<Data, Props, Methods> & {
  setup?: ComponentSetup<PropertyOptionToData<Props>, RawBindings>
}

/** * Temporary patch for https://github.com/wechat-miniprogram/api-typings/issues/97 ***/
type PropertyOptionToData<
  T extends WechatMiniprogram.Component.PropertyOption
> = {
  [Name in keyof T]: PropertyToData<T[Name]>
}
type PropertyToData<
  T extends WechatMiniprogram.Component.AllProperty
> = T extends WechatMiniprogram.Component.PropertyType
  ? WechatMiniprogram.Component.ValueType<T>
  : T extends WechatMiniprogram.Component.AllFullProperty
  ? FullPropertyToData<T>
  : never
type FullPropertyToData<
  T extends WechatMiniprogram.Component.AllFullProperty
> = T['optionalTypes'] extends OptionalTypes<infer Option>
  ? WechatMiniprogram.Component.ValueType<Option | T['type']>
  : WechatMiniprogram.Component.ValueType<T['type']>
type OptionalTypes<T extends WechatMiniprogram.Component.PropertyType> = T[]
/*************************************************************************************/

type Options = Record<string, any>

export const enum ComponentLifecycle {
  CREATED = 'created',
  ATTACHED = 'attached',
  READY = 'ready',
  MOVED = 'moved',
  DETACHED = 'detached',
  ERROR = 'error'
}

const SpecialLifecycleMap = {
  [PageLifecycle.ON_SHOW]: 'show',
  [PageLifecycle.ON_HIDE]: 'hide',
  [PageLifecycle.ON_RESIZE]: 'resize',
  [ComponentLifecycle.READY]: PageLifecycle.ON_READY
}

export function defineComponent<RawBindings extends Bindings>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  setup: ComponentSetup<{}, RawBindings>,
  config?: Config
): string

export function defineComponent<
  RawBindings extends Bindings,
  Data extends WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption
>(
  options: ComponentOptionsWithoutProps<RawBindings, Data, Methods>,
  config?: Config
): string

export function defineComponent<
  Props extends WechatMiniprogram.Component.PropertyOption,
  RawBindings extends Bindings,
  Data extends WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption
>(
  options: ComponentOptionsWithProps<Props, RawBindings, Data, Methods>,
  config?: Config
): string

export function defineComponent(
  optionsOrSetup:
    | ComponentOptionsWithProps
    | ComponentOptionsWithoutProps
    | ComponentSetup,
  config: Config = { listenPageScroll: false }
): string {
  let setup: ComponentSetup
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

    const { setup: setupOption, ...restOptions } = optionsOrSetup
    setup = setupOption
    options = restOptions

    if (options.properties) {
      properties = Object.keys(options.properties)
    }
  }

  let props: Readonly<Record<string, any>>
  let binding: Bindings
  if (options.lifetimes === undefined) {
    options.lifetimes = {}
  }

  const originCreated =
    options.lifetimes[ComponentLifecycle.CREATED] ||
    options[ComponentLifecycle.CREATED]
  options.lifetimes[ComponentLifecycle.CREATED] = function(
    this: ComponentInstance
  ) {
    setCurrentComponent(this)
    const rawProps: Record<string, any> = {}
    if (properties) {
      properties.forEach(property => {
        rawProps[property] = this.data[property]
      })
    }

    props = shallowReadonly(rawProps)

    const context: ComponentContext = {
      is: this.is,
      id: this.id,
      dataset: this.dataset,
      triggerEvent: this.triggerEvent.bind(this),
      createSelectorQuery: this.createSelectorQuery.bind(this),
      createIntersectionObserver: this.createIntersectionObserver.bind(this),
      selectComponent: this.selectComponent.bind(this),
      selectAllComponents: this.selectAllComponents.bind(this),
      selectOwnerComponent: this.selectOwnerComponent.bind(this),
      getRelationNodes: this.getRelationNodes.bind(this),
      groupSetData: this.groupSetData.bind(this),
      getTabBar: this.getTabBar.bind(this),
      getPageId: this.getPageId.bind(this),
      animate: this.animate.bind(this),
      clearAnimation: this.clearAnimation.bind(this)
    }
    binding = setup(props, context)
    setCurrentComponent(null)

    if (originCreated !== undefined) {
      originCreated.call(this)
    }
  }

  const attached = createComponentLifecycle(
    options,
    ComponentLifecycle.ATTACHED
  )
  options.lifetimes[ComponentLifecycle.ATTACHED] = function(
    this: ComponentInstance
  ) {
    if (binding !== undefined) {
      setCurrentComponent(this) // For effects record
      Object.keys(binding).forEach(key => {
        const value = (binding as Record<string, unknown>)[key]
        if (isFunction(value)) {
          this[key] = value
          return
        }

        this.setData({ [key]: deepToRaw(value) })
        deepWatch.call(this, key, value)
      })
      setCurrentComponent(null)
    }

    attached.call(this)
  }

  const detached = createComponentLifecycle(
    options,
    ComponentLifecycle.DETACHED
  )
  options.lifetimes[ComponentLifecycle.DETACHED] = function(
    this: ComponentInstance
  ) {
    detached.call(this)

    if (this.__effects__) {
      this.__effects__.forEach(effect => stop(effect))
    }
  }

  const originReady =
    options.lifetimes[ComponentLifecycle.READY] ||
    options[ComponentLifecycle.READY]
  options.lifetimes[ComponentLifecycle.READY] = createLifecycle(
    SpecialLifecycleMap[ComponentLifecycle.READY],
    originReady
  )
  options.lifetimes[ComponentLifecycle.MOVED] = createComponentLifecycle(
    options,
    ComponentLifecycle.MOVED
  )
  options.lifetimes[ComponentLifecycle.ERROR] = createComponentLifecycle(
    options,
    ComponentLifecycle.ERROR
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
      PageLifecycle.ON_PAGE_SCROLL
    )
    /* istanbul ignore next */
    options.methods.__listenPageScroll__ = () => true
  }

  if (options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined) {
    options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] = function(
      this: ComponentInstance,
      share: WechatMiniprogram.Page.IShareAppMessageOption
    ): WechatMiniprogram.Page.ICustomShareContent {
      const hook = this[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)] as (
        share: WechatMiniprogram.Page.IShareAppMessageOption
      ) => WechatMiniprogram.Page.ICustomShareContent
      if (hook) {
        return hook(share)
      }

      return {}
    }

    /* istanbul ignore next */
    options.methods.__isInjectedShareHook__ = () => true
  }

  options.methods[PageLifecycle.ON_LOAD] = createPageLifecycle(
    options,
    PageLifecycle.ON_LOAD
  )
  options.methods[PageLifecycle.ON_PULL_DOWN_REFRESH] = createPageLifecycle(
    options,
    PageLifecycle.ON_PULL_DOWN_REFRESH
  )
  options.methods[PageLifecycle.ON_REACH_BOTTOM] = createPageLifecycle(
    options,
    PageLifecycle.ON_REACH_BOTTOM
  )
  options.methods[PageLifecycle.ON_TAB_ITEM_TAP] = createPageLifecycle(
    options,
    PageLifecycle.ON_TAB_ITEM_TAP
  )

  if (options.pageLifetimes === undefined) {
    options.pageLifetimes = {}
  }

  options.pageLifetimes[
    SpecialLifecycleMap[PageLifecycle.ON_SHOW]
  ] = createSpecialPageLifecycle(options, PageLifecycle.ON_SHOW)
  options.pageLifetimes[
    SpecialLifecycleMap[PageLifecycle.ON_HIDE]
  ] = createSpecialPageLifecycle(options, PageLifecycle.ON_HIDE)
  options.pageLifetimes[
    SpecialLifecycleMap[PageLifecycle.ON_RESIZE]
  ] = createSpecialPageLifecycle(options, PageLifecycle.ON_RESIZE)

  if (properties) {
    if (options.observers === undefined) {
      options.observers = {}
    }

    properties.forEach(property => {
      const originObserver = options.observers[property]
      options.observers[property] = function(
        this: ComponentInstance,
        value: any
      ) {
        unlock()
        ;(props as Record<string, any>)[property] = value
        lock()

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
  lifecycle: ComponentLifecycle
): (...args: any[]) => void {
  const originLifecycle = options.lifetimes[lifecycle] || options[lifecycle]
  return createLifecycle(lifecycle, originLifecycle)
}

function createPageLifecycle(
  options: Options,
  lifecycle: PageLifecycle
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
): (...args: any[]) => void {
  const originLifecycle = options.pageLifetimes[SpecialLifecycleMap[lifecycle]]
  return createLifecycle(lifecycle, originLifecycle)
}

function createLifecycle(
  lifecycle: ComponentLifecycle | PageLifecycle,
  originLifecycle: Function | undefined
): (...args: any[]) => void {
  const hiddenField = toHiddenField(lifecycle)
  return function(this: ComponentInstance, ...args: any[]) {
    const hooks = this[hiddenField]
    if (hooks) {
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      originLifecycle.call(this, ...args)
    }
  }
}
