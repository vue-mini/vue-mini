import { deepToRaw, deepWatch } from './shared'
import { isPlainObject, isFunction } from './utils'

interface Options {
  [key: string]: unknown
  data?: Record<string, unknown>
  setup?: () => Record<string, unknown>
  onReady?: () => void
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function createPage(options?: Options): Omit<Options, 'setup'> | void {
  if (options === undefined) {
    return
  }

  if (!isPlainObject(options)) {
    console.warn('The "createPage" function only accept an object as parameter')
    return
  }

  const { setup, ...restOptions } = options
  if (setup === undefined) {
    return restOptions
  }

  if (!isFunction(setup)) {
    console.warn('The "setup" option must be a function')
    return restOptions
  }

  const binding = setup()
  if (binding === undefined) {
    return restOptions
  }

  if (!isPlainObject(binding)) {
    console.warn('The "setup" function must return an object')
    return restOptions
  }

  const newOptions = { ...restOptions }
  Object.keys(binding).forEach(key => {
    const value = binding[key]
    if (typeof value === 'function') {
      newOptions[key] = value
      return
    }

    if (newOptions.data === undefined || !isPlainObject(newOptions.data)) {
      newOptions.data = {}
      if (newOptions.data !== undefined) {
        console.warn('The "data" option must be a object')
      }
    }

    newOptions.data[key] = deepToRaw(value)
  })
  if (restOptions.onReady !== undefined && !isFunction(restOptions.onReady)) {
    console.warn('The "onReady" hook must be a function')
  }

  newOptions.onReady = function(): void {
    Object.keys(binding).forEach(key => {
      Reflect.apply(deepWatch, this, [key, binding[key]])
    })
    if (isFunction(restOptions.onReady)) {
      restOptions.onReady.call(this)
    }
  }

  return newOptions
}
