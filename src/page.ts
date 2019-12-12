import { Page, deepWatch } from './shared'
import { isPlainObject, isFunction } from './utils'

type Query = Record<string, string | undefined>
interface Context {
  route: string
}
type Setup = (query: Query, context: Context) => Record<string, unknown>
interface Options {
  [key: string]: unknown
  setup?: Setup
  onLoad?: (this: Page, query?: Query) => void
}
interface PageOptions {
  [key: string]: unknown
  onLoad?: (this: Page, query: Query) => void
}

export function createPage(
  optionsOrSetup?: Options | Setup
): PageOptions | void {
  if (optionsOrSetup === undefined) {
    return
  }

  if (!isPlainObject(optionsOrSetup) && !isFunction(optionsOrSetup)) {
    console.warn(
      'The "createPage" function only accept an object or a function as parameter'
    )
    return
  }

  let setup: Setup
  let pageOptions: PageOptions
  if (isPlainObject(optionsOrSetup)) {
    const options = optionsOrSetup
    if (options.setup === undefined) {
      return options
    }

    if (!isFunction(options.setup)) {
      console.warn('The "setup" option must be a function')
      return options
    }

    const { setup: setupOption, ...restOptions } = options
    setup = setupOption
    pageOptions = restOptions
  } else {
    setup = optionsOrSetup
    pageOptions = {}
  }

  const prevOnLoad = pageOptions.onLoad
  if (prevOnLoad !== undefined && !isFunction(prevOnLoad)) {
    console.warn('The "onLoad" option must be a function')
  }

  pageOptions.onLoad = function(this: Page, query: Query) {
    const context: Context = { route: this.route }
    const binding = setup(query, context)
    if (binding !== undefined && isPlainObject(binding)) {
      Object.keys(binding).forEach(key => {
        const value = binding[key]
        if (isFunction(value)) {
          this[key] = value
          return
        }

        deepWatch.call(this, key, binding[key])
      })
    } else if (binding !== undefined) {
      console.warn('The "setup" function must return an object')
    }

    if (isFunction(prevOnLoad)) {
      prevOnLoad.call(this, query)
    }
  }

  return pageOptions
}
