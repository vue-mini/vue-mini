/*!
 * vue-mini v0.3.0
 * https://github.com/vue-mini/vue-mini
 * (c) 2019-present Yang Mingshan
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
function makeMap(str, expectsLowerCase) {
    const map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
}
Object.freeze({})
    ;
Object.freeze([]) ;
const extend = Object.assign;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isArray$1 = Array.isArray;
const isMap$1 = (val) => toTypeString(val) === '[object Map]';
const isFunction$1 = (val) => typeof val === 'function';
const isString = (val) => typeof val === 'string';
const isSymbol = (val) => typeof val === 'symbol';
const isObject$1 = (val) => val !== null && typeof val === 'object';
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1);
};
const isIntegerKey = (key) => isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;
const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
/**
 * @private
 */
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
// compare whether a value has changed, accounting for NaN.
const hasChanged$1 = (value, oldValue) => !Object.is(value, oldValue);
const def = (obj, key, value) => {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: false,
        value
    });
};

function warn(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
}

let activeEffectScope;
const effectScopeStack = [];
class EffectScope {
    constructor(detached = false) {
        this.active = true;
        this.effects = [];
        this.cleanups = [];
        if (!detached && activeEffectScope) {
            this.parent = activeEffectScope;
            this.index =
                (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
        }
    }
    run(fn) {
        if (this.active) {
            try {
                this.on();
                return fn();
            }
            finally {
                this.off();
            }
        }
        else {
            warn(`cannot run an inactive effect scope.`);
        }
    }
    on() {
        if (this.active) {
            effectScopeStack.push(this);
            activeEffectScope = this;
        }
    }
    off() {
        if (this.active) {
            effectScopeStack.pop();
            activeEffectScope = effectScopeStack[effectScopeStack.length - 1];
        }
    }
    stop(fromParent) {
        if (this.active) {
            this.effects.forEach(e => e.stop());
            this.cleanups.forEach(cleanup => cleanup());
            if (this.scopes) {
                this.scopes.forEach(e => e.stop(true));
            }
            // nested scope, dereference from parent to avoid memory leaks
            if (this.parent && !fromParent) {
                // optimized O(1) removal
                const last = this.parent.scopes.pop();
                if (last && last !== this) {
                    this.parent.scopes[this.index] = last;
                    last.index = this.index;
                }
            }
            this.active = false;
        }
    }
}
function effectScope(detached) {
    return new EffectScope(detached);
}
function recordEffectScope(effect, scope) {
    scope = scope || activeEffectScope;
    if (scope && scope.active) {
        scope.effects.push(effect);
    }
}
function getCurrentScope() {
    return activeEffectScope;
}
function onScopeDispose(fn) {
    if (activeEffectScope) {
        activeEffectScope.cleanups.push(fn);
    }
    else {
        warn(`onScopeDispose() is called when there is no active effect scope` +
            ` to be associated with.`);
    }
}

const createDep = (effects) => {
    const dep = new Set(effects);
    dep.w = 0;
    dep.n = 0;
    return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].w |= trackOpBit; // set was tracked
        }
    }
};
const finalizeDepMarkers = (effect) => {
    const { deps } = effect;
    if (deps.length) {
        let ptr = 0;
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i];
            if (wasTracked(dep) && !newTracked(dep)) {
                dep.delete(effect);
            }
            else {
                deps[ptr++] = dep;
            }
            // clear bits
            dep.w &= ~trackOpBit;
            dep.n &= ~trackOpBit;
        }
        deps.length = ptr;
    }
};

const targetMap = new WeakMap();
// The number of effects currently being tracked recursively.
let effectTrackDepth = 0;
let trackOpBit = 1;
/**
 * The bitwise track markers support at most 30 levels op recursion.
 * This value is chosen to enable modern JS engines to use a SMI on all platforms.
 * When recursion depth is greater, fall back to using a full cleanup.
 */
