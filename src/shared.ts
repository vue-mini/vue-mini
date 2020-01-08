import { isRef, isReactive, isReadonly, toRaw } from '@next-vue/reactivity'
import { watch } from './watch'
import {
  isArray,
  getType,
  isSimpleValue,
  isObject,
  isPlainObject,
  isFunction,
  isSuperset
} from './utils'

export function deepToRaw(x: unknown): unknown {
  if (isSimpleValue(x) || isFunction(x)) {
    return x
  }

  if (isRef(x)) {
    return deepToRaw(x.value)
  }

  if (isReactive(x) || isReadonly(x)) {
    return deepToRaw(toRaw(x))
  }

  if (isArray(x)) {
    return x.map(item => deepToRaw(item))
  }

  if (isPlainObject(x)) {
    const obj: { [key: string]: unknown } = {}
    Object.keys(x).forEach(key => {
      obj[key] = deepToRaw(x[key])
    })
    return obj
  }

  throw new TypeError(`${getType(x)} value is not supported`)
}

export function deepWatch(
  this: Pick<
    WechatMiniprogram.Component.InstanceMethods<Record<string, unknown>>,
    'setData'
  >,
  key: string,
  value: unknown
): void {
  if (!isObject(value) || isReadonly(value)) {
    return
  }

  if (isRef(value)) {
    watch(
      () => value.value,
      () => this.setData({ [key]: deepToRaw(value.value) }),
      { lazy: true }
    )
    deepWatch.call(this, key, value.value)
    return
  }

  if (isReactive(value)) {
    const row = toRaw(value)
    if (isArray(row)) {
      watch(
        () => value,
        () => {
          this.setData({ [key]: deepToRaw(value) })
        },
        {
          lazy: true,
          deep: true
        }
      )
      return
    }

    if (isPlainObject(row)) {
      const watchObjectField = (
        obj: Record<string, unknown>,
        oldObj: Record<string, unknown> = {}
      ): void => {
        Object.keys(obj).forEach(name => {
          if (toRaw(obj[name]) !== toRaw(oldObj[name])) {
            deepWatch.call(this, `${key}.${name}`, obj[name])
          }
        })
      }

      watch<Record<string, unknown>>(
        () => ({ ...value }),
        (obj, oldObj) => {
          const keys = Object.keys(obj)
          const oldKeys = Object.keys(oldObj)
          if (isSuperset(keys, oldKeys)) {
            // No deleted field
            keys.forEach(name => {
              if (toRaw(obj[name]) !== toRaw(oldObj[name])) {
                this.setData({ [`${key}.${name}`]: deepToRaw(obj[name]) })
              }
            })
          } else {
            this.setData({ [key]: deepToRaw(obj) })
          }

          watchObjectField(obj, oldObj)
        },
        { lazy: true }
      )
      watchObjectField(value as Record<string, unknown>)
      return
    }

    return
  }

  if (isArray(value)) {
    value.forEach((_, index) => {
      deepWatch.call(this, `${key}[${index}]`, value[index])
    })
    return
  }

  if (isPlainObject(value)) {
    Object.keys(value).forEach(name => {
      deepWatch.call(this, `${key}.${name}`, value[name])
    })
  }
}
