/// <reference types="wechat-miniprogram" />

import { computed } from '@vue/reactivity';
import { ComputedRef } from '@vue/reactivity';
import { customRef } from '@vue/reactivity';
import { DebuggerEvent } from '@vue/reactivity';
import { DebuggerOptions } from '@vue/reactivity';
import { DeepReadonly } from '@vue/reactivity';
import { effect } from '@vue/reactivity';
import { EffectScope } from '@vue/reactivity';
import { effectScope } from '@vue/reactivity';
import { getCurrentScope } from '@vue/reactivity';
import { isProxy } from '@vue/reactivity';
import { isReactive } from '@vue/reactivity';
import { isReadonly } from '@vue/reactivity';
import { isRef } from '@vue/reactivity';
import { markRaw } from '@vue/reactivity';
import { onScopeDispose } from '@vue/reactivity';
import { proxyRefs } from '@vue/reactivity';
import { reactive } from '@vue/reactivity';
import { ReactiveEffect } from '@vue/reactivity';
import { ReactiveEffectOptions } from '@vue/reactivity';
import { readonly } from '@vue/reactivity';
import { Ref } from '@vue/reactivity';
import { ref } from '@vue/reactivity';
import { shallowReactive } from '@vue/reactivity';
import { shallowReadonly } from '@vue/reactivity';
import { shallowRef } from '@vue/reactivity';
import { ShallowUnwrapRef } from '@vue/reactivity';
import { stop } from '@vue/reactivity';
import { toRaw } from '@vue/reactivity';
import { ToRef } from '@vue/reactivity';
import { toRef } from '@vue/reactivity';
import { ToRefs } from '@vue/reactivity';
import { toRefs } from '@vue/reactivity';
import { TrackOpTypes } from '@vue/reactivity';
import { TriggerOpTypes } from '@vue/reactivity';
import { triggerRef } from '@vue/reactivity';
import { unref } from '@vue/reactivity';
import { UnwrapRef } from '@vue/reactivity';
import { WritableComputedOptions } from '@vue/reactivity';
import { WritableComputedRef } from '@vue/reactivity';

export declare type AppOptions<T extends WechatMiniprogram.IAnyObject> = {
    setup?: AppSetup;
} & WechatMiniprogram.App.Options<T>;

export declare type AppSetup = (this: void, options: WechatMiniprogram.App.LaunchShowOption) => Bindings;

export declare type Bindings = Record<string, any> | void;

export declare type ComponentContext = WechatMiniprogram.Component.InstanceProperties & Omit<WechatMiniprogram.Component.InstanceMethods<Record<string, any>>, 'setData' | 'groupSetData' | 'hasBehavior'>;

export declare type ComponentOptionsWithoutProps<Data extends WechatMiniprogram.Component.DataOption, Methods extends WechatMiniprogram.Component.MethodOption> = WechatMiniprogram.Component.Options<Data, WechatMiniprogram.Component.PropertyOption, Methods> & {
    properties?: undefined;
} & {
    setup?: ComponentSetup<{}>;
};

export declare type ComponentOptionsWithProps<Props extends WechatMiniprogram.Component.PropertyOption, Data extends WechatMiniprogram.Component.DataOption, Methods extends WechatMiniprogram.Component.MethodOption> = WechatMiniprogram.Component.Options<Data, Props, Methods> & {
    setup?: ComponentSetup<PropertyOptionToData<Props>>;
};

export declare type ComponentSetup<Props extends Record<string, any>> = (this: void, props: Readonly<Props>, context: ComponentContext) => Bindings;

export { computed }

export { ComputedRef }

export declare interface Config {
    listenPageScroll?: boolean;
    canShareToOthers?: boolean;
    canShareToTimeline?: boolean;
}

export declare function createApp(setup: AppSetup): void;

export declare function createApp<T extends WechatMiniprogram.IAnyObject>(options: AppOptions<T>): void;

export { customRef }

export { DebuggerEvent }

export { DebuggerOptions }

export { DeepReadonly }

