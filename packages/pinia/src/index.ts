/**
 * @module pinia
 */
export { createPinia, disposePinia } from './create-pinia'
export type { Pinia, PiniaPlugin, PiniaPluginContext } from './root-store'

export { defineStore } from './store'
export type {
  StoreActions,
  StoreGetters,
  StoreState,
  SetupStoreDefinition,
} from './store'

export type {
  StateTree,
  Store,
  StoreGeneric,
  StoreDefinition,
  _StoreWithGetters,
  _GettersTree,
  _ActionsTree,
  _Method,
  _StoreWithState,
  StoreProperties,
  StoreOnActionListener,
  _StoreOnActionListenerContext,
  StoreOnActionListenerContext,
  SubscriptionCallback,
  SubscriptionCallbackMutation,
  SubscriptionCallbackMutationDirect,
  SubscriptionCallbackMutationPatchFunction,
  SubscriptionCallbackMutationPatchObject,
  _SubscriptionCallbackMutationBase,
  PiniaCustomProperties,
  PiniaCustomStateProperties,
  DefineStoreOptionsBase,
  DefineStoreOptions,
  DefineSetupStoreOptions,
  DefineStoreOptionsInPlugin,
  _ExtractActionsFromSetupStore,
  _ExtractGettersFromSetupStore,
  _ExtractStateFromSetupStore,
  _DeepPartial,
  _ExtractActionsFromSetupStore_Keys,
  _ExtractGettersFromSetupStore_Keys,
  _ExtractStateFromSetupStore_Keys,
  _UnwrapAll,
} from './types'
export { MutationType } from './types'

export { storeToRefs } from './store-to-refs'
