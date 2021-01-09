/*!
 * vue-mini v0.2.1
 * https://github.com/vue-mini/vue-mini
 * (c) 2019-present Yang Mingshan
 * @license MIT
 */
import { computed as computed$1, stop, isRef, isReactive, effect, isProxy, toRaw, shallowReactive, shallowReadonly } from '@vue/reactivity';
export { customRef, isProxy, isReactive, isReadonly, isRef, markRaw, proxyRefs, reactive, readonly, ref, shallowReactive, shallowReadonly, shallowRef, toRaw, toRef, toRefs, triggerRef, unref } from '@vue/reactivity';

let currentApp = null;
let currentPage = null;
let currentComponent = null;
function getCurrentInstance() {
    return currentPage || currentComponent;
}
function setCurrentApp(page) {
    currentApp = page;
}
function setCurrentPage(page) {
    currentPage = page;
}
function setCurrentComponent(component) {
    currentComponent = component;
}

// Record effects created during a component's setup() so that they can be
// stopped when the component unmounts
function recordInstanceBoundEffect(effect) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        (currentInstance.__effects__ || (currentInstance.__effects__ = [])).push(effect);
    }
}
function computed(getterOrOptions) {
    const c = computed$1(getterOrOptions);
    recordInstanceBoundEffect(c.effect);
    return c;
}

let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const resolvedPromise = Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick(fn) {
    const p = currentFlushPromise || resolvedPromise;
    // eslint-disable-next-line promise/prefer-await-to-then
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
        // eslint-disable-next-line promise/prefer-await-to-then
        currentFlushPromise = resolvedPromise.then(flushJobs);
    }
}
function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;
    /* istanbul ignore else  */
    if ((process.env.NODE_ENV !== 'production')) {
        seen = seen || new Map();
    }
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            /* istanbul ignore else  */
            if ((process.env.NODE_ENV !== 'production')) {
                checkRecursiveUpdates(seen, job);
            }
            job();
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
    /* istanbul ignore if */
    if (count > RECURSION_LIMIT) {
        throw new Error(`Maximum recursive updates exceeded. ` +
            `This means you have a reactive effect that is mutating its own ` +
            `dependencies and thus recursively triggering itself.`);
    }
    else {
        seen.set(fn, count + 1);
    }
}

const { isArray } = Array;
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
    return x !== null && getType(x) === 'Object';
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

