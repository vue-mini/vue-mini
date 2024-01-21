/*!
 * vue-mini v1.0.0-beta.6
 * https://github.com/vue-mini/vue-mini
 * (c) 2019-present Yang Mingshan
 * @license MIT
 */
import { isRef, isShallow, isReactive, ReactiveEffect, getCurrentScope, ReactiveFlags, isProxy, toRaw, EffectScope, shallowReactive, shallowReadonly } from '@vue/reactivity';
export { EffectScope, ReactiveEffect, TrackOpTypes, TriggerOpTypes, computed, customRef, effect, effectScope, getCurrentScope, isProxy, isReactive, isReadonly, isRef, isShallow, markRaw, onScopeDispose, proxyRefs, reactive, readonly, ref, shallowReactive, shallowReadonly, shallowRef, stop, toRaw, toRef, toRefs, toValue, triggerRef, unref } from '@vue/reactivity';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => { };
const { isArray } = Array;
const extend = Object.assign;
function exclude(obj, keys) {
    const ret = {};
    Object.keys(obj).forEach((key) => {
        if (!keys.includes(key)) {
            ret[key] = obj[key];
        }
    });
    return ret;
}
function getType(x) {
    return Object.prototype.toString.call(x).slice(8, -1);
}
function isSimpleValue(x) {
    const simpleTypes = new Set(['undefined', 'boolean', 'number', 'string']);
    return x === null || simpleTypes.has(typeof x);
}
function isObject(x) {
    return x !== null && typeof x === 'object';
}
function isPlainObject(x) {
    return getType(x) === 'Object';
}
function isFunction(x) {
    return typeof x === 'function';
}
function isMap(x) {
    return getType(x) === 'Map';
}
function isSet(x) {
    return getType(x) === 'Set';
}
// Compare whether a value has changed, accounting for NaN.
function hasChanged(value, oldValue) {
    // eslint-disable-next-line no-self-compare
    return value !== oldValue && (value === value || oldValue === oldValue);
}
function remove(arr, el) {
    const i = arr.indexOf(el);
    if (i > -1) {
        arr.splice(i, 1);
    }
}
function toHiddenField(name) {
    return `__${name}__`;
}

let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
// eslint-disable-next-line spaced-comment
const resolvedPromise = /*#__PURE__*/ Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick(fn) {
    const p = currentFlushPromise || resolvedPromise;
    return fn ? p.then(fn) : p;
}
function queueJob(job) {
    // The dedupe search uses the startIndex argument of Array.includes()
    // by default the search index includes the current job that is being run
    // so it cannot recursively trigger itself again.
    // if the job is a watch() callback, the search will start with a +1 index to
    // allow it recursively trigger itself - it is the user's responsibility to
    // ensure it doesn't end up in an infinite loop.
    if (queue.length === 0 ||
        !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) {
        queue.push(job);
        queueFlush();
    }
}
function queueFlush() {
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true;
        currentFlushPromise = resolvedPromise.then(flushJobs);
    }
}
function queuePostFlushCb(cb) {
    if (!activePostFlushCbs ||
        !activePostFlushCbs.includes(cb, cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex)) {
        pendingPostFlushCbs.push(cb);
    }
}
function flushPostFlushCbs() {
    if (pendingPostFlushCbs.length > 0) {
        activePostFlushCbs = [...new Set(pendingPostFlushCbs)];
        pendingPostFlushCbs.length = 0;
        for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
            activePostFlushCbs[postFlushIndex]();
        }
        activePostFlushCbs = null;
        postFlushIndex = 0;
    }
}
function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;
    /* istanbul ignore else -- @preserve  */
    if ((process.env.NODE_ENV !== 'production')) {
        seen = seen || new Map();
    }
    // Conditional usage of checkRecursiveUpdate must be determined out of
    // try ... catch block since Rollup by default de-optimizes treeshaking
    // inside try-catch. This can leave all warning code unshaked. Although
    // they would get eventually shaken by a minifier like terser, some minifiers
    // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
    const check = (process.env.NODE_ENV !== 'production') ?
        (job) => checkRecursiveUpdates(seen, job)
        : /* istanbul ignore next -- @preserve  */ NOOP;
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job.active !== false) {
                /* istanbul ignore if -- @preserve  */
                if ((process.env.NODE_ENV !== 'production') && check(job)) {
                    continue;
                }
                job();
            }
        }
    }
    finally {
        flushIndex = 0;
        queue.length = 0;
        isFlushing = false;
        currentFlushPromise = null;
    }
}
function checkRecursiveUpdates(seen, fn) {
    const count = seen.get(fn) || 0;
    /* istanbul ignore if -- @preserve */
    if (count > RECURSION_LIMIT) {
        console.warn(`Maximum recursive updates exceeded. ` +
            `This means you have a reactive effect that is mutating its own ` +
            `dependencies and thus recursively triggering itself.`);
        return true;
    }
    seen.set(fn, count + 1);
    return false;
}

