/*!
 * vue-mini v1.0.0-beta.4
 * https://github.com/vue-mini/vue-mini
 * (c) 2019-present Yang Mingshan
 * @license MIT
 */
'use strict';

function makeMap(str, expectsLowerCase) {
  const set = new Set(str.split(","));
  return expectsLowerCase ? (val) => set.has(val.toLowerCase()) : (val) => set.has(val);
}
const NOOP$1 = () => {
};
const extend$1 = Object.assign;
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray$1 = Array.isArray;
const isMap$1 = (val) => toTypeString(val) === "[object Map]";
const isFunction$1 = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
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
class EffectScope {
  constructor(detached = false) {
    this.detached = detached;
    /**
     * @internal
     */
    this._active = true;
    /**
     * @internal
     */
    this.effects = [];
    /**
     * @internal
     */
    this.cleanups = [];
    this.parent = activeEffectScope;
    if (!detached && activeEffectScope) {
      this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
        this
      ) - 1;
    }
  }
  get active() {
    return this._active;
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    } else {
      warn(`cannot run an inactive effect scope.`);
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    activeEffectScope = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    activeEffectScope = this.parent;
  }
  stop(fromParent) {
    if (this._active) {
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
      this._active = false;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function recordEffectScope(effect, scope = activeEffectScope) {
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
  } else {
    warn(
      `onScopeDispose() is called when there is no active effect scope to be associated with.`
    );
  }
}

let activeEffect;
class ReactiveEffect {
  constructor(fn, trigger, scheduler, scope) {
    this.fn = fn;
    this.trigger = trigger;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
    /**
     * @internal
     */
    this._dirtyLevel = 3;
    /**
     * @internal
     */
    this._trackId = 0;
    /**
     * @internal
     */
    this._runnings = 0;
    /**
     * @internal
     */
    this._queryings = 0;
    /**
     * @internal
     */
    this._depsLength = 0;
    recordEffectScope(this, scope);
  }
  get dirty() {
    if (this._dirtyLevel === 1) {
      this._dirtyLevel = 0;
      this._queryings++;
      pauseTracking();
      for (const dep of this.deps) {
        if (dep.computed) {
          triggerComputed(dep.computed);
          if (this._dirtyLevel >= 2) {
            break;
          }
        }
      }
      resetTracking();
      this._queryings--;
    }
    return this._dirtyLevel >= 2;
  }
  set dirty(v) {
    this._dirtyLevel = v ? 3 : 0;
  }
  run() {
    this._dirtyLevel = 0;
    if (!this.active) {
      return this.fn();
    }
    let lastShouldTrack = shouldTrack;
    let lastEffect = activeEffect;
    try {
      shouldTrack = true;
      activeEffect = this;
      this._runnings++;
      preCleanupEffect(this);
      return this.fn();
    } finally {
      postCleanupEffect(this);
      this._runnings--;
      activeEffect = lastEffect;
      shouldTrack = lastShouldTrack;
    }
  }
  stop() {
    var _a;
    if (this.active) {
      preCleanupEffect(this);
      postCleanupEffect(this);
      (_a = this.onStop) == null ? void 0 : _a.call(this);
      this.active = false;
    }
  }
}
function triggerComputed(computed) {
  return computed.value;
}
function preCleanupEffect(effect2) {
  effect2._trackId++;
  effect2._depsLength = 0;
}
function postCleanupEffect(effect2) {
  if (effect2.deps && effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      cleanupDepEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
function cleanupDepEffect(dep, effect2) {
  const trackId = dep.get(effect2);
  if (trackId !== void 0 && effect2._trackId !== trackId) {
    dep.delete(effect2);
    if (dep.size === 0) {
      dep.cleanup();
    }
  }
}
function effect(fn, options) {
  if (fn.effect instanceof ReactiveEffect) {
    fn = fn.effect.fn;
  }
  const _effect = new ReactiveEffect(fn, NOOP$1, () => {
    if (_effect.dirty) {
      _effect.run();
    }
  });
  if (options) {
    extend$1(_effect, options);
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
let pauseScheduleStack = 0;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function pauseScheduling() {
  pauseScheduleStack++;
}
function resetScheduling() {
  pauseScheduleStack--;
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()();
  }
}
function trackEffect(effect2, dep, debuggerEventExtraInfo) {
  var _a;
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    const oldDep = effect2.deps[effect2._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanupDepEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depsLength++] = dep;
    } else {
      effect2._depsLength++;
    }
    {
      (_a = effect2.onTrack) == null ? void 0 : _a.call(effect2, extend$1({ effect: effect2 }, debuggerEventExtraInfo));
    }
  }
}
const queueEffectSchedulers = [];
function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
  var _a;
  pauseScheduling();
  for (const effect2 of dep.keys()) {
    if (!effect2.allowRecurse && effect2._runnings) {
      continue;
    }
    if (effect2._dirtyLevel < dirtyLevel && (!effect2._runnings || dirtyLevel !== 2)) {
      const lastDirtyLevel = effect2._dirtyLevel;
      effect2._dirtyLevel = dirtyLevel;
      if (lastDirtyLevel === 0 && (!effect2._queryings || dirtyLevel !== 2)) {
        {
          (_a = effect2.onTrigger) == null ? void 0 : _a.call(effect2, extend$1({ effect: effect2 }, debuggerEventExtraInfo));
        }
        effect2.trigger();
        if (effect2.scheduler) {
          queueEffectSchedulers.push(effect2.scheduler);
        }
      }
    }
  }
  resetScheduling();
}

const createDep = (cleanup, computed) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.computed = computed;
  return dep;
};

