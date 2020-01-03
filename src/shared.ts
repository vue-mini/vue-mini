import { isRef, isReactive, isReadonly, toRaw } from '@next-vue/reactivity'
import { watch, StopHandle } from './watch'
import {
  isArray,
  getType,
  isSimpleValue,
  isObject,
  isPlainObject,
  isFunction
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
      const stoppers = new Set<StopHandle>()
      const watchArrayItem = (arr: unknown[]): void => {
        for (let i = 0; i < arr.length; i++) {
          const k = `${key}[${i}]`
          stoppers.add(
            watch(
              () => arr[i],
              () => {
                if (i in arr) {
                  this.setData({ [k]: deepToRaw(arr[i]) })
                }
              },
              { lazy: true }
            )
          )
          deepWatch.call(this, k, arr[i])
        }
      }

      watch(
        () => (value as unknown[]).length,
        (_, __, onCleanup) => {
          this.setData({ [key]: deepToRaw(value) })
          watchArrayItem(value as unknown[])
          onCleanup(() => stoppers.forEach(stopper => stopper()))
        },
        { lazy: true }
      )
      watchArrayItem(value as unknown[])
      return
    }

    if (isPlainObject(row)) {
      const stoppers = new Set<StopHandle>()
      const watchObjectItem = (obj: Record<string, unknown>): void => {
        Object.keys(obj).forEach(name => {
          const k = `${key}.${name}`
          stoppers.add(
            watch(
              () => obj[name],
              () => {
                if (name in obj) {
                  this.setData({ [k]: deepToRaw(obj[name]) })
                }
              },
              { lazy: true }
            )
          )
        })
      }

      watch(
        () => Object.keys(value),
        (_, __, onCleanup) => {
          this.setData({ [key]: deepToRaw(value) })
          watchObjectItem(value as Record<string, unknown>)
          onCleanup(() => stoppers.forEach(stopper => stopper()))
        },
        { lazy: true }
      )
      watchObjectItem(value as Record<string, unknown>)
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
