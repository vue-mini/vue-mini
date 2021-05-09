import { isRef, isProxy, toRaw, isReactive } from '@vue/reactivity'
import { watch } from './watch'
import {
  isArray,
  getType,
  isSimpleValue,
  isPlainObject,
  isFunction,
  toHiddenField,
} from './utils'
import { ComponentInstance, PageInstance } from './instance'
import { nextTick } from './scheduler'

export function deepToRaw(x: unknown): unknown {
  if (isSimpleValue(x) || isFunction(x)) {
    return x
  }

  if (isRef(x)) {
    return deepToRaw(x.value)
  }

  if (isProxy(x)) {
    return deepToRaw(toRaw(x))
  }

  if (isArray(x)) {
    return x.map((item) => deepToRaw(item))
  }

  if (isPlainObject(x)) {
    const obj: Record<string, unknown> = {}
    Object.keys(x).forEach((key) => {
      obj[key] = deepToRaw(x[key])
    })
    return obj
  }

  throw new TypeError(`${getType(x)} value is not supported`)
}

export function deepWatch(
  this: PageInstance | ComponentInstance,
  key: string,
  value: unknown
): void {
  if (isRef(value)) {
    return deepWatch.call(this, key + `.value`, value.value)
  }
  if (isReactive(value)) {
    return walk.call(this, key, value)
  }
  if (isArray(value)) {
    return watchArray.call(this, key, value)
  }
  watch(
    // 触发get
    () => {
      return parsePath(this, '__' + key)
    },
    (n) => {
      refreshData.call(this, key, n)
    }
  )
}
function watchArray(this: any, key: string, value: unknown[]) {
  for (let i = 0; i < value.length; i++) {
    deepWatch.call(this, key + `.${i}`, value[i])
  }
}
function walk(this: any, key: string, value: any) {
  const keys = Object.keys(value)
  for (let i = 0; i < keys.length; i++) {
    deepWatch.call(this, key + `.${keys[i]}`, value[keys[i]])
  }
}
function parsePath(obj: any, path: string): any {
  const segments = path.split('.')
  for (let i = 0; i < segments.length; i++) {
    if (!obj) return
    obj = obj[segments[i]]
  }
  return obj
}
function refreshData(this: any, key: string, n: unknown) {
  let setDatas: string = toHiddenField('setDatas');
  let waitRefresh: string = toHiddenField('waitRefresh');
  if (key.endsWith('.value')) {
    let refKey: string = key.slice(0, key.length - 6)
    key = isRef(parsePath(this, '__' + refKey)) ? refKey : key
  }
  (this[setDatas] || (this[setDatas] = {}))[key] = deepToRaw(n)
  if (!this[waitRefresh]) {
    this.waitRefresh = nextTick(() => {
      this.setData(this[setDatas])
      this[setDatas] = null
      this[waitRefresh] = null
    })
  }
}
