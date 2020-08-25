// Global compile-time constants
declare const __DEV__: boolean

// For tests
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned: () => R
    toHaveBeenWarnedLast: () => R
    toHaveBeenWarnedTimes: (n: number) => R
  }
}