// Simple effect.
function watchEffect(effect, options) {
    return doWatch(effect, null, options);
}
function watchPostEffect(effect, options) {
    return doWatch(effect, null, (process.env.NODE_ENV !== 'production') ?
        extend({}, options, { flush: 'post' })
        : /* istanbul ignore next -- @preserve */ { flush: 'post' });
}
function watchSyncEffect(effect, options) {
    return doWatch(effect, null, (process.env.NODE_ENV !== 'production') ?
        extend({}, options, { flush: 'sync' })
        : /* istanbul ignore next -- @preserve */ { flush: 'sync' });
}
// Initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {};
// Implementation
function watch(source, cb, options) {
    if ((process.env.NODE_ENV !== 'production') && !isFunction(cb)) {
        console.warn(`\`watch(fn, options?)\` signature has been moved to a separate API. ` +
            `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
            `supports \`watch(source, cb, options?) signature.`);
    }
    return doWatch(source, cb, options);
}
// eslint-disable-next-line complexity
function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = {}) {
    if (cb && once) {
        const _cb = cb;
        cb = (...args) => {
            _cb(...args);
            unwatch();
        };
    }
    if ((process.env.NODE_ENV !== 'production') && deep !== undefined && typeof deep === 'number') {
        console.warn(`watch() "deep" option with number value will be used as watch depth in future versions. ` +
            `Please use a boolean instead to avoid potential breakage.`);
    }
    if ((process.env.NODE_ENV !== 'production') && !cb) {
        if (immediate !== undefined) {
            console.warn(`watch() "immediate" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
        if (deep !== undefined) {
            console.warn(`watch() "deep" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
        if (once !== undefined) {
            console.warn(`watch() "once" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
    }
    const warnInvalidSource = (s) => {
        console.warn(`Invalid watch source:`, s, `A watch source can only be a getter/effect function, a ref, ` +
            `a reactive object, or an array of these types.`);
    };
    const reactiveGetter = (source) => deep === true ?
        source // Traverse will happen in wrapped getter below
        // For deep: false, only traverse root-level properties
        : traverse(source, deep === false ? 1 : undefined);
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if (isRef(source)) {
        getter = () => source.value;
        forceTrigger = isShallow(source);
    }
    else if (isReactive(source)) {
        getter = () => reactiveGetter(source);
        forceTrigger = true;
    }
    else if (isArray(source)) {
        isMultiSource = true;
        forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
        getter = () => source.map((s) => {
            if (isRef(s)) {
                return s.value;
            }
            if (isReactive(s)) {
                return reactiveGetter(s);
            }
            if (isFunction(s)) {
                return s();
            }
            /* istanbul ignore else -- @preserve  */
            if ((process.env.NODE_ENV !== 'production')) {
                warnInvalidSource(s);
            }
            return undefined;
        });
    }
    else if (isFunction(source)) {
        if (cb) {
            // Getter with cb
            getter = () => source();
        }
        else {
            // No cb -> simple effect
            getter = () => {
                if (cleanup) {
                    cleanup();
                }
                return source(onCleanup);
            };
        }
    }
    else {
        getter = NOOP;
        /* istanbul ignore else -- @preserve  */
        if ((process.env.NODE_ENV !== 'production')) {
            warnInvalidSource(source);
        }
    }
    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }
    let cleanup;
    const onCleanup = (fn) => {
        // eslint-disable-next-line no-multi-assign
        cleanup = effect.onStop = () => {
            fn();
            // eslint-disable-next-line no-multi-assign
            cleanup = effect.onStop = undefined;
        };
    };
    let oldValue = isMultiSource ?
        Array.from({ length: source.length }).fill(INITIAL_WATCHER_VALUE)
        : INITIAL_WATCHER_VALUE;
    const job = () => {
        if (!effect.active || !effect.dirty) {
            return;
        }
        if (cb) {
            // Watch(source, cb)
            const newValue = effect.run();
            if (deep ||
                forceTrigger ||
                (isMultiSource ?
                    newValue.some((v, i) => hasChanged(v, oldValue[i]))
                    : hasChanged(newValue, oldValue))) {
                // Cleanup before running cb again
                if (cleanup) {
                    cleanup();
                }
                cb(newValue, 
                // Pass undefined as the old value when it's changed for the first time
                oldValue === INITIAL_WATCHER_VALUE ? undefined
                    : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? []
                        : oldValue, onCleanup);
                oldValue = newValue;
            }
        }
        else {
            // WatchEffect
            effect.run();
        }
    };
    // Important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger
    job.allowRecurse = Boolean(cb);
    let scheduler;
    if (flush === 'sync') {
        scheduler = job; // The scheduler function gets called directly
    }
    else if (flush === 'post') {
        scheduler = () => {
            queuePostFlushCb(job);
        };
    }
    else {
        scheduler = () => {
            queueJob(job);
        };
    }
    const effect = new ReactiveEffect(getter, NOOP, scheduler);
    const scope = getCurrentScope();
    const unwatch = () => {
        effect.stop();
        if (scope) {
            // @ts-expect-error
            remove(scope.effects, effect);
        }
    };
    /* istanbul ignore else -- @preserve */
    if ((process.env.NODE_ENV !== 'production')) {
        effect.onTrack = onTrack;
        effect.onTrigger = onTrigger;
    }
    // Initial run
    if (cb) {
        if (immediate) {
            job();
        }
        else {
            oldValue = effect.run();
        }
    }
    else {
        effect.run();
    }
    return unwatch;
}
function traverse(value, depth, currentDepth = 0, seen) {
    if (!isObject(value) || value[ReactiveFlags.SKIP]) {
        return value;
    }
    if (depth && depth > 0) {
        if (currentDepth >= depth) {
            return value;
        }
        currentDepth++;
    }
    seen = seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    /* istanbul ignore else -- @preserve  */
    if (isRef(value)) {
        traverse(value.value, depth, currentDepth, seen);
    }
    else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], depth, currentDepth, seen);
        }
    }
    else if (isSet(value) || isMap(value)) {
        value.forEach((v) => {
            traverse(v, depth, currentDepth, seen);
        });
    }
    else if (isPlainObject(value)) {
        // eslint-disable-next-line guard-for-in
        for (const key in value) {
            traverse(value[key], depth, currentDepth, seen);
        }
    }
    return value;
}

const provides = Object.create(null);
function provide(key, value) {
    // TS doesn't allow symbol as index type
    provides[key] = value;
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
    if (key in provides) {
        // TS doesn't allow symbol as index type
        return provides[key];
    }
    if (arguments.length > 1) {
        return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue()
            : defaultValue;
    }
    /* istanbul ignore else -- @preserve */
    if ((process.env.NODE_ENV !== 'production')) {
        console.warn(`injection "${String(key)}" not found.`);
    }
}

let currentApp = null;
let currentPage = null;
let currentComponent = null;
function getCurrentInstance() {
    return currentPage || currentComponent;
}
function setCurrentApp(page) {
    currentApp = page;
}
function unsetCurrentApp() {
    currentApp = null;
}
function setCurrentPage(page) {
    currentPage = page;
    // @ts-expect-error
    page.__scope__.on();
}
function unsetCurrentPage() {
    /* istanbul ignore else -- @preserve */
    if (currentPage) {
        // @ts-expect-error
        currentPage.__scope__.off();
    }
    currentPage = null;
}
function setCurrentComponent(component) {
    currentComponent = component;
    // @ts-expect-error
    component.__scope__.on();
}
function unsetCurrentComponent() {
    /* istanbul ignore else -- @preserve */
    if (currentComponent) {
        // @ts-expect-error
        currentComponent.__scope__.off();
    }
    currentComponent = null;
}

var AppLifecycle;
(function (AppLifecycle) {
    AppLifecycle["ON_LAUNCH"] = "onLaunch";
    AppLifecycle["ON_SHOW"] = "onShow";
    AppLifecycle["ON_HIDE"] = "onHide";
    AppLifecycle["ON_ERROR"] = "onError";
    AppLifecycle["ON_PAGE_NOT_FOUND"] = "onPageNotFound";
    AppLifecycle["ON_UNHANDLED_REJECTION"] = "onUnhandledRejection";
    AppLifecycle["ON_THEME_CHANGE"] = "onThemeChange";
})(AppLifecycle || (AppLifecycle = {}));
function createApp(optionsOrSetup) {
    let setup;
    let options;
    if (isFunction(optionsOrSetup)) {
        setup = optionsOrSetup;
        options = {};
    }
    else {
        if (optionsOrSetup.setup === undefined) {
            // eslint-disable-next-line new-cap
            App(optionsOrSetup);
            return;
        }
        setup = optionsOrSetup.setup;
        options = exclude(optionsOrSetup, ['setup']);
    }
    const originOnLaunch = options[AppLifecycle.ON_LAUNCH];
    options[AppLifecycle.ON_LAUNCH] = function (options) {
        setCurrentApp(this);
        const bindings = setup(options);
        if (bindings !== undefined) {
            Object.keys(bindings).forEach((key) => {
                this[key] = bindings[key];
            });
        }
        unsetCurrentApp();
        if (originOnLaunch !== undefined) {
            originOnLaunch.call(this, options);
        }
    };
    options[AppLifecycle.ON_SHOW] = createLifecycle$2(options, AppLifecycle.ON_SHOW);
    options[AppLifecycle.ON_HIDE] = createLifecycle$2(options, AppLifecycle.ON_HIDE);
    options[AppLifecycle.ON_ERROR] = createLifecycle$2(options, AppLifecycle.ON_ERROR);
    options[AppLifecycle.ON_PAGE_NOT_FOUND] = createLifecycle$2(options, AppLifecycle.ON_PAGE_NOT_FOUND);
    options[AppLifecycle.ON_UNHANDLED_REJECTION] = createLifecycle$2(options, AppLifecycle.ON_UNHANDLED_REJECTION);
    options[AppLifecycle.ON_THEME_CHANGE] = createLifecycle$2(options, AppLifecycle.ON_THEME_CHANGE);
    // eslint-disable-next-line new-cap
    App(options);
}
function createLifecycle$2(options, lifecycle) {
    const originLifecycle = options[lifecycle];
    return function (...args) {
        const hooks = this[toHiddenField(lifecycle)];
        if (hooks) {
            hooks.forEach((hook) => hook(...args));
        }
        if (originLifecycle !== undefined) {
            originLifecycle.call(this, ...args);
        }
    };
}

function deepToRaw(x) {
    if (isSimpleValue(x) || isFunction(x)) {
        return x;
    }
    if (isRef(x)) {
        return deepToRaw(x.value);
    }
    if (isProxy(x)) {
        return deepToRaw(toRaw(x));
    }
    if (isArray(x)) {
        return x.map((item) => deepToRaw(item));
    }
    if (isPlainObject(x)) {
        const obj = {};
        Object.keys(x).forEach((key) => {
            obj[key] = deepToRaw(x[key]);
        });
        return obj;
    }
    throw new TypeError(`${getType(x)} value is not supported`);
}
function deepWatch(key, value) {
    if (!isObject(value)) {
        return;
    }
    watch(isRef(value) ? value : () => value, () => {
        this.setData({ [key]: deepToRaw(value) }, flushPostFlushCbs);
    }, {
        deep: true,
    });
}

var PageLifecycle;
(function (PageLifecycle) {
    PageLifecycle["ON_LOAD"] = "onLoad";
    PageLifecycle["ON_SHOW"] = "onShow";
    PageLifecycle["ON_READY"] = "onReady";
    PageLifecycle["ON_HIDE"] = "onHide";
    PageLifecycle["ON_UNLOAD"] = "onUnload";
    PageLifecycle["ON_PULL_DOWN_REFRESH"] = "onPullDownRefresh";
    PageLifecycle["ON_REACH_BOTTOM"] = "onReachBottom";
    PageLifecycle["ON_PAGE_SCROLL"] = "onPageScroll";
    PageLifecycle["ON_SHARE_APP_MESSAGE"] = "onShareAppMessage";
    PageLifecycle["ON_SHARE_TIMELINE"] = "onShareTimeline";
    PageLifecycle["ON_ADD_TO_FAVORITES"] = "onAddToFavorites";
    PageLifecycle["ON_RESIZE"] = "onResize";
    PageLifecycle["ON_TAB_ITEM_TAP"] = "onTabItemTap";
})(PageLifecycle || (PageLifecycle = {}));
function definePage(optionsOrSetup, config) {
    config = extend({
        listenPageScroll: false,
        canShareToOthers: false,
        canShareToTimeline: false,
    }, config);
    let setup;
    let options;
    if (isFunction(optionsOrSetup)) {
        setup = optionsOrSetup;
        options = {};
    }
    else {
        if (optionsOrSetup.setup === undefined) {
            // eslint-disable-next-line new-cap
            Page(optionsOrSetup);
            return;
        }
        setup = optionsOrSetup.setup;
        options = exclude(optionsOrSetup, ['setup']);
    }
    const originOnLoad = options[PageLifecycle.ON_LOAD];
    options[PageLifecycle.ON_LOAD] = function (query) {
        this.__scope__ = new EffectScope();
        setCurrentPage(this);
        const context = {
            is: this.is,
            route: this.route,
            options: this.options,
            createSelectorQuery: this.createSelectorQuery.bind(this),
            createIntersectionObserver: this.createIntersectionObserver.bind(this),
            selectComponent: this.selectComponent.bind(this),
            selectAllComponents: this.selectAllComponents.bind(this),
            getTabBar: this.getTabBar.bind(this),
            getPageId: this.getPageId.bind(this),
            animate: this.animate.bind(this),
            clearAnimation: this.clearAnimation.bind(this),
            getOpenerEventChannel: this.getOpenerEventChannel.bind(this),
            setUpdatePerformanceListener: this.setUpdatePerformanceListener.bind(this),
            getPassiveEvent: this.getPassiveEvent.bind(this),
            setPassiveEvent: this.setPassiveEvent.bind(this),
        };
        const bindings = setup(query, context);
        if (bindings !== undefined) {
            Object.keys(bindings).forEach((key) => {
                const value = bindings[key];
                if (isFunction(value)) {
                    this[key] = value;
                    return;
                }
                this.setData({ [key]: deepToRaw(value) });
                deepWatch.call(this, key, value);
            });
        }
        unsetCurrentPage();
        if (originOnLoad !== undefined) {
            originOnLoad.call(this, query);
        }
    };
    const onUnload = createLifecycle$1(options, PageLifecycle.ON_UNLOAD);
    options[PageLifecycle.ON_UNLOAD] = function () {
        onUnload.call(this);
        this.__scope__.stop();
    };
    if (options[PageLifecycle.ON_PAGE_SCROLL] || config.listenPageScroll) {
        options[PageLifecycle.ON_PAGE_SCROLL] = createLifecycle$1(options, PageLifecycle.ON_PAGE_SCROLL);
        /* istanbul ignore next -- @preserve */
        options.__listenPageScroll__ = () => true;
    }
    if (options[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined &&
        config.canShareToOthers) {
        options[PageLifecycle.ON_SHARE_APP_MESSAGE] = function (share) {
            const hook = this[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)];
            if (hook) {
                return hook(share);
            }
            return {};
        };
        /* istanbul ignore next -- @preserve */
        options.__isInjectedShareToOthersHook__ = () => true;
    }
    if (options[PageLifecycle.ON_SHARE_TIMELINE] === undefined &&
        config.canShareToTimeline) {
        options[PageLifecycle.ON_SHARE_TIMELINE] = function () {
            const hook = this[toHiddenField(PageLifecycle.ON_SHARE_TIMELINE)];
            if (hook) {
                return hook();
            }
            return {};
        };
        /* istanbul ignore next -- @preserve */
        options.__isInjectedShareToTimelineHook__ = () => true;
    }
    if (options[PageLifecycle.ON_ADD_TO_FAVORITES] === undefined) {
        options[PageLifecycle.ON_ADD_TO_FAVORITES] = function (favorites) {
            const hook = this[toHiddenField(PageLifecycle.ON_ADD_TO_FAVORITES)];
            if (hook) {
                return hook(favorites);
            }
            return {};
        };
        /* istanbul ignore next -- @preserve */
        options.__isInjectedFavoritesHook__ = () => true;
    }
    options[PageLifecycle.ON_SHOW] = createLifecycle$1(options, PageLifecycle.ON_SHOW);
    options[PageLifecycle.ON_READY] = createLifecycle$1(options, PageLifecycle.ON_READY);
    options[PageLifecycle.ON_HIDE] = createLifecycle$1(options, PageLifecycle.ON_HIDE);
    options[PageLifecycle.ON_PULL_DOWN_REFRESH] = createLifecycle$1(options, PageLifecycle.ON_PULL_DOWN_REFRESH);
    options[PageLifecycle.ON_REACH_BOTTOM] = createLifecycle$1(options, PageLifecycle.ON_REACH_BOTTOM);
    options[PageLifecycle.ON_RESIZE] = createLifecycle$1(options, PageLifecycle.ON_RESIZE);
    options[PageLifecycle.ON_TAB_ITEM_TAP] = createLifecycle$1(options, PageLifecycle.ON_TAB_ITEM_TAP);
    // eslint-disable-next-line new-cap
    Page(options);
}
function createLifecycle$1(options, lifecycle) {
    const originLifecycle = options[lifecycle];
    return function (...args) {
        const hooks = this[toHiddenField(lifecycle)];
        if (hooks) {
            hooks.forEach((hook) => hook(...args));
        }
        if (originLifecycle !== undefined) {
            originLifecycle.call(this, ...args);
        }
    };
}

var ComponentLifecycle;
(function (ComponentLifecycle) {
    ComponentLifecycle["ATTACHED"] = "attached";
    ComponentLifecycle["READY"] = "ready";
    ComponentLifecycle["MOVED"] = "moved";
    ComponentLifecycle["DETACHED"] = "detached";
    ComponentLifecycle["ERROR"] = "error";
})(ComponentLifecycle || (ComponentLifecycle = {}));
const SpecialLifecycleMap = {
    [PageLifecycle.ON_SHOW]: 'show',
    [PageLifecycle.ON_HIDE]: 'hide',
    [PageLifecycle.ON_RESIZE]: 'resize',
    [ComponentLifecycle.READY]: PageLifecycle.ON_READY,
};
function defineComponent(optionsOrSetup, config) {
    config = extend({
        listenPageScroll: false,
        canShareToOthers: false,
        canShareToTimeline: false,
    }, config);
    let setup;
    let options;
    let properties = null;
    if (isFunction(optionsOrSetup)) {
        setup = optionsOrSetup;
        options = {};
    }
    else {
        if (optionsOrSetup.setup === undefined) {
            // eslint-disable-next-line new-cap
            return Component(optionsOrSetup);
        }
        setup = optionsOrSetup.setup;
        options = exclude(optionsOrSetup, ['setup']);
        if (options.properties) {
            properties = Object.keys(options.properties);
        }
    }
    if (options.lifetimes === undefined) {
        options.lifetimes = {};
    }
    const originAttached = options.lifetimes[ComponentLifecycle.ATTACHED] ||
        options[ComponentLifecycle.ATTACHED];
    options.lifetimes[ComponentLifecycle.ATTACHED] = function () {
        this.__scope__ = new EffectScope();
        setCurrentComponent(this);
        const rawProps = {};
        if (properties) {
            properties.forEach((property) => {
                rawProps[property] = this.data[property];
            });
        }
        this.__props__ = shallowReactive(rawProps);
        const context = {
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
            getTabBar: this.getTabBar.bind(this),
            getPageId: this.getPageId.bind(this),
            animate: this.animate.bind(this),
            clearAnimation: this.clearAnimation.bind(this),
            getOpenerEventChannel: this.getOpenerEventChannel.bind(this),
            setUpdatePerformanceListener: this.setUpdatePerformanceListener.bind(this),
            getPassiveEvent: this.getPassiveEvent.bind(this),
            setPassiveEvent: this.setPassiveEvent.bind(this),
        };
        const bindings = setup((process.env.NODE_ENV !== 'production') ?
            shallowReadonly(this.__props__)
            : /* istanbul ignore next -- @preserve */ this.__props__, context);
        if (bindings !== undefined) {
            Object.keys(bindings).forEach((key) => {
                const value = bindings[key];
                if (isFunction(value)) {
                    this[key] = value;
                    return;
                }
                this.setData({ [key]: deepToRaw(value) });
                deepWatch.call(this, key, value);
            });
        }
        unsetCurrentComponent();
        if (originAttached !== undefined) {
            originAttached.call(this);
        }
    };
    const detached = createComponentLifecycle(options, ComponentLifecycle.DETACHED);
    options.lifetimes[ComponentLifecycle.DETACHED] = function () {
        detached.call(this);
        this.__scope__.stop();
    };
    const originReady = options.lifetimes[ComponentLifecycle.READY] ||
        options[ComponentLifecycle.READY];
    options.lifetimes[ComponentLifecycle.READY] = createLifecycle(SpecialLifecycleMap[ComponentLifecycle.READY], originReady);
    options.lifetimes[ComponentLifecycle.MOVED] = createComponentLifecycle(options, ComponentLifecycle.MOVED);
    options.lifetimes[ComponentLifecycle.ERROR] = createComponentLifecycle(options, ComponentLifecycle.ERROR);
    if (options.methods === undefined) {
        options.methods = {};
    }
    if (options.methods[PageLifecycle.ON_PAGE_SCROLL] ||
        config.listenPageScroll) {
        options.methods[PageLifecycle.ON_PAGE_SCROLL] = createPageLifecycle(options, PageLifecycle.ON_PAGE_SCROLL);
        /* istanbul ignore next -- @preserve */
        options.methods.__listenPageScroll__ = () => true;
    }
    if (options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] === undefined &&
        config.canShareToOthers) {
        options.methods[PageLifecycle.ON_SHARE_APP_MESSAGE] = function (share) {
            const hook = this[toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE)];
            if (hook) {
                return hook(share);
            }
            return {};
        };
        /* istanbul ignore next -- @preserve */
        options.methods.__isInjectedShareToOthersHook__ = () => true;
    }
    if (options.methods[PageLifecycle.ON_SHARE_TIMELINE] === undefined &&
        config.canShareToTimeline) {
        options.methods[PageLifecycle.ON_SHARE_TIMELINE] = function () {
            const hook = this[toHiddenField(PageLifecycle.ON_SHARE_TIMELINE)];
            if (hook) {
                return hook();
            }
            return {};
        };
        /* istanbul ignore next -- @preserve */
        options.methods.__isInjectedShareToTimelineHook__ = () => true;
    }
    if (options.methods[PageLifecycle.ON_ADD_TO_FAVORITES] === undefined) {
        options.methods[PageLifecycle.ON_ADD_TO_FAVORITES] = function (favorites) {
            const hook = this[toHiddenField(PageLifecycle.ON_ADD_TO_FAVORITES)];
            if (hook) {
                return hook(favorites);
            }
            return {};
        };
        /* istanbul ignore next -- @preserve */
        options.methods.__isInjectedFavoritesHook__ = () => true;
    }
    options.methods[PageLifecycle.ON_LOAD] = createPageLifecycle(options, PageLifecycle.ON_LOAD);
    options.methods[PageLifecycle.ON_PULL_DOWN_REFRESH] = createPageLifecycle(options, PageLifecycle.ON_PULL_DOWN_REFRESH);
    options.methods[PageLifecycle.ON_REACH_BOTTOM] = createPageLifecycle(options, PageLifecycle.ON_REACH_BOTTOM);
    options.methods[PageLifecycle.ON_TAB_ITEM_TAP] = createPageLifecycle(options, PageLifecycle.ON_TAB_ITEM_TAP);
    if (options.pageLifetimes === undefined) {
        options.pageLifetimes = {};
    }
    options.pageLifetimes[SpecialLifecycleMap[PageLifecycle.ON_SHOW]] =
        createSpecialPageLifecycle(options, PageLifecycle.ON_SHOW);
    options.pageLifetimes[SpecialLifecycleMap[PageLifecycle.ON_HIDE]] =
        createSpecialPageLifecycle(options, PageLifecycle.ON_HIDE);
    options.pageLifetimes[SpecialLifecycleMap[PageLifecycle.ON_RESIZE]] =
        createSpecialPageLifecycle(options, PageLifecycle.ON_RESIZE);
    if (properties) {
        if (options.observers === undefined) {
            options.observers = {};
        }
        properties.forEach((property) => {
            const originObserver = options.observers[property];
            options.observers[property] = function (value) {
                // Observer executes before attached
                if (this.__props__) {
                    this.__props__[property] = value;
                }
                if (originObserver !== undefined) {
                    originObserver.call(this, value);
                }
            };
        });
    }
    // eslint-disable-next-line new-cap
    return Component(options);
}
function createComponentLifecycle(options, lifecycle) {
    const originLifecycle = options.lifetimes[lifecycle] || options[lifecycle];
    return createLifecycle(lifecycle, originLifecycle);
}
function createPageLifecycle(options, lifecycle) {
    const originLifecycle = options.methods[lifecycle];
    return createLifecycle(lifecycle, originLifecycle);
}
function createSpecialPageLifecycle(options, lifecycle) {
    const originLifecycle = options.pageLifetimes[SpecialLifecycleMap[lifecycle]];
    return createLifecycle(lifecycle, originLifecycle);
}
function createLifecycle(lifecycle, originLifecycle) {
    const hiddenField = toHiddenField(lifecycle);
    return function (...args) {
        const hooks = this[hiddenField];
        if (hooks) {
            hooks.forEach((hook) => hook(...args));
        }
        if (originLifecycle !== undefined) {
            originLifecycle.call(this, ...args);
        }
    };
}

const pageHookWarn = 'Page specific lifecycle injection APIs can only be used during execution of setup() in definePage() or defineComponent().';
const onAppShow = createAppHook(AppLifecycle.ON_SHOW);
const onAppHide = createAppHook(AppLifecycle.ON_HIDE);
const onAppError = createAppHook(AppLifecycle.ON_ERROR);
const onPageNotFound = createAppHook(AppLifecycle.ON_PAGE_NOT_FOUND);
const onUnhandledRejection = createAppHook(AppLifecycle.ON_UNHANDLED_REJECTION);
const onThemeChange = createAppHook(AppLifecycle.ON_THEME_CHANGE);
const onShow = createPageHook(PageLifecycle.ON_SHOW);
const onHide = createPageHook(PageLifecycle.ON_HIDE);
const onUnload = createPageHook(PageLifecycle.ON_UNLOAD);
const onPullDownRefresh = createPageHook(PageLifecycle.ON_PULL_DOWN_REFRESH);
const onReachBottom = createPageHook(PageLifecycle.ON_REACH_BOTTOM);
const onResize = createPageHook(PageLifecycle.ON_RESIZE);
const onTabItemTap = createPageHook(PageLifecycle.ON_TAB_ITEM_TAP);
const onPageScroll = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else -- @preserve  */
    if (currentInstance) {
        /* istanbul ignore else -- @preserve   */
        if (currentInstance.__listenPageScroll__) {
            injectHook(currentInstance, PageLifecycle.ON_PAGE_SCROLL, hook);
        }
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('onPageScroll() hook only works when `listenPageScroll` is configured to true.');
        }
    }
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn(pageHookWarn);
    }
};
const onShareAppMessage = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else -- @preserve  */
    if (currentInstance) {
        /* istanbul ignore else -- @preserve  */
        if (currentInstance[PageLifecycle.ON_SHARE_APP_MESSAGE] &&
            currentInstance.__isInjectedShareToOthersHook__) {
            const hiddenField = toHiddenField(PageLifecycle.ON_SHARE_APP_MESSAGE);
            /* istanbul ignore else -- @preserve  */
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            }
            else if ((process.env.NODE_ENV !== 'production')) {
                console.warn('onShareAppMessage() hook can only be called once.');
            }
        }
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('onShareAppMessage() hook only works when `onShareAppMessage` option is not exist and `canShareToOthers` is configured to true.');
        }
    }
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn(pageHookWarn);
    }
};
const onShareTimeline = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else -- @preserve  */
    if (currentInstance) {
        /* istanbul ignore else -- @preserve  */
        if (currentInstance[PageLifecycle.ON_SHARE_TIMELINE] &&
            currentInstance.__isInjectedShareToTimelineHook__) {
            const hiddenField = toHiddenField(PageLifecycle.ON_SHARE_TIMELINE);
            /* istanbul ignore else -- @preserve  */
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            }
            else if ((process.env.NODE_ENV !== 'production')) {
                console.warn('onShareTimeline() hook can only be called once.');
            }
        }
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('onShareTimeline() hook only works when `onShareTimeline` option is not exist and `canShareToTimeline` is configured to true.');
        }
    }
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn(pageHookWarn);
    }
};
const onAddToFavorites = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else -- @preserve  */
    if (currentInstance) {
        /* istanbul ignore else -- @preserve  */
        if (currentInstance.__isInjectedFavoritesHook__) {
            const hiddenField = toHiddenField(PageLifecycle.ON_ADD_TO_FAVORITES);
            /* istanbul ignore else -- @preserve  */
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            }
            else if ((process.env.NODE_ENV !== 'production')) {
                console.warn('onAddToFavorites() hook can only be called once.');
            }
        }
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('onAddToFavorites() hook only works when `onAddToFavorites` option is not exist.');
        }
    }
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn(pageHookWarn);
    }
};
const onReady = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else -- @preserve  */
    if (currentInstance) {
        injectHook(currentInstance, PageLifecycle.ON_READY, hook);
    }
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn('onReady() hook can only be called during execution of setup() in definePage() or defineComponent().');
    }
};
const onLoad = createComponentHook(PageLifecycle.ON_LOAD);
const onMove = createComponentHook(ComponentLifecycle.MOVED);
const onDetach = createComponentHook(ComponentLifecycle.DETACHED);
const onError = createComponentHook(ComponentLifecycle.ERROR);
function createAppHook(lifecycle) {
    return (hook) => {
        /* istanbul ignore else -- @preserve  */
        if (currentApp) {
            injectHook(currentApp, lifecycle, hook);
        }
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('App specific lifecycle injection APIs can only be used during execution of setup() in createApp().');
        }
    };
}
function createPageHook(lifecycle) {
    return (hook) => {
        const currentInstance = getCurrentInstance();
        /* istanbul ignore else -- @preserve  */
        if (currentInstance) {
            injectHook(currentInstance, lifecycle, hook);
        }
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn(pageHookWarn);
        }
    };
}
function createComponentHook(lifecycle) {
    return (hook) => {
        /* istanbul ignore else -- @preserve  */
        if (currentComponent) {
            injectHook(currentComponent, lifecycle, hook);
        }
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('Component specific lifecycle injection APIs can only be used during execution of setup() in defineComponent().');
        }
    };
}
function injectHook(currentInstance, lifecycle, hook) {
    const hiddenField = toHiddenField(lifecycle);
    if (currentInstance[hiddenField] === undefined) {
        currentInstance[hiddenField] = [];
    }
    currentInstance[hiddenField].push(hook);
}

export { createApp, defineComponent, definePage, inject, nextTick, onAddToFavorites, onAppError, onAppHide, onAppShow, onDetach, onError, onHide, onLoad, onMove, onPageNotFound, onPageScroll, onPullDownRefresh, onReachBottom, onReady, onResize, onShareAppMessage, onShareTimeline, onShow, onTabItemTap, onThemeChange, onUnhandledRejection, onUnload, provide, watch, watchEffect, watchPostEffect, watchSyncEffect };
