import { ReactiveEffect } from '@vue/reactivity'

export type Bindings = Record<string, any> | void

export type AppInstance = Record<string, any>

export type PageInstance = WechatMiniprogram.Page.InstanceProperties &
  WechatMiniprogram.Page.InstanceMethods<Record<string, unknown>> & {
    [key: string]: any
    __isInjectedShareToOthersHook__?: () => true
    __isInjectedShareToTimelineHook__?: () => true
    __isInjectedFavoritesHook__?: () => true
    __listenPageScroll__?: () => true
    __effects__?: ReactiveEffect[]
  }

export type ComponentInstance = WechatMiniprogram.Component.InstanceProperties &
  WechatMiniprogram.Component.InstanceMethods<Record<string, unknown>> & {
    [key: string]: any
    __isInjectedShareToOthersHook__?: () => true
    __isInjectedShareToTimelineHook__?: () => true
    __isInjectedFavoritesHook__?: () => true
    __listenPageScroll__?: () => true
    __effects__?: ReactiveEffect[]
    __props__: undefined | Record<string, any>
  }

export let currentApp: AppInstance | null = null

export let currentPage: PageInstance | null = null

export let currentComponent: ComponentInstance | null = null

export function getCurrentInstance(): PageInstance | ComponentInstance | null {
  return currentPage || currentComponent
}

export function setCurrentApp(page: AppInstance | null): void {
  currentApp = page
}

export function setCurrentPage(page: PageInstance | null): void {
  currentPage = page
}

export function setCurrentComponent(component: ComponentInstance | null): void {
  currentComponent = component
}
