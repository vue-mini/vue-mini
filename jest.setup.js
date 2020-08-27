/* eslint-env jest */
expect.extend({
  toHaveBeenWarned(received) {
    asserted.add(received)
    const passed = warn.mock.calls.some((args) => args[0].includes(received))
    if (passed) {
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
        (msgs.length > 0
          ? `.\n\nActual messages:\n\n - ${msgs}`
          : ` but no warning was recorded.`),
    }
  },

  toHaveBeenWarnedLast(received) {
    asserted.add(received)
    const passed = warn.mock.calls[warn.mock.calls.length - 1][0].includes(
      received
    )
    if (passed) {
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

  toHaveBeenWarnedTimes(received, n) {
    asserted.add(received)
    let found = 0
    warn.mock.calls.forEach((args) => {
      if (args[0].includes(received)) {
        found++
      }
    })

    if (found === n) {
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

let warn
const asserted = new Set()

beforeEach(() => {
  asserted.clear()
  warn = jest.spyOn(console, 'warn')
  warn.mockImplementation(() => {})
})

afterEach(() => {
  const assertedArray = [...asserted]
  const nonAssertedWarnings = warn.mock.calls
    .map((args) => args[0])
    .filter((received) => {
      return !assertedArray.some((assertedMessage) => {
        return received.includes(assertedMessage)
      })
    })
  warn.mockRestore()
  if (nonAssertedWarnings.length > 0) {
    throw new Error(
      `test case threw unexpected warnings:\n - ${nonAssertedWarnings.join(
        '\n - '
      )}`
    )
  }
})
