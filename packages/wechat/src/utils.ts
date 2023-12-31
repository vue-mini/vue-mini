// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => {}

export const { isArray } = Array

export const extend = Object.assign

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

export function isMap(x: unknown): x is Map<any, any> {
  return getType(x) === 'Map'
}

export function isSet(x: unknown): x is Set<any> {
  return getType(x) === 'Set'
}

// Compare whether a value has changed, accounting for NaN.
export function hasChanged(value: unknown, oldValue: unknown): boolean {
  // eslint-disable-next-line no-self-compare
  return value !== oldValue && (value === value || oldValue === oldValue)
}

export function remove<T>(arr: T[], el: T): void {
  const i = arr.indexOf(el)
  if (i > -1) {
    arr.splice(i, 1)
  }
}

export function toHiddenField(name: string): string {
  return `__${name}__`
}
