// Public API ------------------------------------------------------------------

export {
  // Core
  computed,
  reactive,
  ref,
  readonly,
  // Utilities
  unref,
  proxyRefs,
  isRef,
  toRef,
  toRefs,
  isProxy,
  isReactive,
  isReadonly,
  // Advanced
  customRef,
  triggerRef,
  shallowRef,
  shallowReactive,
  shallowReadonly,
  markRaw,
  toRaw,
  // Effect
  effect,
  stop,
  ReactiveEffect,
  // Effect scope
  effectScope,
  EffectScope,
  getCurrentScope,
  onScopeDispose,
} from '@vue/reactivity'
export { watch, watchEffect, watchPostEffect, watchSyncEffect } from './watch'
export { nextTick } from './scheduler'
export { provide, inject } from './inject'
export { createApp } from './app'
export { definePage } from './page'
export { defineComponent } from './component'
export {
  onAppShow,
  onAppHide,
  onAppError,
  onPageNotFound,
  onUnhandledRejection,
  onThemeChange,
  onShow,
  onHide,
  onUnload,
  onPullDownRefresh,
  onReachBottom,
  onResize,
  onTabItemTap,
  onPageScroll,
  onShareAppMessage,
  onShareTimeline,
  onAddToFavorites,
  onReady,
  onLoad,
  onMove,
  onDetach,
  onError,
} from './lifecycle'

// Types -----------------------------------------------------------------------

export type {
  Ref,
  ToRef,
  ToRefs,
  ReactiveEffectOptions,
  DebuggerEvent,
  DebuggerOptions,
  TrackOpTypes,
  TriggerOpTypes,
  ComputedRef,
  WritableComputedRef,
  UnwrapRef,
  ShallowUnwrapRef,
  WritableComputedOptions,
  DeepReadonly,
} from '@vue/reactivity'
export type {
  WatchEffect,
  WatchOptions,
  WatchOptionsBase,
  WatchCallback,
  WatchSource,
  WatchStopHandle,
} from './watch'
export type { InjectionKey } from './inject'
export type { Bindings } from './instance'
export type { AppSetup, AppOptions } from './app'
export type { Query, PageContext, PageSetup, PageOptions, Config } from './page'
export type {
  ComponentContext,
  ComponentSetup,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithProps,
} from './component'