export declare function defineComponent(setup: ComponentSetup<{}>, config?: Config): string;

export declare function defineComponent<Data extends WechatMiniprogram.Component.DataOption, Methods extends WechatMiniprogram.Component.MethodOption>(options: ComponentOptionsWithoutProps<Data, Methods>, config?: Config): string;

export declare function defineComponent<Props extends WechatMiniprogram.Component.PropertyOption, Data extends WechatMiniprogram.Component.DataOption, Methods extends WechatMiniprogram.Component.MethodOption>(options: ComponentOptionsWithProps<Props, Data, Methods>, config?: Config): string;

export declare function definePage(setup: PageSetup, config?: Config): void;

export declare function definePage<Data extends WechatMiniprogram.Page.DataOption, Custom extends WechatMiniprogram.Page.CustomOption>(options: PageOptions<Data, Custom>, config?: Config): void;

export { effect }

export { EffectScope }

export { effectScope }

export { getCurrentScope }

export declare function inject<T>(key: InjectionKey<T> | string): T | undefined;

export declare function inject<T>(key: InjectionKey<T> | string, defaultValue: T, treatDefaultAsFactory?: false): T;

export declare function inject<T>(key: InjectionKey<T> | string, defaultValue: T | (() => T), treatDefaultAsFactory: true): T;

export declare interface InjectionKey<T> extends Symbol {
}

declare type InvalidateCbRegistrator = (cb: () => void) => void;

export { isProxy }

export { isReactive }

export { isReadonly }

export { isRef }

declare type MapSources<T, Immediate> = {
    [K in keyof T]: T[K] extends WatchSource<infer V> ? Immediate extends true ? V | undefined : V : T[K] extends object ? Immediate extends true ? T[K] | undefined : T[K] : never;
};

export { markRaw }

declare type MultiWatchSources = Array<WatchSource<unknown> | object>;

export declare function nextTick(fn?: () => void): Promise<void>;

export declare const onAddToFavorites: (hook: (share: WechatMiniprogram.Page.IAddToFavoritesOption) => WechatMiniprogram.Page.IAddToFavoritesContent) => void;

export declare const onAppError: (hook: (error: string) => unknown) => void;

export declare const onAppHide: (hook: () => unknown) => void;

export declare const onAppShow: (hook: (options: WechatMiniprogram.App.LaunchShowOption) => unknown) => void;

export declare const onDetach: (hook: () => unknown) => void;

export declare const onError: (hook: (error: Error) => unknown) => void;

export declare const onHide: (hook: () => unknown) => void;

export declare const onLoad: (hook: (query: Query) => unknown) => void;

export declare const onMove: (hook: () => unknown) => void;

export declare const onPageNotFound: (hook: (options: WechatMiniprogram.App.PageNotFoundOption) => unknown) => void;

export declare const onPageScroll: (hook: (scroll: WechatMiniprogram.Page.IPageScrollOption) => unknown) => void;

export declare const onPullDownRefresh: (hook: () => unknown) => void;

export declare const onReachBottom: (hook: () => unknown) => void;

export declare const onReady: (hook: () => unknown) => void;

export declare const onResize: (hook: (resize: WechatMiniprogram.Page.IResizeOption) => unknown) => void;

export { onScopeDispose }

export declare const onShareAppMessage: (hook: (share: WechatMiniprogram.Page.IShareAppMessageOption) => WechatMiniprogram.Page.ICustomShareContent) => void;

export declare const onShareTimeline: (hook: () => WechatMiniprogram.Page.ICustomTimelineContent) => void;

export declare const onShow: (hook: () => unknown) => void;

export declare const onTabItemTap: (hook: (tap: WechatMiniprogram.Page.ITabItemTapOption) => unknown) => void;

export declare const onThemeChange: (hook: (options: WechatMiniprogram.OnThemeChangeCallbackResult) => unknown) => void;

export declare const onUnhandledRejection: (hook: (options: WechatMiniprogram.OnUnhandledRejectionCallbackResult) => unknown) => void;