// Simple effect.
function watchEffect(effect, options) {
    return doWatch(effect, null, options);
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
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = {}) {
    if ((process.env.NODE_ENV !== 'production') && !cb) {
        if (immediate !== undefined) {
            console.warn(`watch() "immediate" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
        if (deep !== undefined) {
            console.warn(`watch() "deep" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
    }
    const warnInvalidSource = (s) => {
        console.warn(`Invalid watch source:`, s, `A watch source can only be a getter/effect function, a ref, ` +
            `a reactive object, or an array of these types.`);
    };
    let getter;
    let forceTrigger = false;
    if (isRef(source)) {
        getter = () => source.value;
        // @ts-expect-error
        forceTrigger = Boolean(source._shallow);
    }
    else if (isReactive(source)) {
        getter = () => source;
        deep = true;
    }
    else if (isArray(source)) {
        getter = () => source.map((s) => {
            if (isRef(s)) {
                return s.value;
            }
            if (isReactive(s)) {
                return traverse(s);
            }
            if (isFunction(s)) {
                return s();
            }
            /* istanbul ignore else  */
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
                return source(onInvalidate);
            };
        }
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        getter = () => { };
        /* istanbul ignore else  */
        if ((process.env.NODE_ENV !== 'production')) {
            warnInvalidSource(source);
        }
    }
    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }
    let cleanup;
    const onInvalidate = (fn) => {
        // eslint-disable-next-line no-multi-assign
        cleanup = runner.options.onStop = () => {
            fn();
        };
    };
    let oldValue = isArray(source) ? [] : INITIAL_WATCHER_VALUE;
    const job = () => {
        if (!runner.active) {
            return;
        }
        if (cb) {
            // Watch(source, cb)
            const newValue = runner();
            if (deep || forceTrigger || hasChanged(newValue, oldValue)) {
                // Cleanup before running cb again
                if (cleanup) {
                    cleanup();
                }
                cb(newValue, 
                // Pass undefined as the old value when it's changed for the first time
                oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue, onInvalidate);
                oldValue = newValue;
            }
        }
        else {
            // WatchEffect
            runner();
        }
    };
    // Important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger
    job.allowRecurse = Boolean(cb);
    let scheduler;
    if (flush === 'sync') {
        scheduler = job;
    }
    else {
        scheduler = () => {
            queueJob(job);
        };
    }
    const runner = effect(getter, {
        lazy: true,
        onTrack,
        onTrigger,
        scheduler,
    });
    recordInstanceBoundEffect(runner);
    // Initial run
    if (cb) {
        if (immediate) {
            job();
        }
        else {
            oldValue = runner();
        }
    }
    else {
        runner();
    }
    const instance = getCurrentInstance();
    return () => {
        stop(runner);
        if (instance) {
            remove(instance.__effects__, runner);
        }
    };
}
function traverse(value, seen = new Set()) {
    if (!isObject(value) || seen.has(value)) {
        return value;
    }
    seen.add(value);
    if (isRef(value)) {
        traverse(value.value, seen);
    }
    else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    }
    else if (isSet(value) || isMap(value)) {
        value.forEach((v) => {
            traverse(v, seen);
        });
    }
    else {
        // eslint-disable-next-line guard-for-in
        for (const key in value) {
            traverse(value[key], seen);
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
        return treatDefaultAsFactory && isFunction(defaultValue)
            ? defaultValue()
            : defaultValue;
    }
    /* istanbul ignore else */
    if ((process.env.NODE_ENV !== 'production')) {
        console.warn(`injection "${String(key)}" not found.`);
    }
}

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
        const { setup: setupOption, ...restOptions } = optionsOrSetup;
        setup = setupOption;
        options = restOptions;
    }
    const originOnLaunch = options["onLaunch" /* ON_LAUNCH */];
    options["onLaunch" /* ON_LAUNCH */] = function (options) {
        setCurrentApp(this);
        const bindings = setup(options);
        if (bindings !== undefined) {
            Object.keys(bindings).forEach((key) => {
                this[key] = bindings[key];
            });
        }
        setCurrentApp(null);
        if (originOnLaunch !== undefined) {
            originOnLaunch.call(this, options);
        }
    };
    options["onShow" /* ON_SHOW */] = createLifecycle(options, "onShow" /* ON_SHOW */);
    options["onHide" /* ON_HIDE */] = createLifecycle(options, "onHide" /* ON_HIDE */);
    options["onError" /* ON_ERROR */] = createLifecycle(options, "onError" /* ON_ERROR */);
    options["onPageNotFound" /* ON_PAGE_NOT_FOUND */] = createLifecycle(options, "onPageNotFound" /* ON_PAGE_NOT_FOUND */);
    options["onUnhandledRejection" /* ON_UNHANDLED_REJECTION */] = createLifecycle(options, "onUnhandledRejection" /* ON_UNHANDLED_REJECTION */);
    options["onThemeChange" /* ON_THEME_CHANGE */] = createLifecycle(options, "onThemeChange" /* ON_THEME_CHANGE */);
    // eslint-disable-next-line new-cap
    App(options);
}
function createLifecycle(options, lifecycle) {
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
        this.setData({ [key]: deepToRaw(value) });
    }, {
        deep: true,
    });
}

