declare global {
  // eslint-disable-next-line no-redeclare
  namespace jest {
    interface Matchers<R, T> {
      toHaveBeenWarned(): R
      toHaveBeenWarnedLast(): R
      toHaveBeenWarnedTimes(n: number): R
    }
  }
}

export function mockWarn(): void {
  expect.extend({
    toHaveBeenWarned(received: string) {
      asserted.add(received)
      const passed = warn.mock.calls.some(
        args => args[0].indexOf(received) > -1
      )
      if (passed) {
        return {
          pass: true,
          message: () => `expected "${received}" not to have been warned.`
        }
      }

      const msgs = warn.mock.calls.map(args => args[0]).join('\n - ')
      return {
        pass: false,
        message: () =>
          `expected "${received}" to have been warned.\n\nActual messages:\n\n - ${msgs}`
      }
    },

    toHaveBeenWarnedLast(received: string) {
      asserted.add(received)
      const passed =
        warn.mock.calls[warn.mock.calls.length - 1][0].indexOf(received) > -1
      if (passed) {
        return {
          pass: true,
          message: () => `expected "${received}" not to have been warned last.`
        }
      }

      const msgs = warn.mock.calls.map(args => args[0]).join('\n - ')
      return {
        pass: false,
        message: () =>
          `expected "${received}" to have been warned last.\n\nActual messages:\n\n - ${msgs}`
      }
    },

    toHaveBeenWarnedTimes(received: string, n: number) {
      asserted.add(received)
      let found = 0
      warn.mock.calls.forEach(args => {
        if (args[0].indexOf(received) > -1) {
          found++
        }
      })

      if (found === n) {
        return {
          pass: true,
          message: () =>
            `expected "${received}" to have been warned ${n} times.`
        }
      }

      return {
        pass: false,
        message: () =>
          `expected "${received}" to have been warned ${n} times but got ${found}.`
      }
    }
  })

  let warn: jest.SpyInstance
  const asserted: Set<string> = new Set()

  beforeEach(() => {
    asserted.clear()
    warn = jest.spyOn(console, 'warn')
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    warn.mockImplementation(() => {})
  })

  afterEach(() => {
    const assertedArray = [...asserted]
    const nonAssertedWarnings = warn.mock.calls
      .map(args => args[0])
      .filter(received => {
        return !assertedArray.some(assertedMsg => {
          return received.indexOf(assertedMsg) > -1
        })
      })
    warn.mockRestore()
    if (nonAssertedWarnings.length > 0) {
      nonAssertedWarnings.forEach(warning => {
        console.warn(warning)
      })
      throw new Error(`test case threw unexpected warnings.`)
    }
  })
}
