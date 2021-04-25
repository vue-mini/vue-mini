import { isFunction } from './utils'

const provides = Object.create(null)

// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface InjectionKey<T> extends Symbol {}

export function provide<T>(key: InjectionKey<T> | string, value: T): void {
  // TS doesn't allow symbol as index type
  provides[key as string] = value
}

export function inject<T>(key: InjectionKey<T> | string): T | undefined
export function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: T,
  treatDefaultAsFactory?: false
): T
export function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: T | (() => T),
  treatDefaultAsFactory: true
): T
export function inject(
  key: InjectionKey<any> | string,
  defaultValue?: unknown,
  treatDefaultAsFactory = false
): unknown {
  if ((key as string | symbol) in provides) {
    // TS doesn't allow symbol as index type
    return provides[key as string]
  }

  if (arguments.length > 1) {
    return treatDefaultAsFactory && isFunction(defaultValue)
      ? defaultValue()
      : defaultValue
  }

  /* istanbul ignore else */
  if (__DEV__) {
    console.warn(`injection "${String(key)}" not found.`)
  }
}
