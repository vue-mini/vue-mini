import type { EffectScope } from '@vue/reactivity'
import { setCurrentScope } from '@vue/reactivity'

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
    __scope__: EffectScope
    __props__: undefined | Record<string, any>
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

export function setCurrentPage(page: PageInstance): EffectScope | undefined {
  currentPage = page
  return setCurrentScope(page.__scope__)
}

export function unsetCurrentPage(scope: EffectScope | undefined): void {
  setCurrentScope(scope)
  currentPage = null
}

export function setCurrentComponent(
  component: ComponentInstance,
): EffectScope | undefined {
  currentComponent = component
  return setCurrentScope(component.__scope__)
}

export function unsetCurrentComponent(scope: EffectScope | undefined): void {
  setCurrentScope(scope)
  currentComponent = null
}
