import type { Ref } from '@vue-mini/core'
import { ref, effectScope, provide } from '@vue-mini/core'
import type { StateTree, StoreGeneric } from './types'
import type { Pinia } from './root-store'
import { piniaSymbol } from './root-store'

/**
 * Creates a Pinia instance to be used by the application
 */
export function createPinia(): Pinia {
  const scope = effectScope(true)
  const state = scope.run<Ref<Record<string, StateTree>>>(() =>
    ref<Record<string, StateTree>>({}),
  )!

  const _p: Pinia['_p'] = []

  const pinia: Pinia = {
    use(plugin) {
      _p.push(plugin)
      return this
    },

    _p,
    _e: scope,
    _s: new Map<string, StoreGeneric>(),
    state,
  }

  provide(piniaSymbol, pinia)

  return pinia
}

/**
 * Dispose a Pinia instance by stopping its effectScope and removing the state, plugins and stores. This is mostly
 * useful in tests, with both a testing pinia or a regular pinia and in applications that use multiple pinia instances.
 * Once disposed, the pinia instance cannot be used anymore.
 *
 * @param pinia - pinia instance
 */
export function disposePinia(pinia: Pinia) {
  pinia._e.stop()
  pinia._s.clear()
  pinia._p.splice(0)
  pinia.state.value = {}
}
