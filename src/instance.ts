import { ReactiveEffect } from '@next-vue/reactivity'

export type Page = WechatMiniprogram.Page.InstanceProperties &
  WechatMiniprogram.Page.InstanceMethods<Record<string, unknown>> & {
    [key: string]: any
    _isInjectedShareHook?: () => true
    _listenPageScroll?: () => true
    _effects?: ReactiveEffect[]
  }

export type Component = WechatMiniprogram.Component.InstanceProperties &
  WechatMiniprogram.Component.InstanceMethods<Record<string, unknown>> & {
    [key: string]: any
    _effects?: ReactiveEffect[]
  }

export let currentPage: Page | null = null

export let currentComponent: Component | null = null

export function getCurrentInstance(): Page | Component | null {
  return currentPage || currentComponent
}

export function setCurrentPage(page: Page | null): void {
  currentPage = page
}

export function setCurrentComponent(component: Component | null): void {
  currentComponent = component
}
