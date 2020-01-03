import { stop } from '@next-vue/reactivity'
import { PageLifecycle, Config, Bindings } from './page'
import { deepToRaw, deepWatch } from './shared'
import { setCurrentComponent, Component } from './instance'
import { isFunction, toHiddenField } from './utils'

export type ComponentContext = WechatMiniprogram.Component.InstanceProperties &
  Omit<
    WechatMiniprogram.Component.InstanceMethods<Record<string, unknown>>,
    'setData' | 'hasBehavior'
  > & {
    selectOwnerComponent: () => WechatMiniprogram.Component.TrivialInstance
    animate: (...args: any[]) => void
    clearAnimation: (...args: any[]) => void
  }
export type ComponentSetup = (props: any, context: ComponentContext) => Bindings
export interface ComponentOptions {
  [key: string]: unknown
  setup?: ComponentSetup
}
export type OutputComponentOptions = Record<string, any>

export const enum ComponentLifecycle {
  CREATED = 'created',
  ATTACHED = 'attached',
  READY = 'ready',
  MOVED = 'moved',
  DETACHED = 'detached',
  ERROR = 'error'
}

export function createComponent(
  optionsOrSetup: ComponentOptions | ComponentSetup,
  config: Config = { listenPageScroll: false }
): OutputComponentOptions {
  let setup: ComponentSetup
  let options: OutputComponentOptions
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
  }

  let binding: Bindings
  if (options.lifetimes === undefined) {
    options.lifetimes = {}
  }

  const originCreated =
    options.lifetimes[ComponentLifecycle.CREATED] ||
    options[ComponentLifecycle.CREATED]
  options.lifetimes[ComponentLifecycle.CREATED] = function(this: Component) {
    setCurrentComponent(this)
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
    binding = setup(this.data, context)
    if (originCreated !== undefined) {
      if (isFunction(originCreated)) {
        originCreated.call(this)
      } else {
        this[originCreated]()
      }
    }

    setCurrentComponent(null)
  }

  const attached = createComponentLifecycle(
    options,
    ComponentLifecycle.ATTACHED
  )
  options.lifetimes[ComponentLifecycle.ATTACHED] = function(this: Component) {
    if (binding !== undefined) {
      Object.keys(binding).forEach(key => {
        const value = (binding as Record<string, unknown>)[key]
        if (isFunction(value)) {
          this[key] = value
          return
        }

        this.setData({ [key]: deepToRaw(value) })
        deepWatch.call(this, key, value)
      })
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

  options[ComponentLifecycle.READY] = createComponentLifecycle(
    options,
    ComponentLifecycle.READY
  )
  options[ComponentLifecycle.MOVED] = createComponentLifecycle(
    options,
    ComponentLifecycle.MOVED
  )
  options[ComponentLifecycle.ERROR] = createComponentLifecycle(
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

  options.pageLifetimes.show = createPageLifecycle(
    options,
    PageLifecycle.ON_SHOW
  )
  options.pageLifetimes.hide = createPageLifecycle(
    options,
    PageLifecycle.ON_HIDE
  )
  options.pageLifetimes.resize = createPageLifecycle(
    options,
    PageLifecycle.ON_RESIZE
  )

  return options
}

function createComponentLifecycle(
  options: OutputComponentOptions,
  lifecycle: ComponentLifecycle
): (...args: any[]) => void {
  const originLifecycle = options.lifetimes[lifecycle] || options[lifecycle]
  return function(this: Component, ...args: any[]) {
    const hooks = this[toHiddenField(lifecycle)]
    if (hooks) {
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      if (isFunction(originLifecycle)) {
        originLifecycle.call(this)
      } else {
        this[originLifecycle](...args)
      }
    }
  }
}

function createPageLifecycle(
  options: OutputComponentOptions,
  lifecycle: PageLifecycle
): (...args: any[]) => void {
  const isSpecialPageLifecycle =
    lifecycle === PageLifecycle.ON_SHOW ||
    lifecycle === PageLifecycle.ON_HIDE ||
    lifecycle === PageLifecycle.ON_RESIZE
  const originLifecycle = isSpecialPageLifecycle
    ? options.pageLifetimes[lifecycle]
    : options.methods[lifecycle]
  return function(this: Component, ...args: any[]) {
    const hooks = this[toHiddenField(lifecycle)]
    if (hooks) {
      hooks.forEach((hook: Function) => hook(...args))
    }

    if (originLifecycle !== undefined) {
      if (isSpecialPageLifecycle) {
        if (isFunction(originLifecycle)) {
          originLifecycle.call(this)
        } else {
          this[originLifecycle](...args)
        }
      } else {
        originLifecycle.call(this, ...args)
      }
    }
  }
}