function definePage(optionsOrSetup, config) {
    config = {
        listenPageScroll: false,
        canShareToOthers: false,
        canShareToTimeline: false,
        ...config,
    };
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
        const { setup: setupOption, ...restOptions } = optionsOrSetup;
        setup = setupOption;
        options = restOptions;
    }
    const originOnLoad = options["onLoad" /* ON_LOAD */];
    options["onLoad" /* ON_LOAD */] = function (query) {
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
        setCurrentPage(null);
        if (originOnLoad !== undefined) {
            originOnLoad.call(this, query);
        }
    };
    const onUnload = createLifecycle$1(options, "onUnload" /* ON_UNLOAD */);
    options["onUnload" /* ON_UNLOAD */] = function () {
        onUnload.call(this);
        if (this.__effects__) {
            this.__effects__.forEach((effect) => {
                stop(effect);
            });
        }
    };
    if (options["onPageScroll" /* ON_PAGE_SCROLL */] || config.listenPageScroll) {
        options["onPageScroll" /* ON_PAGE_SCROLL */] = createLifecycle$1(options, "onPageScroll" /* ON_PAGE_SCROLL */);
        /* istanbul ignore next */
        options.__listenPageScroll__ = () => true;
    }
    if (options["onShareAppMessage" /* ON_SHARE_APP_MESSAGE */] === undefined &&
        config.canShareToOthers) {
        options["onShareAppMessage" /* ON_SHARE_APP_MESSAGE */] = function (share) {
            const hook = this[toHiddenField("onShareAppMessage" /* ON_SHARE_APP_MESSAGE */)];
            if (hook) {
                return hook(share);
            }
            return {};
        };
        /* istanbul ignore next */
        options.__isInjectedShareToOthersHook__ = () => true;
    }
    if (options["onShareTimeline" /* ON_SHARE_TIMELINE */] === undefined &&
        config.canShareToTimeline) {
        options["onShareTimeline" /* ON_SHARE_TIMELINE */] = function () {
            const hook = this[toHiddenField("onShareTimeline" /* ON_SHARE_TIMELINE */)];
            if (hook) {
                return hook();
            }
            return {};
        };
        /* istanbul ignore next */
        options.__isInjectedShareToTimelineHook__ = () => true;
    }
    if (options["onAddToFavorites" /* ON_ADD_TO_FAVORITES */] === undefined) {
        options["onAddToFavorites" /* ON_ADD_TO_FAVORITES */] = function (favorites) {
            const hook = this[toHiddenField("onAddToFavorites" /* ON_ADD_TO_FAVORITES */)];
            if (hook) {
                return hook(favorites);
            }
            return {};
        };
        /* istanbul ignore next */
        options.__isInjectedFavoritesHook__ = () => true;
    }
    options["onShow" /* ON_SHOW */] = createLifecycle$1(options, "onShow" /* ON_SHOW */);
    options["onReady" /* ON_READY */] = createLifecycle$1(options, "onReady" /* ON_READY */);
    options["onHide" /* ON_HIDE */] = createLifecycle$1(options, "onHide" /* ON_HIDE */);
    options["onPullDownRefresh" /* ON_PULL_DOWN_REFRESH */] = createLifecycle$1(options, "onPullDownRefresh" /* ON_PULL_DOWN_REFRESH */);
    options["onReachBottom" /* ON_REACH_BOTTOM */] = createLifecycle$1(options, "onReachBottom" /* ON_REACH_BOTTOM */);
    options["onResize" /* ON_RESIZE */] = createLifecycle$1(options, "onResize" /* ON_RESIZE */);
    options["onTabItemTap" /* ON_TAB_ITEM_TAP */] = createLifecycle$1(options, "onTabItemTap" /* ON_TAB_ITEM_TAP */);
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

