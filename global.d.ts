// Global compile-time constants
declare const __DEV__: boolean

declare namespace jest {
  // eslint-disable-next-line @typescript-eslint/generic-type-naming
  interface Matchers<R, T> {
    toHaveBeenWarned(): R
    toHaveBeenWarnedLast(): R
    toHaveBeenWarnedTimes(n: number): R
  }
}
