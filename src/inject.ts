const provides = Object.create(null)

// @ts-ignore
export interface InjectionKey<T> extends Symbol {}

export function provide<T>(key: InjectionKey<T> | string, value: T): void {
  // TS doesn't allow symbol as index type
  provides[key as string] = value
}

export function inject<T>(key: InjectionKey<T> | string): T | undefined
export function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T
export function inject(
  key: InjectionKey<any> | string,
  defaultValue?: unknown
): unknown {
  if (key in provides) {
    // TS doesn't allow symbol as index type
    return provides[key as string]
  }

  if (defaultValue !== undefined) {
    return defaultValue
  }
  /* istanbul ignore else  */

  if (__DEV__) {
    console.warn(`injection "${String(key)}" not found.`)
  }
}
