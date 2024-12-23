import type { EffectScope, InjectionKey, Ref } from '@vue-mini/core'
import { inject } from '@vue-mini/core'
import type {
  StateTree,
  PiniaCustomProperties,
  Store,
  _GettersTree,
  _ActionsTree,
  PiniaCustomStateProperties,
  DefineStoreOptionsInPlugin,
  StoreGeneric,
} from './types'
import { _Method } from './types'

export let activePinia: Pinia | undefined

/**
 * Sets or unsets the active pinia. Used in SSR and internally when calling
 * actions and getters
 *
 * @param pinia - Pinia instance
 */
// @ts-expect-error: cannot constrain the type of the return
export const setActivePinia: _SetActivePinia = (pinia) => {
  activePinia = pinia
  return pinia
}

interface _SetActivePinia {
  (pinia: Pinia): Pinia
  (pinia: undefined): undefined
  (pinia: Pinia | undefined): Pinia | undefined
}

/**
 * Get the currently active pinia if there is any.
 */
export const getActivePinia = () => inject(piniaSymbol) || activePinia

/**
 * Every application must own its own pinia to be able to create stores
 */
export interface Pinia {
  /**
   * Root state
   */
  state: Ref<Record<string, StateTree>>

  /**
   * Installed store plugins
   *
   * @internal
   */
  _p: PiniaPlugin[]

  /**
   * Effect scope the pinia is attached to
   *
   * @internal
   */
  _e: EffectScope

  /**
   * Registry of stores used by this pinia.
   *
   * @internal
   */
  _s: Map<string, StoreGeneric>

  /**
   * Adds a store plugin to extend every store
   *
   * @param plugin - store plugin to add
   */
  use(plugin: PiniaPlugin): Pinia
}

export const piniaSymbol = (
  __DEV__ ?
    Symbol('pinia')
    // eslint-disable-next-line symbol-description
  : /* istanbul ignore next */ Symbol()) as InjectionKey<Pinia>

/**
 * Context argument passed to Pinia plugins.
 */
export interface PiniaPluginContext<
  Id extends string = string,
  S extends StateTree = StateTree,
  G /* extends _GettersTree<S> */ = _GettersTree<S>,
  A /* extends _ActionsTree */ = _ActionsTree,
> {
  /**
   * Pinia instance.
   */
  pinia: Pinia

  /**
   * Current store being extended.
   */
  store: Store<Id, S, G, A>

  /**
   * Initial options defining the store when calling `defineStore()`.
   */
  options: DefineStoreOptionsInPlugin<Id, S, G, A>
}

/**
 * Plugin to extend every store. Returns an object to extend the store or
 * nothing.
 *
 * @param context - Context
 */
export type PiniaPlugin = (
  context: PiniaPluginContext,
) => Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void

/**
 * Plugin to extend every store.
 * @deprecated use PiniaPlugin instead
 */
export type PiniaStorePlugin = PiniaPlugin