const maxMarkerBits = 30;
const effectStack = [];
let activeEffect;
const ITERATE_KEY = Symbol('iterate' );
const MAP_KEY_ITERATE_KEY = Symbol('Map key iterate' );
class ReactiveEffect {
    constructor(fn, scheduler = null, scope) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        recordEffectScope(this, scope);
    }
    run() {
        if (!this.active) {
            return this.fn();
        }
        if (!effectStack.includes(this)) {
            try {
                effectStack.push((activeEffect = this));
                enableTracking();
                trackOpBit = 1 << ++effectTrackDepth;
                if (effectTrackDepth <= maxMarkerBits) {
                    initDepMarkers(this);
                }
                else {
                    cleanupEffect(this);
                }
                return this.fn();
            }
            finally {
                if (effectTrackDepth <= maxMarkerBits) {
                    finalizeDepMarkers(this);
                }
                trackOpBit = 1 << --effectTrackDepth;
                resetTracking();
                effectStack.pop();
                const n = effectStack.length;
                activeEffect = n > 0 ? effectStack[n - 1] : undefined;
            }
        }
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    const { deps } = effect;
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect);
        }
        deps.length = 0;
    }
}
function effect(fn, options) {
    if (fn.effect) {
        fn = fn.effect.fn;
    }
    const _effect = new ReactiveEffect(fn);
    if (options) {
        extend(_effect, options);
        if (options.scope)
            recordEffectScope(_effect, options.scope);
    }
    if (!options || !options.lazy) {
        _effect.run();
    }
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
}
function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
}
function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === undefined ? true : last;
}
function track(target, type, key) {
    if (!isTracking()) {
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }
    const eventInfo = { effect: activeEffect, target, type, key }
        ;
    trackEffects(dep, eventInfo);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trackEffects(dep, debuggerEventExtraInfo) {
    let shouldTrack = false;
    if (effectTrackDepth <= maxMarkerBits) {
        if (!newTracked(dep)) {
            dep.n |= trackOpBit; // set newly tracked
            shouldTrack = !wasTracked(dep);
        }
    }
    else {
        // Full cleanup mode.
        shouldTrack = !dep.has(activeEffect);
    }
    if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
        if (activeEffect.onTrack) {
            activeEffect.onTrack(Object.assign({
                effect: activeEffect
            }, debuggerEventExtraInfo));
        }
    }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }
    let deps = [];
    if (type === "clear" /* CLEAR */) {
        // collection being cleared
        // trigger all effects for target
        deps = [...depsMap.values()];
    }
    else if (key === 'length' && isArray$1(target)) {
        depsMap.forEach((dep, key) => {
            if (key === 'length' || key >= newValue) {
                deps.push(dep);
            }
        });
    }
    else {
        // schedule runs for SET | ADD | DELETE
        if (key !== void 0) {
            deps.push(depsMap.get(key));
        }
        // also run for iteration key on ADD | DELETE | Map.SET
        switch (type) {
            case "add" /* ADD */:
                if (!isArray$1(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if (isMap$1(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                else if (isIntegerKey(key)) {
                    // new index added to array -> length changes
                    deps.push(depsMap.get('length'));
                }
                break;
            case "delete" /* DELETE */:
                if (!isArray$1(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if (isMap$1(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                break;
            case "set" /* SET */:
                if (isMap$1(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                }
                break;
        }
    }
    const eventInfo = { target, type, key, newValue, oldValue, oldTarget }
        ;
    if (deps.length === 1) {
        if (deps[0]) {
            {
                triggerEffects(deps[0], eventInfo);
            }
        }
    }
    else {
        const effects = [];
        for (const dep of deps) {
            if (dep) {
                effects.push(...dep);
            }
        }
        {
            triggerEffects(createDep(effects), eventInfo);
        }
    }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
    // spread into array for stabilization
    for (const effect of isArray$1(dep) ? dep : [...dep]) {
        if (effect !== activeEffect || effect.allowRecurse) {
            if (effect.onTrigger) {
                effect.onTrigger(extend({ effect }, debuggerEventExtraInfo));
            }
            if (effect.scheduler) {
                effect.scheduler();
            }
            else {
                effect.run();
            }
        }
    }
}

const isNonTrackableKeys = /*#__PURE__*/ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol)
    .map(key => Symbol[key])
    .filter(isSymbol));
const get = /*#__PURE__*/ createGetter();
const shallowGet = /*#__PURE__*/ createGetter(false, true);
const readonlyGet = /*#__PURE__*/ createGetter(true);
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true);
const arrayInstrumentations = /*#__PURE__*/ createArrayInstrumentations();
function createArrayInstrumentations() {
    const instrumentations = {};
    ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
        instrumentations[key] = function (...args) {
            const arr = toRaw(this);
            for (let i = 0, l = this.length; i < l; i++) {
                track(arr, "get" /* GET */, i + '');
            }
            // we run the method using the original args first (which may be reactive)
            const res = arr[key](...args);
            if (res === -1 || res === false) {
                // if that didn't work, run it again using raw values.
                return arr[key](...args.map(toRaw));
            }
            else {
                return res;
            }
        };
    });
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
        instrumentations[key] = function (...args) {
            pauseTracking();
            const res = toRaw(this)[key].apply(this, args);
            resetTracking();
            return res;
        };
    });
    return instrumentations;
}
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_raw" /* RAW */ &&
            receiver ===
                (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap).get(target)) {
            return target;
        }
        const targetIsArray = isArray$1(target);
        if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
            return Reflect.get(arrayInstrumentations, key, receiver);
        }
        const res = Reflect.get(target, key, receiver);
        if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res;
        }
        if (!isReadonly) {
            track(target, "get" /* GET */, key);
        }
        if (shallow) {
            return res;
        }
        if (isRef(res)) {
            // ref unwrapping - does not apply for Array + integer key.
            const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
            return shouldUnwrap ? res.value : res;
        }
        if (isObject$1(res)) {
            // Convert returned value into a proxy as well. we do the isObject check
            // here to avoid invalid value warning. Also need to lazy access readonly
            // and reactive here to avoid circular dependency.
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
const set = /*#__PURE__*/ createSetter();
const shallowSet = /*#__PURE__*/ createSetter(true);
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        let oldValue = target[key];
        if (!shallow) {
            value = toRaw(value);
            oldValue = toRaw(oldValue);
            if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
                oldValue.value = value;
                return true;
            }
        }
        const hadKey = isArray$1(target) && isIntegerKey(key)
            ? Number(key) < target.length
            : hasOwn(target, key);
        const result = Reflect.set(target, key, value, receiver);
        // don't trigger if target is something up in the prototype chain of original
        if (target === toRaw(receiver)) {
            if (!hadKey) {
                trigger(target, "add" /* ADD */, key, value);
            }
            else if (hasChanged$1(value, oldValue)) {
                trigger(target, "set" /* SET */, key, value, oldValue);
            }
        }
        return result;
    };
}
function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
        trigger(target, "delete" /* DELETE */, key, undefined, oldValue);
    }
    return result;
}
function has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
        track(target, "has" /* HAS */, key);
    }
    return result;
}
function ownKeys(target) {
    track(target, "iterate" /* ITERATE */, isArray$1(target) ? 'length' : ITERATE_KEY);
    return Reflect.ownKeys(target);
}
const mutableHandlers = {
    get,
    set,
    deleteProperty,
    has,
    ownKeys
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        {
            console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        }
        return true;
    },
    deleteProperty(target, key) {
        {
            console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
        }
        return true;
    }
};
const shallowReactiveHandlers = /*#__PURE__*/ extend({}, mutableHandlers, {
    get: shallowGet,
    set: shallowSet
});
// Props handlers are special in the sense that it should not unwrap top-level
// refs (in order to allow refs to be explicitly passed down), but should
// retain the reactivity of the normal readonly object.
const shallowReadonlyHandlers = /*#__PURE__*/ extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get$1(target, key, isReadonly = false, isShallow = false) {
    // #1772: readonly(reactive(Map)) should return readonly + reactive version
    // of the value
    target = target["__v_raw" /* RAW */];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
        !isReadonly && track(rawTarget, "get" /* GET */, key);
    }
    !isReadonly && track(rawTarget, "get" /* GET */, rawKey);
    const { has } = getProto(rawTarget);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
    }
    else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
    }
    else if (target !== rawTarget) {
        // #3602 readonly(reactive(Map))
        // ensure that the nested reactive `Map` can do tracking for itself
        target.get(key);
    }
}
function has$1(key, isReadonly = false) {
    const target = this["__v_raw" /* RAW */];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
        !isReadonly && track(rawTarget, "has" /* HAS */, key);
    }
    !isReadonly && track(rawTarget, "has" /* HAS */, rawKey);
    return key === rawKey
        ? target.has(key)
        : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly = false) {
    target = target["__v_raw" /* RAW */];
    !isReadonly && track(toRaw(target), "iterate" /* ITERATE */, ITERATE_KEY);
    return Reflect.get(target, 'size', target);
}
function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
        target.add(value);
        trigger(target, "add" /* ADD */, value, value);
    }
    return this;
}
function set$1(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has, get } = getProto(target);
    let hadKey = has.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
    }
    else {
        checkIdentityKeys(target, has, key);
    }
    const oldValue = get.call(target, key);
    target.set(key, value);
    if (!hadKey) {
        trigger(target, "add" /* ADD */, key, value);
    }
    else if (hasChanged$1(value, oldValue)) {
        trigger(target, "set" /* SET */, key, value, oldValue);
    }
    return this;
}
function deleteEntry(key) {
    const target = toRaw(this);
    const { has, get } = getProto(target);
    let hadKey = has.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
    }
    else {
        checkIdentityKeys(target, has, key);
    }
    const oldValue = get ? get.call(target, key) : undefined;
    // forward the operation before queueing reactions
    const result = target.delete(key);
    if (hadKey) {
        trigger(target, "delete" /* DELETE */, key, undefined, oldValue);
    }
    return result;
}
function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = isMap$1(target)
            ? new Map(target)
            : new Set(target)
        ;
    // forward the operation before queueing reactions
    const result = target.clear();
    if (hadItems) {
        trigger(target, "clear" /* CLEAR */, undefined, undefined, oldTarget);
    }
    return result;
}
function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
        const observed = this;
        const target = observed["__v_raw" /* RAW */];
        const rawTarget = toRaw(target);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly && track(rawTarget, "iterate" /* ITERATE */, ITERATE_KEY);
        return target.forEach((value, key) => {
            // important: make sure the callback is
            // 1. invoked with the reactive map as `this` and 3rd arg
            // 2. the value received should be a corresponding reactive/readonly.
            return callback.call(thisArg, wrap(value), wrap(key), observed);
        });
    };
}
function createIterableMethod(method, isReadonly, isShallow) {
    return function (...args) {
        const target = this["__v_raw" /* RAW */];
        const rawTarget = toRaw(target);
        const targetIsMap = isMap$1(rawTarget);
        const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
        const isKeyOnly = method === 'keys' && targetIsMap;
        const innerIterator = target[method](...args);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly &&
            track(rawTarget, "iterate" /* ITERATE */, isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
        // return a wrapped iterator which returns observed versions of the
        // values emitted from the real iterator
        return {
            // iterator protocol
            next() {
                const { value, done } = innerIterator.next();
                return done
                    ? { value, done }
                    : {
                        value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                        done
                    };
            },
            // iterable protocol
            [Symbol.iterator]() {
                return this;
            }
        };
    };
}
function createReadonlyMethod(type) {
    return function (...args) {
        {
            const key = args[0] ? `on key "${args[0]}" ` : ``;
            console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
        }
        return type === "delete" /* DELETE */ ? false : this;
    };
}
function createInstrumentations() {
    const mutableInstrumentations = {
        get(key) {
            return get$1(this, key);
        },
        get size() {
            return size(this);
        },
        has: has$1,
        add,
        set: set$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, false)
    };
    const shallowInstrumentations = {
        get(key) {
            return get$1(this, key, false, true);
        },
        get size() {
            return size(this);
        },
        has: has$1,
        add,
        set: set$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, true)
    };
    const readonlyInstrumentations = {
        get(key) {
            return get$1(this, key, true);
        },
        get size() {
            return size(this, true);
        },
        has(key) {
            return has$1.call(this, key, true);
        },
        add: createReadonlyMethod("add" /* ADD */),
        set: createReadonlyMethod("set" /* SET */),
        delete: createReadonlyMethod("delete" /* DELETE */),
        clear: createReadonlyMethod("clear" /* CLEAR */),
        forEach: createForEach(true, false)
    };
    const shallowReadonlyInstrumentations = {
        get(key) {
            return get$1(this, key, true, true);
        },
        get size() {
            return size(this, true);
        },
        has(key) {
            return has$1.call(this, key, true);
        },
        add: createReadonlyMethod("add" /* ADD */),
        set: createReadonlyMethod("set" /* SET */),
        delete: createReadonlyMethod("delete" /* DELETE */),
        clear: createReadonlyMethod("clear" /* CLEAR */),
        forEach: createForEach(true, true)
    };
    const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
    iteratorMethods.forEach(method => {
        mutableInstrumentations[method] = createIterableMethod(method, false, false);
        readonlyInstrumentations[method] = createIterableMethod(method, true, false);
        shallowInstrumentations[method] = createIterableMethod(method, false, true);
        shallowReadonlyInstrumentations[method] = createIterableMethod(method, true, true);
    });
    return [
        mutableInstrumentations,
        readonlyInstrumentations,
        shallowInstrumentations,
        shallowReadonlyInstrumentations
    ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* #__PURE__*/ createInstrumentations();
function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow
        ? isReadonly
            ? shallowReadonlyInstrumentations
            : shallowInstrumentations
        : isReadonly
            ? readonlyInstrumentations
            : mutableInstrumentations;
    return (target, key, receiver) => {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_raw" /* RAW */) {
            return target;
        }
        return Reflect.get(hasOwn(instrumentations, key) && key in target
            ? instrumentations
            : target, key, receiver);
    };
}
const mutableCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has.call(target, rawKey)) {
        const type = toRawType(target);
        console.warn(`Reactive ${type} contains both the raw and reactive ` +
            `versions of the same object${type === `Map` ? ` as keys` : ``}, ` +
            `which can lead to inconsistencies. ` +
            `Avoid differentiating between the raw and reactive versions ` +
            `of an object and only use the reactive version if possible.`);
    }
}

