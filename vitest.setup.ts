import type { MockInstance } from 'vitest'

interface CustomMatchers<R = unknown> {
  toHaveBeenWarned: () => R
  toHaveBeenWarnedLast: () => R
  toHaveBeenWarnedTimes: (n: number) => R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toHaveBeenWarned(received: string) {
    const passed = warn.mock.calls.some((args) => args[0].includes(received))
    if (passed) {
      asserted.add(received)
      return {
        pass: true,
        message: () => `expected "${received}" not to have been warned.`,
      }
    }

    const msgs = warn.mock.calls.map((args) => args[0]).join('\n - ')
    return {
      pass: false,
      message: () =>
        `expected "${received}" to have been warned` +
        (msgs.length > 0 ?
          `.\n\nActual messages:\n\n - ${msgs}`
        : ` but no warning was recorded.`),
    }
  },

  toHaveBeenWarnedLast(received: string) {
    // @ts-expect-error
    const passed = warn.mock.calls.at(-1)![0].includes(received)
    if (passed) {
      asserted.add(received)
      return {
        pass: true,
        message: () => `expected "${received}" not to have been warned last.`,
      }
    }

    const msgs = warn.mock.calls.map((args) => args[0]).join('\n - ')
    return {
      pass: false,
      message: () =>
        `expected "${received}" to have been warned last.\n\nActual messages:\n\n - ${msgs}`,
    }
  },

  toHaveBeenWarnedTimes(received: string, n: number) {
    let found = 0
    warn.mock.calls.forEach((args) => {
      if (args[0].includes(received)) {
        found++
      }
    })

    if (found === n) {
      asserted.add(received)
      return {
        pass: true,
        message: () => `expected "${received}" to have been warned ${n} times.`,
      }
    }

    return {
      pass: false,
      message: () =>
        `expected "${received}" to have been warned ${n} times but got ${found}.`,
    }
  },
})

let warn: MockInstance
const asserted = new Set<string>()

beforeEach(() => {
  asserted.clear()
  warn = vi.spyOn(console, 'warn')
  warn.mockImplementation(() => {})
})

afterEach(() => {
  const assertedArray = [...asserted]
  const nonAssertedWarnings = warn.mock.calls
    .map((args) => args[0])
    .filter(
      (received: string) =>
        !assertedArray.some((assertedMsg) => received.includes(assertedMsg)),
    )
  warn.mockRestore()
  if (nonAssertedWarnings.length > 0) {
    throw new Error(
      `test case threw unexpected warnings:\n - ${nonAssertedWarnings.join(
        '\n - ',
      )}`,
    )
  }
})
