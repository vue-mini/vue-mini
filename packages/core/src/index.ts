// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="@vue-mini/miniprogram-api-typings" preserve="true" />

// Core API ------------------------------------------------------------------

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
  toValue,
  toRefs,
  isProxy,
  isReactive,
  isReadonly,
  isShallow,
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
  onRouteDone,
  onPullDownRefresh,
  onReachBottom,
  onResize,
  onTabItemTap,
  onPageScroll,
  onShareAppMessage,
  onShareTimeline,
  onAddToFavorites,
  onSaveExitState,
  onReady,
  onLoad,
  onMove,
  onDetach,
  onError,
} from './lifecycle'

// Types -----------------------------------------------------------------------

export { TrackOpTypes, TriggerOpTypes } from '@vue/reactivity'
export type {
  Ref,
  MaybeRef,
  MaybeRefOrGetter,
  ToRef,
  ToRefs,
  UnwrapRef,
  ShallowRef,
  ShallowUnwrapRef,
  CustomRefFactory,
  ReactiveFlags,
  DeepReadonly,
  ShallowReactive,
  UnwrapNestedRefs,
  ComputedRef,
  WritableComputedRef,
  WritableComputedOptions,
  ComputedGetter,
  ComputedSetter,
  ReactiveEffectRunner,
  ReactiveEffectOptions,
  EffectScheduler,
  DebuggerOptions,
  DebuggerEvent,
  DebuggerEventExtraInfo,
  Raw,
  Reactive,
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