const reactiveMap = new WeakMap();
const shallowReactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
function targetTypeMap(rawType) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return 1 /* COMMON */;
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return 2 /* COLLECTION */;
        default:
            return 0 /* INVALID */;
    }
}
function getTargetType(value) {
    return value["__v_skip" /* SKIP */] || !Object.isExtensible(value)
        ? 0 /* INVALID */
        : targetTypeMap(toRawType(value));
}
function reactive(target) {
    // if trying to observe a readonly proxy, return the readonly version.
    if (target && target["__v_isReadonly" /* IS_READONLY */]) {
        return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
/**
 * Return a shallowly-reactive copy of the original object, where only the root
 * level properties are reactive. It also does not auto-unwrap refs (even at the
 * root level).
 */
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
/**
 * Creates a readonly copy of the original object. Note the returned copy is not
 * made reactive, but `readonly` can be called on an already reactive object.
 */
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
/**
 * Returns a reactive-copy of the original object, where only the root level
 * properties are readonly, and does NOT unwrap refs nor recursively convert
 * returned properties.
 * This is used for creating the props proxy object for stateful components.
 */
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject$1(target)) {
        {
            console.warn(`value cannot be made reactive: ${String(target)}`);
        }
        return target;
    }
    // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object
    if (target["__v_raw" /* RAW */] &&
        !(isReadonly && target["__v_isReactive" /* IS_REACTIVE */])) {
        return target;
    }
    // target already has corresponding Proxy
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    // only a whitelist of value types can be observed.
    const targetType = getTargetType(target);
    if (targetType === 0 /* INVALID */) {
        return target;
    }
    const proxy = new Proxy(target, targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
function isReactive(value) {
    if (isReadonly(value)) {
        return isReactive(value["__v_raw" /* RAW */]);
    }
    return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
}
function isReadonly(value) {
    return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
    const raw = observed && observed["__v_raw" /* RAW */];
    return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
    def(value, "__v_skip" /* SKIP */, true);
    return value;
}
const toReactive = (value) => isObject$1(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$1(value) ? readonly(value) : value;

function trackRefValue(ref) {
    if (isTracking()) {
        ref = toRaw(ref);
        if (!ref.dep) {
            ref.dep = createDep();
        }
        {
            trackEffects(ref.dep, {
                target: ref,
                type: "get" /* GET */,
                key: 'value'
            });
        }
    }
}
function triggerRefValue(ref, newVal) {
    ref = toRaw(ref);
    if (ref.dep) {
        {
            triggerEffects(ref.dep, {
                target: ref,
                type: "set" /* SET */,
                key: 'value',
                newValue: newVal
            });
        }
    }
}
function isRef(r) {
    return Boolean(r && r.__v_isRef === true);
}
function ref(value) {
    return createRef(value, false);
}
function shallowRef(value) {
    return createRef(value, true);
}
function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}
class RefImpl {
    constructor(value, _shallow) {
        this._shallow = _shallow;
        this.dep = undefined;
        this.__v_isRef = true;
        this._rawValue = _shallow ? value : toRaw(value);
        this._value = _shallow ? value : toReactive(value);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        newVal = this._shallow ? newVal : toRaw(newVal);
        if (hasChanged$1(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = this._shallow ? newVal : toReactive(newVal);
            triggerRefValue(this, newVal);
        }
    }
}
function triggerRef(ref) {
    triggerRefValue(ref, ref.value );
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
const shallowUnwrapHandlers = {
    get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        }
        else {
            return Reflect.set(target, key, value, receiver);
        }
    }
};
function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs)
        ? objectWithRefs
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class CustomRefImpl {
    constructor(factory) {
        this.dep = undefined;
        this.__v_isRef = true;
        const { get, set } = factory(() => trackRefValue(this), () => triggerRefValue(this));
        this._get = get;
        this._set = set;
    }
    get value() {
        return this._get();
    }
    set value(newVal) {
        this._set(newVal);
    }
}
function customRef(factory) {
    return new CustomRefImpl(factory);
}
function toRefs(object) {
    if (!isProxy(object)) {
        console.warn(`toRefs() expects a reactive object but received a plain one.`);
    }
    const ret = isArray$1(object) ? new Array(object.length) : {};
    for (const key in object) {
        ret[key] = toRef(object, key);
    }
    return ret;
}
class ObjectRefImpl {
    constructor(_object, _key) {
        this._object = _object;
        this._key = _key;
        this.__v_isRef = true;
    }
    get value() {
        return this._object[this._key];
    }
    set value(newVal) {
        this._object[this._key] = newVal;
    }
}
function toRef(object, key) {
    const val = object[key];
    return isRef(val) ? val : new ObjectRefImpl(object, key);
}

class ComputedRefImpl {
    constructor(getter, _setter, isReadonly) {
        this._setter = _setter;
        this.dep = undefined;
        this._dirty = true;
        this.__v_isRef = true;
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
                triggerRefValue(this);
            }
        });
        this["__v_isReadonly" /* IS_READONLY */] = isReadonly;
    }
    get value() {
        // the computed ref may get wrapped by other proxies e.g. readonly() #3376
        const self = toRaw(this);
        trackRefValue(self);
        if (self._dirty) {
            self._dirty = false;
            self._value = self.effect.run();
        }
        return self._value;
    }
    set value(newValue) {
        this._setter(newValue);
    }
}
function computed(getterOrOptions, debugOptions) {
    let getter;
    let setter;
    const onlyGetter = isFunction$1(getterOrOptions);
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => {
                console.warn('Write operation failed: computed value is readonly');
            }
            ;
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter);
    if (debugOptions) {
        cRef.effect.onTrack = debugOptions.onTrack;
        cRef.effect.onTrigger = debugOptions.onTrigger;
    }
    return cRef;
}
Promise.resolve();

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
    {
        seen = seen || new Map();
    }
    // Conditional usage of checkRecursiveUpdate must be determined out of
    // try ... catch block since Rollup by default de-optimizes treeshaking
    // inside try-catch. This can leave all warning code unshaked. Although
    // they would get eventually shaken by a minifier like terser, some minifiers
    // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
    const check = (job) => checkRecursiveUpdates(seen, job)
        ; // eslint-disable-line @typescript-eslint/no-empty-function
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job.active !== false) {
                /* istanbul ignore if  */
                if (true && check(job)) {
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
    /* istanbul ignore if */
    if (count > RECURSION_LIMIT) {
        console.warn(`Maximum recursive updates exceeded. ` +
            `This means you have a reactive effect that is mutating its own ` +
            `dependencies and thus recursively triggering itself.`);
        return true;
    }
    seen.set(fn, count + 1);
    return false;
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
    page.__scope__.on();
}
function unsetCurrentPage() {
    /* istanbul ignore else */
    if (currentPage) {
        currentPage.__scope__.off();
    }
    currentPage = null;
}
function setCurrentComponent(component) {
    currentComponent = component;
    component.__scope__.on();
}
function unsetCurrentComponent() {
    /* istanbul ignore else */
    if (currentComponent) {
        currentComponent.__scope__.off();
    }
    currentComponent = null;
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

// Simple effect.
function watchEffect(effect, options) {
    return doWatch(effect, null, options);
}
function watchPostEffect(effect, options) {
    return doWatch(effect, null, (Object.assign(options || {}, { flush: 'post' })
        ));
}
function watchSyncEffect(effect, options) {
    return doWatch(effect, null, (Object.assign(options || {}, { flush: 'sync' })
        ));
}
// Initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {};
// Implementation
function watch(source, cb, options) {
    if (!isFunction(cb)) {
        console.warn(`\`watch(fn, options?)\` signature has been moved to a separate API. ` +
            `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
            `supports \`watch(source, cb, options?) signature.`);
    }
    return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = {}) {
    if (!cb) {
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
    let isMultiSource = false;
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
        isMultiSource = true;
        forceTrigger = source.some((s) => isReactive(s));
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
            {
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
        {
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
        cleanup = effect.onStop = () => {
            fn();
        };
    };
    let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
    const job = () => {
        if (!effect.active) {
            return;
        }
        if (cb) {
            // Watch(source, cb)
            const newValue = effect.run();
            if (deep ||
                forceTrigger ||
                (isMultiSource
                    ? newValue.some((v, i) => hasChanged(v, oldValue[i]))
                    : hasChanged(newValue, oldValue))) {
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
    else {
        scheduler = () => {
            queueJob(job);
        };
    }
    const effect = new ReactiveEffect(getter, scheduler);
    /* istanbul ignore else */
    {
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
    const instance = getCurrentInstance();
    return () => {
        effect.stop();
        if (instance && instance.__scope__) {
            remove(instance.__scope__.effects, effect);
        }
    };
}
function traverse(value, seen) {
    if (!isObject(value) || value["__v_skip" /* SKIP */]) {
        return value;
    }
    seen = seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    /* istanbul ignore else  */
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
    else if (isPlainObject(value)) {
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
    {
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
        unsetCurrentApp();
        if (originOnLaunch !== undefined) {
            originOnLaunch.call(this, options);
        }
    };
    options["onShow" /* ON_SHOW */] = createLifecycle$2(options, "onShow" /* ON_SHOW */);
    options["onHide" /* ON_HIDE */] = createLifecycle$2(options, "onHide" /* ON_HIDE */);
    options["onError" /* ON_ERROR */] = createLifecycle$2(options, "onError" /* ON_ERROR */);
    options["onPageNotFound" /* ON_PAGE_NOT_FOUND */] = createLifecycle$2(options, "onPageNotFound" /* ON_PAGE_NOT_FOUND */);
    options["onUnhandledRejection" /* ON_UNHANDLED_REJECTION */] = createLifecycle$2(options, "onUnhandledRejection" /* ON_UNHANDLED_REJECTION */);
    options["onThemeChange" /* ON_THEME_CHANGE */] = createLifecycle$2(options, "onThemeChange" /* ON_THEME_CHANGE */);
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
    const onUnload = createLifecycle$1(options, "onUnload" /* ON_UNLOAD */);
    options["onUnload" /* ON_UNLOAD */] = function () {
        onUnload.call(this);
        this.__scope__.stop();
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
        };
        const bindings = setup(shallowReadonly(this.__props__)
            , context);
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
    const detached = createComponentLifecycle(options, "detached" /* DETACHED */);
    options.lifetimes["detached" /* DETACHED */] = function () {
        detached.call(this);
        this.__scope__.stop();
    };
    const originReady = options.lifetimes["ready" /* READY */] ||
        options["ready" /* READY */];
    options.lifetimes["ready" /* READY */] = createLifecycle(SpecialLifecycleMap["ready" /* READY */], originReady);
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
    options.pageLifetimes[SpecialLifecycleMap["onShow" /* ON_SHOW */]] =
        createSpecialPageLifecycle(options, "onShow" /* ON_SHOW */);
    options.pageLifetimes[SpecialLifecycleMap["onHide" /* ON_HIDE */]] =
        createSpecialPageLifecycle(options, "onHide" /* ON_HIDE */);
    options.pageLifetimes[SpecialLifecycleMap["onResize" /* ON_RESIZE */]] =
        createSpecialPageLifecycle(options, "onResize" /* ON_RESIZE */);
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
    /* istanbul ignore else  */
    if (currentInstance) {
        /* istanbul ignore else  */
        if (currentInstance.__listenPageScroll__) {
            injectHook(currentInstance, "onPageScroll" /* ON_PAGE_SCROLL */, hook);
        }
        else {
            console.warn('onPageScroll() hook only works when `listenPageScroll` is configured to true.');
        }
    }
    else {
        console.warn(pageHookWarn);
    }
};
const onShareAppMessage = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else  */
    if (currentInstance) {
        /* istanbul ignore else  */
        if (currentInstance["onShareAppMessage" /* ON_SHARE_APP_MESSAGE */] &&
            currentInstance.__isInjectedShareToOthersHook__) {
            const hiddenField = toHiddenField("onShareAppMessage" /* ON_SHARE_APP_MESSAGE */);
            /* istanbul ignore else  */
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            }
            else {
                console.warn('onShareAppMessage() hook can only be called once.');
            }
        }
        else {
            console.warn('onShareAppMessage() hook only works when `onShareAppMessage` option is not exist and `canShareToOthers` is configured to true.');
        }
    }
    else {
        console.warn(pageHookWarn);
    }
};
const onShareTimeline = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else  */
    if (currentInstance) {
        /* istanbul ignore else  */
        if (currentInstance["onShareTimeline" /* ON_SHARE_TIMELINE */] &&
            currentInstance.__isInjectedShareToTimelineHook__) {
            const hiddenField = toHiddenField("onShareTimeline" /* ON_SHARE_TIMELINE */);
            /* istanbul ignore else  */
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            }
            else {
                console.warn('onShareTimeline() hook can only be called once.');
            }
        }
        else {
            console.warn('onShareTimeline() hook only works when `onShareTimeline` option is not exist and `canShareToTimeline` is configured to true.');
        }
    }
    else {
        console.warn(pageHookWarn);
    }
};
const onAddToFavorites = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else  */
    if (currentInstance) {
        /* istanbul ignore else  */
        if (currentInstance.__isInjectedFavoritesHook__) {
            const hiddenField = toHiddenField("onAddToFavorites" /* ON_ADD_TO_FAVORITES */);
            /* istanbul ignore else  */
            if (currentInstance[hiddenField] === undefined) {
                currentInstance[hiddenField] = hook;
            }
            else {
                console.warn('onAddToFavorites() hook can only be called once.');
            }
        }
        else {
            console.warn('onAddToFavorites() hook only works when `onAddToFavorites` option is not exist.');
        }
    }
    else {
        console.warn(pageHookWarn);
    }
};
const onReady = (hook) => {
    const currentInstance = getCurrentInstance();
    /* istanbul ignore else  */
    if (currentInstance) {
        injectHook(currentInstance, "onReady" /* ON_READY */, hook);
    }
    else {
        console.warn('onReady() hook can only be called during execution of setup() in definePage() or defineComponent().');
    }
};
const onLoad = createComponentHook("onLoad" /* ON_LOAD */);
const onMove = createComponentHook("moved" /* MOVED */);
const onDetach = createComponentHook("detached" /* DETACHED */);
const onError = createComponentHook("error" /* ERROR */);
function createAppHook(lifecycle) {
    return (hook) => {
        /* istanbul ignore else  */
        if (currentApp) {
            injectHook(currentApp, lifecycle, hook);
        }
        else {
            console.warn('App specific lifecycle injection APIs can only be used during execution of setup() in createApp().');
        }
    };
}
function createPageHook(lifecycle) {
    return (hook) => {
        const currentInstance = getCurrentInstance();
        /* istanbul ignore else  */
        if (currentInstance) {
            injectHook(currentInstance, lifecycle, hook);
        }
        else {
            console.warn(pageHookWarn);
        }
    };
}
function createComponentHook(lifecycle) {
    return (hook) => {
        /* istanbul ignore else  */
        if (currentComponent) {
            injectHook(currentComponent, lifecycle, hook);
        }
        else {
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

exports.EffectScope = EffectScope;
exports.ReactiveEffect = ReactiveEffect;
exports.computed = computed;
exports.createApp = createApp;
exports.customRef = customRef;
exports.defineComponent = defineComponent;
exports.definePage = definePage;
exports.effect = effect;
exports.effectScope = effectScope;
exports.getCurrentScope = getCurrentScope;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.markRaw = markRaw;
exports.nextTick = nextTick;
exports.onAddToFavorites = onAddToFavorites;
exports.onAppError = onAppError;
exports.onAppHide = onAppHide;
exports.onAppShow = onAppShow;
exports.onDetach = onDetach;
exports.onError = onError;
exports.onHide = onHide;
exports.onLoad = onLoad;
exports.onMove = onMove;
exports.onPageNotFound = onPageNotFound;
exports.onPageScroll = onPageScroll;
exports.onPullDownRefresh = onPullDownRefresh;
exports.onReachBottom = onReachBottom;
exports.onReady = onReady;
exports.onResize = onResize;
exports.onScopeDispose = onScopeDispose;
exports.onShareAppMessage = onShareAppMessage;
exports.onShareTimeline = onShareTimeline;
exports.onShow = onShow;
exports.onTabItemTap = onTabItemTap;
exports.onThemeChange = onThemeChange;
exports.onUnhandledRejection = onUnhandledRejection;
exports.onUnload = onUnload;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
exports.shallowRef = shallowRef;
exports.stop = stop;
exports.toRaw = toRaw;
exports.toRef = toRef;
exports.toRefs = toRefs;
exports.triggerRef = triggerRef;
exports.unref = unref;
exports.watch = watch;
exports.watchEffect = watchEffect;
exports.watchPostEffect = watchPostEffect;
exports.watchSyncEffect = watchSyncEffect;
