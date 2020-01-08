import { isRef, isReactive, isReadonly, toRaw } from '@next-vue/reactivity'
import { watch } from './watch'
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
}
