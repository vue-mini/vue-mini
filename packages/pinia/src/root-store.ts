import type { EffectScope, InjectionKey, Ref } from '@vue-mini/core'
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
  : /* istanbul ignore next -- @preserve */ Symbol()) as InjectionKey<Pinia>

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
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
) => Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void