const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = Symbol("iterate" );
const MAP_KEY_ITERATE_KEY = Symbol("Map key iterate" );
function track(target, type, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDep(() => depsMap.delete(key)));
    }
    trackEffect(
      activeEffect,
      dep,
      {
        target,
        type,
        key
      } 
    );
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let deps = [];
  if (type === "clear") {
    deps = [...depsMap.values()];
  } else if (key === "length" && isArray$1(target)) {
    const newLength = Number(newValue);
    depsMap.forEach((dep, key2) => {
      if (key2 === "length" || !isSymbol(key2) && key2 >= newLength) {
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      deps.push(depsMap.get(key));
    }
    switch (type) {
      case "add":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap$1(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        } else if (isIntegerKey(key)) {
          deps.push(depsMap.get("length"));
        }
        break;
      case "delete":
        if (!isArray$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
          if (isMap$1(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
          }
        }
        break;
      case "set":
        if (isMap$1(target)) {
          deps.push(depsMap.get(ITERATE_KEY));
        }
        break;
    }
  }
  pauseScheduling();
  for (const dep of deps) {
    if (dep) {
      triggerEffects(
        dep,
        3,
        {
          target,
          type,
          key,
          newValue,
          oldValue,
          oldTarget
        } 
      );
    }
  }
  resetScheduling();
}
function getDepFromReactive(object, key) {
  var _a;
  return (_a = targetMap.get(object)) == null ? void 0 : _a.get(key);
}

const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
const arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
function createArrayInstrumentations() {
  const instrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    instrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = arr[key](...args);
      if (res === -1 || res === false) {
        return arr[key](...args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    instrumentations[key] = function(...args) {
      pauseTracking();
      pauseScheduling();
      const res = toRaw(this)[key].apply(this, args);
      resetScheduling();
      resetTracking();
      return res;
    };
  });
  return instrumentations;
}
function hasOwnProperty(key) {
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _shallow = false) {
    this._isReadonly = _isReadonly;
    this._shallow = _shallow;
  }
  get(target, key, receiver) {
    const isReadonly2 = this._isReadonly, shallow = this._shallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return shallow;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the reciever is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(target, key, receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (shallow) {
      return res;
    }
    if (isRef(res)) {
      return targetIsArray && isIntegerKey(key) ? res : res.value;
    }
    if (isObject$1(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(shallow = false) {
    super(false, shallow);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    if (!this._shallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArray$1(target) && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return false;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArray$1(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged$1(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray$1(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(shallow = false) {
    super(true, shallow);
  }
  set(target, key) {
    {
      warn(
        `Set operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
  deleteProperty(target, key) {
    {
      warn(
        `Delete operation on key "${String(key)}" failed: target is readonly.`,
        target
      );
    }
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(
  true
);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);

const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get(target, key, isReadonly = false, isShallow = false) {
  target = target["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly) {
    if (hasChanged$1(key, rawKey)) {
      track(rawTarget, "get", key);
    }
    track(rawTarget, "get", rawKey);
  }
  const { has: has2 } = getProto(rawTarget);
  const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
  if (has2.call(rawTarget, key)) {
    return wrap(target.get(key));
  } else if (has2.call(rawTarget, rawKey)) {
    return wrap(target.get(rawKey));
  } else if (target !== rawTarget) {
    target.get(key);
  }
}
function has(key, isReadonly = false) {
  const target = this["__v_raw"];
  const rawTarget = toRaw(target);
  const rawKey = toRaw(key);
  if (!isReadonly) {
    if (hasChanged$1(key, rawKey)) {
      track(rawTarget, "has", key);
    }
    track(rawTarget, "has", rawKey);
  }
  return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly = false) {
  target = target["__v_raw"];
  !isReadonly && track(toRaw(target), "iterate", ITERATE_KEY);
  return Reflect.get(target, "size", target);
}
function add(value) {
  value = toRaw(value);
  const target = toRaw(this);
  const proto = getProto(target);
  const hadKey = proto.has.call(target, value);
  if (!hadKey) {
    target.add(value);
    trigger(target, "add", value, value);
  }
  return this;
}
function set(key, value) {
  value = toRaw(value);
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get2.call(target, key);
  target.set(key, value);
  if (!hadKey) {
    trigger(target, "add", key, value);
  } else if (hasChanged$1(value, oldValue)) {
    trigger(target, "set", key, value, oldValue);
  }
  return this;
}
function deleteEntry(key) {
  const target = toRaw(this);
  const { has: has2, get: get2 } = getProto(target);
  let hadKey = has2.call(target, key);
  if (!hadKey) {
    key = toRaw(key);
    hadKey = has2.call(target, key);
  } else {
    checkIdentityKeys(target, has2, key);
  }
  const oldValue = get2 ? get2.call(target, key) : void 0;
  const result = target.delete(key);
  if (hadKey) {
    trigger(target, "delete", key, void 0, oldValue);
  }
  return result;
}
function clear() {
  const target = toRaw(this);
  const hadItems = target.size !== 0;
  const oldTarget = isMap$1(target) ? new Map(target) : new Set(target) ;
  const result = target.clear();
  if (hadItems) {
    trigger(target, "clear", void 0, void 0, oldTarget);
  }
  return result;
}
function createForEach(isReadonly, isShallow) {
  return function forEach(callback, thisArg) {
    const observed = this;
    const target = observed["__v_raw"];
    const rawTarget = toRaw(target);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    !isReadonly && track(rawTarget, "iterate", ITERATE_KEY);
    return target.forEach((value, key) => {
      return callback.call(thisArg, wrap(value), wrap(key), observed);
    });
  };
}
function createIterableMethod(method, isReadonly, isShallow) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap$1(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    !isReadonly && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return {
      // iterator protocol
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
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
  return function(...args) {
    {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      console.warn(
        `${capitalize(type)} operation ${key}failed: target is readonly.`,
        toRaw(this)
      );
    }
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations() {
  const mutableInstrumentations2 = {
    get(key) {
      return get(this, key);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  const shallowInstrumentations2 = {
    get(key) {
      return get(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has,
    add,
    set,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  const readonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  const shallowReadonlyInstrumentations2 = {
    get(key) {
      return get(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations2[method] = createIterableMethod(
      method,
      false,
      false
    );
    readonlyInstrumentations2[method] = createIterableMethod(
      method,
      true,
      false
    );
    shallowInstrumentations2[method] = createIterableMethod(
      method,
      false,
      true
    );
    shallowReadonlyInstrumentations2[method] = createIterableMethod(
      method,
      true,
      true
    );
  });
  return [
    mutableInstrumentations2,
    readonlyInstrumentations2,
    shallowInstrumentations2,
    shallowReadonlyInstrumentations2
  ];
}
const [
  mutableInstrumentations,
  readonlyInstrumentations,
  shallowInstrumentations,
  shallowReadonlyInstrumentations
] = /* @__PURE__ */ createInstrumentations();
function createInstrumentationGetter(isReadonly, shallow) {
  const instrumentations = shallow ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly ? readonlyInstrumentations : mutableInstrumentations;
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly;
    } else if (key === "__v_isReadonly") {
      return isReadonly;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has2, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has2.call(target, rawKey)) {
    const type = toRawType(target);
    console.warn(
      `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}

const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1 /* COMMON */;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2 /* COLLECTION */;
    default:
      return 0 /* INVALID */;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 /* INVALID */ : targetTypeMap(toRawType(value));
}
function reactive(target) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$1(target)) {
    {
      console.warn(`value cannot be made reactive: ${String(target)}`);
    }
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = getTargetType(target);
  if (targetType === 0 /* INVALID */) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
  def(value, "__v_skip", true);
  return value;
}
const toReactive = (value) => isObject$1(value) ? reactive(value) : value;
const toReadonly = (value) => isObject$1(value) ? readonly(value) : value;

class ComputedRefImpl {
  constructor(getter, _setter, isReadonly, isSSR) {
    this._setter = _setter;
    this.dep = void 0;
    this.__v_isRef = true;
    this["__v_isReadonly"] = false;
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => triggerRefValue(this, 1)
    );
    this.effect.computed = this;
    this.effect.active = this._cacheable = !isSSR;
    this["__v_isReadonly"] = isReadonly;
  }
  get value() {
    const self = toRaw(this);
    trackRefValue(self);
    if (!self._cacheable || self.effect.dirty) {
      if (hasChanged$1(self._value, self._value = self.effect.run())) {
        triggerRefValue(self, 2);
      }
    }
    return self._value;
  }
  set value(newValue) {
    this._setter(newValue);
  }
  // #region polyfill _dirty for backward compatibility third party code for Vue <= 3.3.x
  get _dirty() {
    return this.effect.dirty;
  }
  set _dirty(v) {
    this.effect.dirty = v;
  }
  // #endregion
}
function computed(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  const onlyGetter = isFunction$1(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("Write operation failed: computed value is readonly");
    } ;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
  if (debugOptions && !isSSR) {
    cRef.effect.onTrack = debugOptions.onTrack;
    cRef.effect.onTrigger = debugOptions.onTrigger;
  }
  return cRef;
}

function trackRefValue(ref2) {
  if (shouldTrack && activeEffect) {
    ref2 = toRaw(ref2);
    trackEffect(
      activeEffect,
      ref2.dep || (ref2.dep = createDep(
        () => ref2.dep = void 0,
        ref2 instanceof ComputedRefImpl ? ref2 : void 0
      )),
      {
        target: ref2,
        type: "get",
        key: "value"
      } 
    );
  }
}
function triggerRefValue(ref2, dirtyLevel = 3, newVal) {
  ref2 = toRaw(ref2);
  const dep = ref2.dep;
  if (dep) {
    triggerEffects(
      dep,
      dirtyLevel,
      {
        target: ref2,
        type: "set",
        key: "value",
        newValue: newVal
      } 
    );
  }
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
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
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = void 0;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (hasChanged$1(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      triggerRefValue(this, 3, newVal);
    }
  }
}
function triggerRef(ref2) {
  triggerRefValue(ref2, 3, ref2.value );
}
function unref(ref2) {
  return isRef(ref2) ? ref2.value : ref2;
}
function toValue(source) {
  return isFunction$1(source) ? source() : unref(source);
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class CustomRefImpl {
  constructor(factory) {
    this.dep = void 0;
    this.__v_isRef = true;
    const { get, set } = factory(
      () => trackRefValue(this),
      () => triggerRefValue(this)
    );
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
    ret[key] = propertyToRef(object, key);
  }
  return ret;
}
class ObjectRefImpl {
  constructor(_object, _key, _defaultValue) {
    this._object = _object;
    this._key = _key;
    this._defaultValue = _defaultValue;
    this.__v_isRef = true;
  }
  get value() {
    const val = this._object[this._key];
    return val === void 0 ? this._defaultValue : val;
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
  get dep() {
    return getDepFromReactive(toRaw(this._object), this._key);
  }
}
class GetterRefImpl {
  constructor(_getter) {
    this._getter = _getter;
    this.__v_isRef = true;
    this.__v_isReadonly = true;
  }
  get value() {
    return this._getter();
  }
}
function toRef(source, key, defaultValue) {
  if (isRef(source)) {
    return source;
  } else if (isFunction$1(source)) {
    return new GetterRefImpl(source);
  } else if (isObject$1(source) && arguments.length > 1) {
    return propertyToRef(source, key, defaultValue);
  } else {
    return ref(source);
  }
}
function propertyToRef(source, key, defaultValue) {
  const val = source[key];
  return isRef(val) ? val : new ObjectRefImpl(source, key, defaultValue);
}

const TrackOpTypes = {
  "GET": "get",
  "HAS": "has",
  "ITERATE": "iterate"
};
const TriggerOpTypes = {
  "SET": "set",
  "ADD": "add",
  "DELETE": "delete",
  "CLEAR": "clear"
};
const ReactiveFlags = {
  "SKIP": "__v_skip",
  "IS_REACTIVE": "__v_isReactive",
  "IS_READONLY": "__v_isReadonly",
  "IS_SHALLOW": "__v_isShallow",
  "RAW": "__v_raw"
};

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
    {
        seen = seen || new Map();
    }
    // Conditional usage of checkRecursiveUpdate must be determined out of
    // try ... catch block since Rollup by default de-optimizes treeshaking
    // inside try-catch. This can leave all warning code unshaked. Although
    // they would get eventually shaken by a minifier like terser, some minifiers
    // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
    const check = (job) => checkRecursiveUpdates(seen, job)
        ;
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job.active !== false) {
                /* istanbul ignore if -- @preserve  */
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
    return doWatch(effect, null, extend({}, options, { flush: 'post' })
        );
}
function watchSyncEffect(effect, options) {
    return doWatch(effect, null, extend({}, options, { flush: 'sync' })
        );
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
// eslint-disable-next-line complexity
function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = {}) {
    if (cb && once) {
        const _cb = cb;
        cb = (...args) => {
            _cb(...args);
            unwatch();
        };
    }
    if (deep !== undefined && typeof deep === 'number') {
        console.warn(`watch() "deep" option with number value will be used as watch depth in future versions. ` +
            `Please use a boolean instead to avoid potential breakage.`);
    }
    if (!cb) {
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
                return source(onCleanup);
            };
        }
    }
    else {
        getter = NOOP;
        /* istanbul ignore else -- @preserve  */
        {
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
    {
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
    /* istanbul ignore else -- @preserve  */
    if (currentInstance) {
        /* istanbul ignore else -- @preserve  */
        if (currentInstance.__isInjectedFavoritesHook__) {
            const hiddenField = toHiddenField(PageLifecycle.ON_ADD_TO_FAVORITES);
            /* istanbul ignore else -- @preserve  */
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
    /* istanbul ignore else -- @preserve  */
    if (currentInstance) {
        injectHook(currentInstance, PageLifecycle.ON_READY, hook);
    }
    else {
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
        else {
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
        else {
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
exports.TrackOpTypes = TrackOpTypes;
exports.TriggerOpTypes = TriggerOpTypes;
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
exports.isShallow = isShallow;
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
exports.toValue = toValue;
exports.triggerRef = triggerRef;
exports.unref = unref;
exports.watch = watch;
exports.watchEffect = watchEffect;
exports.watchPostEffect = watchPostEffect;
exports.watchSyncEffect = watchSyncEffect;
