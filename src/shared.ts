import {
  isRef,
  isReactive,
  isReadonly,
  toRaw,
  effect,
  stop,
  ReactiveEffect
} from '@next-vue/reactivity'
import { isObject, isPlainObject } from './utils'

interface Page {
  setData: (data: Record<string, unknown>) => void
}

export function deepToRaw(x: unknown): unknown {
  if (!isObject(x)) {
    return x
  }

  if (isRef(x)) {
    return deepToRaw(x.value)
  }

  if (isReactive(x) || isReadonly(x)) {
    return deepToRaw(toRaw(x))
  }

  if (Array.isArray(x)) {
    return x.map(item => deepToRaw(item))
  }

  if (isPlainObject(x)) {
    const obj: { [key: string]: unknown } = {}
    Object.keys(x).forEach(key => {
      obj[key] = deepToRaw(x[key])
    })
    return obj
  }

  return x
}

export function deepWatch(this: Page, key: string, value: unknown): void {
  if (!isObject(value) || isReadonly(value)) {
    return
  }

  if (isRef(value)) {
    effect(() => this.setData({ [key]: deepToRaw(value.value) }))
    return Reflect.apply(deepWatch, this, [key, value.value])
  }

  if (isReactive(value)) {
    const row = toRaw(value)
    if (Array.isArray(row)) {
      const effects = new Set<ReactiveEffect<void>>()
      effect(() => {
        this.setData({ [key]: deepToRaw(value) })
        effects.forEach(effect => stop(effect))
        const { length } = value as unknown[]
        for (let i = 0; i < length; i++) {
          const k = `${key}[${i}]`
          effects.add(
            effect(() => {
              if (i in value) {
                this.setData({ [k]: deepToRaw((value as unknown[])[i]) })
              }
            })
          )
          Reflect.apply(deepWatch, this, [k, (value as unknown[])[i]])
        }
      })
      return
    }

    if (isPlainObject(row)) {
      const effects = new Set<ReactiveEffect<void>>()
      effect(() => {
        this.setData({ [key]: deepToRaw(value) })
        effects.forEach(effect => stop(effect))
        Object.keys(value).forEach(name => {
          const k = `${key}.${name}`
          effects.add(
            effect(() => {
              if (name in value) {
                this.setData({
                  [k]: deepToRaw((value as { [name: string]: unknown })[name])
                })
              }
            })
          )
          Reflect.apply(deepWatch, this, [
            k,
            (value as { [name: string]: unknown })[name]
          ])
        })
      })
      return
    }

    return
  }

  if (Array.isArray(value)) {
    value.forEach((_, index) => {
      Reflect.apply(deepWatch, this, [`${key}[${index}]`, value[index]])
    })
    return
  }

  if (isPlainObject(value)) {
    Object.keys(value).forEach(name => {
      Reflect.apply(deepWatch, this, [`${key}.${name}`, value[name]])
    })
  }
}
