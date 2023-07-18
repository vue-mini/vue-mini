import type { EffectScope } from '@vue/reactivity'

export type Bindings = Record<string, any> | void

export type AppInstance = Record<string, any>

export type PageInstance = WechatMiniprogram.Page.InstanceProperties &
  WechatMiniprogram.Page.InstanceMethods<Record<string, unknown>> & {
    [key: string]: any
    __isInjectedShareToOthersHook__?: () => true
    __isInjectedShareToTimelineHook__?: () => true
    __isInjectedFavoritesHook__?: () => true
    __listenPageScroll__?: () => true
    __scope__: EffectScope
  }

export type ComponentInstance = WechatMiniprogram.Component.InstanceProperties &
  WechatMiniprogram.Component.InstanceMethods<Record<string, unknown>> & {
    [key: string]: any
    __isInjectedShareToOthersHook__?: () => true
    __isInjectedShareToTimelineHook__?: () => true
    __isInjectedFavoritesHook__?: () => true
    __listenPageScroll__?: () => true
    __scope__: EffectScope
    __props__: undefined | Record<string, any>
  }

export let currentApp: AppInstance | null = null

export let currentPage: PageInstance | null = null

export let currentComponent: ComponentInstance | null = null

export function getCurrentInstance(): PageInstance | ComponentInstance | null {
  return currentPage || currentComponent
}

export function setCurrentApp(page: AppInstance): void {
  currentApp = page
}

export function unsetCurrentApp(): void {
  currentApp = null
}

export function setCurrentPage(page: PageInstance): void {
  currentPage = page
  page.__scope__.on()
}

export function unsetCurrentPage(): void {
  /* istanbul ignore else */
  if (currentPage) {
    currentPage.__scope__.off()
  }

  currentPage = null
}

export function setCurrentComponent(component: ComponentInstance): void {
  currentComponent = component
  component.__scope__.on()
}

export function unsetCurrentComponent(): void {
  /* istanbul ignore else */
  if (currentComponent) {
    currentComponent.__scope__.off()
  }

  currentComponent = null
}
