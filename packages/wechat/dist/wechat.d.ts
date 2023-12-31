import { Ref, ComputedRef, DebuggerOptions } from '@vue/reactivity';
export { ComputedGetter, ComputedRef, ComputedSetter, CustomRefFactory, DebuggerEvent, DebuggerEventExtraInfo, DebuggerOptions, DeepReadonly, EffectScheduler, EffectScope, MaybeRef, MaybeRefOrGetter, Raw, ReactiveEffect, ReactiveEffectOptions, ReactiveEffectRunner, ReactiveFlags, Ref, ShallowReactive, ShallowRef, ShallowUnwrapRef, ToRef, ToRefs, TrackOpTypes, TriggerOpTypes, UnwrapNestedRefs, UnwrapRef, WritableComputedOptions, WritableComputedRef, computed, customRef, effect, effectScope, getCurrentScope, isProxy, isReactive, isReadonly, isRef, isShallow, markRaw, onScopeDispose, proxyRefs, reactive, readonly, ref, shallowReactive, shallowReadonly, shallowRef, stop, toRaw, toRef, toRefs, toValue, triggerRef, unref } from '@vue/reactivity';

type WatchEffect = (onCleanup: OnCleanup) => void;
type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);
type WatchCallback<V = any, OV = any> = (value: V, oldValue: OV, onCleanup: OnCleanup) => any;
type MapSources<T, Immediate> = {
    [K in keyof T]: T[K] extends WatchSource<infer V> ? Immediate extends true ? V | undefined : V : T[K] extends object ? Immediate extends true ? T[K] | undefined : T[K] : never;
};
type OnCleanup = (cleanupFn: () => void) => void;
interface WatchOptionsBase extends DebuggerOptions {
    flush?: 'pre' | 'post' | 'sync';
}
interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
    immediate?: Immediate;
    deep?: boolean;
    once?: boolean;
}
type WatchStopHandle = () => void;
declare function watchEffect(effect: WatchEffect, options?: WatchOptionsBase): WatchStopHandle;
declare function watchPostEffect(effect: WatchEffect, options?: DebuggerOptions): WatchStopHandle;
declare function watchSyncEffect(effect: WatchEffect, options?: DebuggerOptions): WatchStopHandle;
type MultiWatchSources = Array<WatchSource<unknown> | object>;
declare function watch<T, Immediate extends Readonly<boolean> = false>(source: WatchSource<T>, cb: WatchCallback<T, Immediate extends true ? T | undefined : T>, options?: WatchOptions<Immediate>): WatchStopHandle;
declare function watch<T extends MultiWatchSources, Immediate extends Readonly<boolean> = false>(sources: [...T], cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchStopHandle;
declare function watch<T extends Readonly<MultiWatchSources>, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchStopHandle;
declare function watch<T extends object, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<T, Immediate extends true ? T | undefined : T>, options?: WatchOptions<Immediate>): WatchStopHandle;

declare function nextTick<R = void>(fn?: () => R): Promise<Awaited<R>>;

interface InjectionKey<T> extends Symbol {
}
declare function provide<T, K = InjectionKey<T> | string>(key: K, value: K extends InjectionKey<infer V> ? V : T): void;
declare function inject<T>(key: InjectionKey<T> | string): T | undefined;
declare function inject<T>(key: InjectionKey<T> | string, defaultValue: T, treatDefaultAsFactory?: false): T;
declare function inject<T>(key: InjectionKey<T> | string, defaultValue: T | (() => T), treatDefaultAsFactory: true): T;

type Bindings = Record<string, any> | void;

type AppSetup = (this: void, options: WechatMiniprogram.App.LaunchShowOption) => Bindings;
type AppOptions<T extends WechatMiniprogram.IAnyObject> = {
    setup?: AppSetup;
} & WechatMiniprogram.App.Options<T>;
declare function createApp(setup: AppSetup): void;
declare function createApp<T extends WechatMiniprogram.IAnyObject>(options: AppOptions<T>): void;

type Query = Record<string, string | undefined>;
type PageContext = WechatMiniprogram.Page.InstanceProperties & Omit<WechatMiniprogram.Page.InstanceMethods<Record<string, any>>, 'setData' | 'groupSetData' | 'hasBehavior' | 'triggerEvent' | 'selectOwnerComponent' | 'getRelationNodes'>;
type PageSetup = (this: void, query: Query, context: PageContext) => Bindings;
type PageOptions<Data extends WechatMiniprogram.Page.DataOption, Custom extends WechatMiniprogram.Page.CustomOption> = {
    setup?: PageSetup;
} & WechatMiniprogram.Page.Options<Data, Custom>;
interface Config {
    listenPageScroll?: boolean;
    canShareToOthers?: boolean;
    canShareToTimeline?: boolean;
}
declare function definePage(setup: PageSetup, config?: Config): void;
declare function definePage<Data extends WechatMiniprogram.Page.DataOption, Custom extends WechatMiniprogram.Page.CustomOption>(options: PageOptions<Data, Custom>, config?: Config): void;