const SpecialLifecycleMap = {
    ["onShow" /* ON_SHOW */]: 'show',
    ["onHide" /* ON_HIDE */]: 'hide',
    ["onResize" /* ON_RESIZE */]: 'resize',
    ["ready" /* READY */]: "onReady" /* ON_READY */,
};
function defineComponent(optionsOrSetup, config) {
    config = {
        listenPageScroll: false,
        canShareToOthers: false,
        canShareToTimeline: false,
        ...config,
    };
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
        const { setup: setupOption, ...restOptions } = optionsOrSetup;
        setup = setupOption;
        options = restOptions;
        if (options.properties) {
            properties = Object.keys(options.properties);
        }
    }
    if (options.lifetimes === undefined) {
        options.lifetimes = {};
    }
    const originAttached = options.lifetimes["attached" /* ATTACHED */] ||
        options["attached" /* ATTACHED */];
    options.lifetimes["attached" /* ATTACHED */] = function () {
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
        };
        const bindings = setup((process.env.NODE_ENV !== 'production')
            ? shallowReadonly(this.__props__)
            : /* istanbul ignore next */ this.__props__, context);
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
        setCurrentComponent(null);
        if (originAttached !== undefined) {
            originAttached.call(this);
        }
    };
    const detached = createComponentLifecycle(options, "detached" /* DETACHED */);
    options.lifetimes["detached" /* DETACHED */] = function () {
        detached.call(this);
        if (this.__effects__) {
            this.__effects__.forEach((effect) => {
                stop(effect);
            });
        }
    };
    const originReady = options.lifetimes["ready" /* READY */] ||
        options["ready" /* READY */];
    options.lifetimes["ready" /* READY */] = createLifecycle$2(SpecialLifecycleMap["ready" /* READY */], originReady);
    options.lifetimes["moved" /* MOVED */] = createComponentLifecycle(options, "moved" /* MOVED */);
    options.lifetimes["error" /* ERROR */] = createComponentLifecycle(options, "error" /* ERROR */);
    if (options.methods === undefined) {
        options.methods = {};
    }
    if (options.methods["onPageScroll" /* ON_PAGE_SCROLL */] ||
        config.listenPageScroll) {
        options.methods["onPageScroll" /* ON_PAGE_SCROLL */] = createPageLifecycle(options, "onPageScroll" /* ON_PAGE_SCROLL */);
        /* istanbul ignore next */
        options.methods.__listenPageScroll__ = () => true;
    }
    if (options.methods["onShareAppMessage" /* ON_SHARE_APP_MESSAGE */] === undefined &&
        config.canShareToOthers) {
        options.methods["onShareAppMessage" /* ON_SHARE_APP_MESSAGE */] = function (share) {
            const hook = this[toHiddenField("onShareAppMessage" /* ON_SHARE_APP_MESSAGE */)];
            if (hook) {
                return hook(share);
            }
            return {};
        };
        /* istanbul ignore next */
        options.methods.__isInjectedShareToOthersHook__ = () => true;
    }
    if (options.methods["onShareTimeline" /* ON_SHARE_TIMELINE */] === undefined &&
        config.canShareToTimeline) {
        options.methods["onShareTimeline" /* ON_SHARE_TIMELINE */] = function () {
            const hook = this[toHiddenField("onShareTimeline" /* ON_SHARE_TIMELINE */)];
            if (hook) {
                return hook();
            }
            return {};
        };
        /* istanbul ignore next */
        options.methods.__isInjectedShareToTimelineHook__ = () => true;
    }
    if (options.methods["onAddToFavorites" /* ON_ADD_TO_FAVORITES */] === undefined) {
        options.methods["onAddToFavorites" /* ON_ADD_TO_FAVORITES */] = function (favorites) {
            const hook = this[toHiddenField("onAddToFavorites" /* ON_ADD_TO_FAVORITES */)];
            if (hook) {
                return hook(favorites);
            }
            return {};
        };
        /* istanbul ignore next */
        options.methods.__isInjectedFavoritesHook__ = () => true;
    }
    options.methods["onLoad" /* ON_LOAD */] = createPageLifecycle(options, "onLoad" /* ON_LOAD */);
    options.methods["onPullDownRefresh" /* ON_PULL_DOWN_REFRESH */] = createPageLifecycle(options, "onPullDownRefresh" /* ON_PULL_DOWN_REFRESH */);
    options.methods["onReachBottom" /* ON_REACH_BOTTOM */] = createPageLifecycle(options, "onReachBottom" /* ON_REACH_BOTTOM */);
    options.methods["onTabItemTap" /* ON_TAB_ITEM_TAP */] = createPageLifecycle(options, "onTabItemTap" /* ON_TAB_ITEM_TAP */);
    if (options.pageLifetimes === undefined) {
        options.pageLifetimes = {};
    }
    options.pageLifetimes[SpecialLifecycleMap["onShow" /* ON_SHOW */]] = createSpecialPageLifecycle(options, "onShow" /* ON_SHOW */);
    options.pageLifetimes[SpecialLifecycleMap["onHide" /* ON_HIDE */]] = createSpecialPageLifecycle(options, "onHide" /* ON_HIDE */);
    options.pageLifetimes[SpecialLifecycleMap["onResize" /* ON_RESIZE */]] = createSpecialPageLifecycle(options, "onResize" /* ON_RESIZE */);
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
    return createLifecycle$2(lifecycle, originLifecycle);
}
function createPageLifecycle(options, lifecycle) {
    const originLifecycle = options.methods[lifecycle];
    return createLifecycle$2(lifecycle, originLifecycle);
}
function createSpecialPageLifecycle(options, lifecycle) {
    const originLifecycle = options.pageLifetimes[SpecialLifecycleMap[lifecycle]];
    return createLifecycle$2(lifecycle, originLifecycle);
}
function createLifecycle$2(lifecycle, originLifecycle) {
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
const onAppShow = createAppHook("onShow" /* ON_SHOW */);
const onAppHide = createAppHook("onHide" /* ON_HIDE */);
const onAppError = createAppHook("onError" /* ON_ERROR */);
const onPageNotFound = createAppHook("onPageNotFound" /* ON_PAGE_NOT_FOUND */);
const onUnhandledRejection = createAppHook("onUnhandledRejection" /* ON_UNHANDLED_REJECTION */);
const onThemeChange = createAppHook("onThemeChange" /* ON_THEME_CHANGE */);
const onShow = createPageHook("onShow" /* ON_SHOW */);
const onHide = createPageHook("onHide" /* ON_HIDE */);
const onUnload = createPageHook("onUnload" /* ON_UNLOAD */);
const onPullDownRefresh = createPageHook("onPullDownRefresh" /* ON_PULL_DOWN_REFRESH */);
const onReachBottom = createPageHook("onReachBottom" /* ON_REACH_BOTTOM */);
const onResize = createPageHook("onResize" /* ON_RESIZE */);
const onTabItemTap = createPageHook("onTabItemTap" /* ON_TAB_ITEM_TAP */);
const onPageScroll = (hook) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        if (currentInstance.__listenPageScroll__) {
            injectHook(currentInstance, "onPageScroll" /* ON_PAGE_SCROLL */, hook);
        } /* istanbul ignore else  */
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('onPageScroll() hook only works when `listenPageScroll` is configured to true.');
        }
    } /* istanbul ignore else  */
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn(pageHookWarn);
    }
};
const onShareAppMessage = (hook) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        if (currentInstance["onShareAppMessage" /* ON_SHARE_APP_MESSAGE */] &&
            currentInstance.__isInjectedShareToOthersHook__) {
            const hiddenField = toHiddenField("onShareAppMessage" /* ON_SHARE_APP_MESSAGE */);
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            } /* istanbul ignore else  */
            else if ((process.env.NODE_ENV !== 'production')) {
                console.warn('onShareAppMessage() hook can only be called once.');
            }
        } /* istanbul ignore else  */
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('onShareAppMessage() hook only works when `onShareAppMessage` option is not exist and `canShareToOthers` is configured to true.');
        }
    } /* istanbul ignore else  */
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn(pageHookWarn);
    }
};
const onShareTimeline = (hook) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        if (currentInstance["onShareTimeline" /* ON_SHARE_TIMELINE */] &&
            currentInstance.__isInjectedShareToTimelineHook__) {
            const hiddenField = toHiddenField("onShareTimeline" /* ON_SHARE_TIMELINE */);
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            } /* istanbul ignore else  */
            else if ((process.env.NODE_ENV !== 'production')) {
                console.warn('onShareTimeline() hook can only be called once.');
            }
        } /* istanbul ignore else  */
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('onShareTimeline() hook only works when `onShareTimeline` option is not exist and `canShareToTimeline` is configured to true.');
        }
    } /* istanbul ignore else  */
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn(pageHookWarn);
    }
};
const onAddToFavorites = (hook) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        if (currentInstance.__isInjectedFavoritesHook__) {
            const hiddenField = toHiddenField("onAddToFavorites" /* ON_ADD_TO_FAVORITES */);
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            } /* istanbul ignore else  */
            else if ((process.env.NODE_ENV !== 'production')) {
                console.warn('onAddToFavorites() hook can only be called once.');
            }
        } /* istanbul ignore else  */
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('onAddToFavorites() hook only works when `onAddToFavorites` option is not exist.');
        }
    } /* istanbul ignore else  */
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn(pageHookWarn);
    }
};
const onReady = (hook) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        injectHook(currentInstance, "onReady" /* ON_READY */, hook);
    } /* istanbul ignore else  */
    else if ((process.env.NODE_ENV !== 'production')) {
        console.warn('onReady() hook can only be called during execution of setup() in definePage() or defineComponent().');
    }
};
const onLoad = createComponentHook("onLoad" /* ON_LOAD */);
const onMove = createComponentHook("moved" /* MOVED */);
const onDetach = createComponentHook("detached" /* DETACHED */);
const onError = createComponentHook("error" /* ERROR */);
function createAppHook(lifecycle) {
    return (hook) => {
        if (currentApp) {
            injectHook(currentApp, lifecycle, hook);
        } /* istanbul ignore else  */
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn('App specific lifecycle injection APIs can only be used during execution of setup() in createApp().');
        }
    };
}
function createPageHook(lifecycle) {
    return (hook) => {
        const currentInstance = getCurrentInstance();
        if (currentInstance) {
            injectHook(currentInstance, lifecycle, hook);
        } /* istanbul ignore else  */
        else if ((process.env.NODE_ENV !== 'production')) {
            console.warn(pageHookWarn);
        }
    };
}
function createComponentHook(lifecycle) {
    return (hook) => {
        if (currentComponent) {
            injectHook(currentComponent, lifecycle, hook);
        } /* istanbul ignore else  */
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

export { computed, createApp, defineComponent, definePage, inject, nextTick, onAddToFavorites, onAppError, onAppHide, onAppShow, onDetach, onError, onHide, onLoad, onMove, onPageNotFound, onPageScroll, onPullDownRefresh, onReachBottom, onReady, onResize, onShareAppMessage, onShareTimeline, onShow, onTabItemTap, onThemeChange, onUnhandledRejection, onUnload, provide, watch, watchEffect };