export declare const onUnload: (hook: () => unknown) => void;

declare type OptionalTypes<T extends WechatMiniprogram.Component.PropertyType> = T[];

export declare type PageContext = WechatMiniprogram.Page.InstanceProperties & Omit<WechatMiniprogram.Page.InstanceMethods<Record<string, any>>, 'setData' | 'groupSetData' | 'hasBehavior' | 'triggerEvent' | 'selectOwnerComponent' | 'getRelationNodes'>;

export declare type PageOptions<Data extends WechatMiniprogram.Page.DataOption, Custom extends WechatMiniprogram.Page.CustomOption> = {
    setup?: PageSetup;
} & WechatMiniprogram.Page.Options<Data, Custom>;

export declare type PageSetup = (this: void, query: Query, context: PageContext) => Bindings;

/** * Temporary patch for https://github.com/wechat-miniprogram/api-typings/issues/97 ***/
declare type PropertyOptionToData<T extends WechatMiniprogram.Component.PropertyOption> = {
    [Name in keyof T]: PropertyToData<T[Name]>;
};

declare type PropertyToData<T extends WechatMiniprogram.Component.AllProperty> = T extends WechatMiniprogram.Component.PropertyType ? WechatMiniprogram.Component.ValueType<T> : T extends WechatMiniprogram.Component.AllFullProperty ? T['optionalTypes'] extends OptionalTypes<infer Option> ? WechatMiniprogram.Component.ValueType<Option | T['type']> : WechatMiniprogram.Component.ValueType<T['type']> : never;

export declare function provide<T>(key: InjectionKey<T> | string, value: T): void;

export { proxyRefs }

export declare type Query = Record<string, string | undefined>;

export { reactive }

export { ReactiveEffect }

export { ReactiveEffectOptions }

export { readonly }

export { Ref }

export { ref }

export { shallowReactive }

export { shallowReadonly }

export { shallowRef }

export { ShallowUnwrapRef }

export { stop }

export { toRaw }

export { ToRef }

export { toRef }

export { ToRefs }

export { toRefs }

export { TrackOpTypes }

export { TriggerOpTypes }

export { triggerRef }

export { unref }

export { UnwrapRef }

export declare function watch<T extends MultiWatchSources, Immediate extends Readonly<boolean> = false>(sources: [...T], cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchStopHandle;

export declare function watch<T extends Readonly<MultiWatchSources>, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<MapSources<T, false>, MapSources<T, Immediate>>, options?: WatchOptions<Immediate>): WatchStopHandle;

export declare function watch<T, Immediate extends Readonly<boolean> = false>(source: WatchSource<T>, cb: WatchCallback<T, Immediate extends true ? T | undefined : T>, options?: WatchOptions<Immediate>): WatchStopHandle;

export declare function watch<T extends object, Immediate extends Readonly<boolean> = false>(source: T, cb: WatchCallback<T, Immediate extends true ? T | undefined : T>, options?: WatchOptions<Immediate>): WatchStopHandle;

export declare type WatchCallback<V = any, OV = any> = (value: V, oldValue: OV, onInvalidate: InvalidateCbRegistrator) => any;

export declare type WatchEffect = (onInvalidate: InvalidateCbRegistrator) => void;

export declare function watchEffect(effect: WatchEffect, options?: WatchOptionsBase): WatchStopHandle;

export declare interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
    immediate?: Immediate;
    deep?: boolean;
}

export declare interface WatchOptionsBase extends DebuggerOptions {
    flush?: 'pre' | 'post' | 'sync';
}

export declare function watchPostEffect(effect: WatchEffect, options?: DebuggerOptions): WatchStopHandle;

export declare type WatchSource<T = any> = Ref<T> | ComputedRef<T> | (() => T);

export declare type WatchStopHandle = () => void;

export declare function watchSyncEffect(effect: WatchEffect, options?: DebuggerOptions): WatchStopHandle;

export { WritableComputedOptions }

export { WritableComputedRef }

export { }