type ComponentContext = WechatMiniprogram.Component.InstanceProperties & Omit<WechatMiniprogram.Component.InstanceMethods<Record<string, any>>, 'setData' | 'groupSetData' | 'hasBehavior'>;
type ComponentSetup<Props extends Record<string, any>> = (this: void, props: Readonly<Props>, context: ComponentContext) => Bindings;
type ComponentOptionsWithoutProps<Data extends WechatMiniprogram.Component.DataOption, Methods extends WechatMiniprogram.Component.MethodOption> = WechatMiniprogram.Component.Options<Data, WechatMiniprogram.Component.PropertyOption, Methods> & {
    properties?: undefined;
} & {
    setup?: ComponentSetup<{}>;
};
type ComponentOptionsWithProps<Props extends WechatMiniprogram.Component.PropertyOption, Data extends WechatMiniprogram.Component.DataOption, Methods extends WechatMiniprogram.Component.MethodOption> = WechatMiniprogram.Component.Options<Data, Props, Methods> & {
    setup?: ComponentSetup<PropertyOptionToData<Props>>;
};
/** * Temporary patch for https://github.com/wechat-miniprogram/api-typings/issues/97 ***/
type PropertyOptionToData<T extends WechatMiniprogram.Component.PropertyOption> = {
    [Name in keyof T]: PropertyToData<T[Name]>;
};
type PropertyToData<T extends WechatMiniprogram.Component.AllProperty> = T extends WechatMiniprogram.Component.PropertyType ? WechatMiniprogram.Component.ValueType<T> : T extends WechatMiniprogram.Component.AllFullProperty ? T['optionalTypes'] extends OptionalTypes<infer Option> ? WechatMiniprogram.Component.ValueType<Option | T['type']> : WechatMiniprogram.Component.ValueType<T['type']> : never;
type OptionalTypes<T extends WechatMiniprogram.Component.PropertyType> = T[];
declare function defineComponent(setup: ComponentSetup<{}>, config?: Config): string;
declare function defineComponent<Data extends WechatMiniprogram.Component.DataOption, Methods extends WechatMiniprogram.Component.MethodOption>(options: ComponentOptionsWithoutProps<Data, Methods>, config?: Config): string;
declare function defineComponent<Props extends WechatMiniprogram.Component.PropertyOption, Data extends WechatMiniprogram.Component.DataOption, Methods extends WechatMiniprogram.Component.MethodOption>(options: ComponentOptionsWithProps<Props, Data, Methods>, config?: Config): string;

declare const onAppShow: (hook: (options: WechatMiniprogram.App.LaunchShowOption) => unknown) => void;
declare const onAppHide: (hook: () => unknown) => void;
declare const onAppError: (hook: (error: string) => unknown) => void;
declare const onPageNotFound: (hook: (options: WechatMiniprogram.App.PageNotFoundOption) => unknown) => void;
declare const onUnhandledRejection: (hook: (options: WechatMiniprogram.OnUnhandledRejectionListenerResult) => unknown) => void;
declare const onThemeChange: (hook: (options: WechatMiniprogram.OnThemeChangeListenerResult) => unknown) => void;
declare const onShow: (hook: () => unknown) => void;
declare const onHide: (hook: () => unknown) => void;
declare const onUnload: (hook: () => unknown) => void;
declare const onPullDownRefresh: (hook: () => unknown) => void;
declare const onReachBottom: (hook: () => unknown) => void;
declare const onResize: (hook: (resize: WechatMiniprogram.Page.IResizeOption) => unknown) => void;
declare const onTabItemTap: (hook: (tap: WechatMiniprogram.Page.ITabItemTapOption) => unknown) => void;
declare const onPageScroll: (hook: (scroll: WechatMiniprogram.Page.IPageScrollOption) => unknown) => void;
declare const onShareAppMessage: (hook: (share: WechatMiniprogram.Page.IShareAppMessageOption) => WechatMiniprogram.Page.ICustomShareContent) => void;
declare const onShareTimeline: (hook: () => WechatMiniprogram.Page.ICustomTimelineContent) => void;
declare const onAddToFavorites: (hook: (share: WechatMiniprogram.Page.IAddToFavoritesOption) => WechatMiniprogram.Page.IAddToFavoritesContent) => void;
declare const onReady: (hook: () => unknown) => void;
declare const onLoad: (hook: (query: Query) => unknown) => void;
declare const onMove: (hook: () => unknown) => void;
declare const onDetach: (hook: () => unknown) => void;
declare const onError: (hook: (error: Error) => unknown) => void;

export { type AppOptions, type AppSetup, type Bindings, type ComponentContext, type ComponentOptionsWithProps, type ComponentOptionsWithoutProps, type ComponentSetup, type Config, type InjectionKey, type PageContext, type PageOptions, type PageSetup, type Query, type WatchCallback, type WatchEffect, type WatchOptions, type WatchOptionsBase, type WatchSource, type WatchStopHandle, createApp, defineComponent, definePage, inject, nextTick, onAddToFavorites, onAppError, onAppHide, onAppShow, onDetach, onError, onHide, onLoad, onMove, onPageNotFound, onPageScroll, onPullDownRefresh, onReachBottom, onReady, onResize, onShareAppMessage, onShareTimeline, onShow, onTabItemTap, onThemeChange, onUnhandledRejection, onUnload, provide, watch, watchEffect, watchPostEffect, watchSyncEffect };
