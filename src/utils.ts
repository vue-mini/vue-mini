export const { isArray } = Array

export function isObject(x: unknown): x is object {
  return x !== null && typeof x === 'object'
}

export function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x !== null && Object.prototype.toString.call(x) === '[object Object]'
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(x: unknown): x is Function {
  return typeof x === 'function'
}

// Compare whether a value has changed, accounting for NaN.
export function hasChanged(value: unknown, oldValue: unknown): boolean {
  // eslint-disable-next-line no-self-compare
  return value !== oldValue && (value === value || oldValue === oldValue)
}

export function toHiddenField(name: string): string {
  return `_${name}`
}
