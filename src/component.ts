import { stop, shallowReadonly, lock, unlock } from '@next-vue/reactivity'
import { PageLifecycle, Config, Bindings } from './page'
import { deepToRaw, deepWatch } from './shared'
import { setCurrentComponent, Component } from './instance'
import { isFunction, toHiddenField } from './utils'

interface MissingInstanceMethods {
  selectOwnerComponent: () => WechatMiniprogram.Component.TrivialInstance
  animate: (...args: any[]) => void
  clearAnimation: (...args: any[]) => void
}

export type ComponentContext = WechatMiniprogram.Component.InstanceProperties &
  Omit<
    WechatMiniprogram.Component.InstanceMethods<Record<string, unknown>>,
    'setData' | 'hasBehavior'
  > &
  MissingInstanceMethods

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
} & ThisType<MissingInstanceMethods>

export type ComponentOptionsWithProps<
  Props extends WechatMiniprogram.Component.PropertyOption = WechatMiniprogram.Component.PropertyOption,
  RawBindings extends Bindings = Bindings,
  Data extends WechatMiniprogram.Component.DataOption = WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption = WechatMiniprogram.Component.MethodOption
> = WechatMiniprogram.Component.Options<Data, Props, Methods> & {
  setup?: ComponentSetup<
    WechatMiniprogram.Component.PropertyOptionToData<Props>,
    RawBindings
  >
} & ThisType<MissingInstanceMethods>

export type OutputComponentOptions = Record<string, any>

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
): OutputComponentOptions

export function defineComponent<
  RawBindings extends Bindings,
  Data extends WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption
>(
  options: ComponentOptionsWithoutProps<RawBindings, Data, Methods>,
  config?: Config
): OutputComponentOptions

export function defineComponent<
  Props extends WechatMiniprogram.Component.PropertyOption,
  RawBindings extends Bindings,
  Data extends WechatMiniprogram.Component.DataOption,
  Methods extends WechatMiniprogram.Component.MethodOption
>(
  options: ComponentOptionsWithProps<Props, RawBindings, Data, Methods>,
  config?: Config
): OutputComponentOptions

export function defineComponent(
  optionsOrSetup:
    | ComponentOptionsWithProps
    | ComponentOptionsWithoutProps
    | ComponentSetup,
  config: Config = { listenPageScroll: false }
): OutputComponentOptions {
  let setup: ComponentSetup
  let options: OutputComponentOptions
  let properties: string[] | null = null
  if (isFunction(optionsOrSetup)) {
    setup = optionsOrSetup
    options = {}
  } else {
    if (optionsOrSetup.setup === undefined) {
      return optionsOrSetup
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
  options.lifetimes[ComponentLifecycle.CREATED] = function(this: Component) {
    setCurrentComponent(this)
    const rawProps: Record<string, any> = {}
    if (properties) {
      properties.forEach(property => {
        rawProps[property] = this[property]
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
  options.lifetimes[ComponentLifecycle.ATTACHED] = function(this: Component) {
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
  options.lifetimes[ComponentLifecycle.DETACHED] = function(this: Component) {
    detached.call(this)

    if (this._effects) {
      this._effects.forEach(effect => stop(effect))
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
    options.methods._listenPageScroll = () => true
  }

  if (options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined) {
    options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] = function(
      this: Component,
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

    options.methods._isInjectedShareHook = () => true
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
      options.observers[property] = function(this: Component, value: any) {
        unlock()
        ;(props as Record<string, any>)[property] = value
        lock()

        if (originObserver !== undefined) {
          originObserver.call(this, value)
        }
      }
    })
  }

  return options
}

function createComponentLifecycle(
  options: OutputComponentOptions,
  lifecycle: ComponentLifecycle
): (...args: any[]) => void {
  const originLifecycle = options.lifetimes[lifecycle] || options[lifecycle]
  return createLifecycle(lifecycle, originLifecycle)
}

function createPageLifecycle(
  options: OutputComponentOptions,
  lifecycle: PageLifecycle
): (...args: any[]) => void {
  const originLifecycle = options.methods[lifecycle]
  return createLifecycle(lifecycle, originLifecycle)
}

function createSpecialPageLifecycle(
  options: OutputComponentOptions,
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
  return function(this: Component, ...args: any[]) {
    const hooks = this[hiddenField]
    if (hooks) {
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      originLifecycle.call(this, ...args)
    }
  }
}
