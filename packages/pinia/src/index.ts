/**
 * @module pinia
 */
export { createPinia, disposePinia } from './create-pinia'
export { defineStore } from './store'
export { storeToRefs } from './store-to-refs'

export { MutationType } from './types'

export type { Pinia, PiniaPlugin, PiniaPluginContext } from './root-store'
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
  StoreProperties,
  StoreOnActionListener,
  StoreOnActionListenerContext,
  SubscriptionCallback,
  SubscriptionCallbackMutation,
  SubscriptionCallbackMutationDirect,
  SubscriptionCallbackMutationPatchFunction,
  SubscriptionCallbackMutationPatchObject,
  PiniaCustomProperties,
  PiniaCustomStateProperties,
  DefineStoreOptionsBase,
  DefineSetupStoreOptions,
  DefineStoreOptionsInPlugin,
} from './types'
