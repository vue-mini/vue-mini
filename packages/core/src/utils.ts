export const EMPTY_OBJ: Readonly<Record<string, any>> =
  __DEV__ ? Object.freeze({}) : /* istanbul ignore next -- @preserve */ {}

/* istanbul ignore next -- @preserve */
export const NOOP = (): void => {}

export const isArray: typeof Array.isArray = Array.isArray

export const extend: typeof Object.assign = Object.assign

export function exclude<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const ret: Record<string, unknown> = {}
  Object.keys(obj).forEach((key) => {
    if (!keys.includes(key as K)) {
      ret[key] = obj[key]
    }
  })
  return ret as Omit<T, K>
}

export function getType(x: unknown): string {
  return Object.prototype.toString.call(x).slice(8, -1)
}

export function isSimpleValue(x: unknown): boolean {
  const simpleTypes = new Set(['undefined', 'boolean', 'number', 'string'])
  return x === null || simpleTypes.has(typeof x)
}

export function isObject(x: unknown): x is object {
  return x !== null && typeof x === 'object'
}

export function isPlainObject(x: unknown): x is Record<string, unknown> {
  return getType(x) === 'Object'
}

export function isFunction(x: unknown): x is Function {
  return typeof x === 'function'
}

export function toHiddenField(name: string): string {
  return `__${name}__`
}
