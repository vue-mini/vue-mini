import type { EffectScope } from '@vue/reactivity'

export type Bindings = Record<string, any> | void

export type AppInstance = Record<string, any>

export type PageInstance = WechatMiniprogram.Page.InstanceProperties &
  WechatMiniprogram.Page.InstanceMethods<Record<string, unknown>> & {
    [key: string]: any
    __isInjectedShareToOthersHook__?: () => true
    __isInjectedShareToTimelineHook__?: () => true
    __isInjectedFavoritesHook__?: () => true
    __isInjectedExitStateHook__?: () => true
    __listenPageScroll__?: () => true
    __setData__?: () => void
    __data__?: Record<string, any>
    __scope__: EffectScope
  }

export type ComponentInstance = WechatMiniprogram.Component.InstanceProperties &
  WechatMiniprogram.Component.InstanceMethods<Record<string, unknown>> & {
    [key: string]: any
    __isInjectedShareToOthersHook__?: () => true
    __isInjectedShareToTimelineHook__?: () => true
    __isInjectedFavoritesHook__?: () => true
    __isInjectedExitStateHook__?: () => true
    __listenPageScroll__?: () => true
    __setData__?: () => void
    __data__?: Record<string, any>
    __scope__: EffectScope
    __props__?: Record<string, any>
  }

export let currentApp: AppInstance | null = null

export let currentPage: PageInstance | null = null

export let currentComponent: ComponentInstance | null = null

export function getCurrentInstance(): PageInstance | ComponentInstance | null {
  return currentPage || currentComponent
}

export function setCurrentApp(app: AppInstance): void {
  currentApp = app
}

export function unsetCurrentApp(): void {
  currentApp = null
}

export function setCurrentPage(page: PageInstance): void {
  currentPage = page
}

export function unsetCurrentPage(): void {
  currentPage = null
}

export function setCurrentComponent(component: ComponentInstance): void {
  currentComponent = component
}

export function unsetCurrentComponent(): void {
  currentComponent = null
}
