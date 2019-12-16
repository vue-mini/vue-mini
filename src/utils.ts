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

export function toHiddenField(name: string): string {
  return `__${name}__`
}
