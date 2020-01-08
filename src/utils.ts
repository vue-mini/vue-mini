export const { isArray } = Array

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
  return x !== null && getType(x) === 'Object'
}

export function isFunction(x: unknown): x is Function {
  return typeof x === 'function'
}

export function isSuperset(x: unknown[], y: unknown[]): boolean {
  // Is X a superset of Y
  if (x.length < y.length) {
    return false
  }

  return y.every(item => x.indexOf(item) !== -1)
}

// Compare whether a value has changed, accounting for NaN.
export function hasChanged(value: unknown, oldValue: unknown): boolean {
  // eslint-disable-next-line no-self-compare
  return value !== oldValue && (value === value || oldValue === oldValue)
}

export function toHiddenField(name: string): string {
  return `_${name}`
}
