import { getCurrentScope, onScopeDispose } from '@vue-mini/core'
import type { _Method } from './types'

export function addSubscription<T extends _Method>(
  subscriptions: Set<T>,
  callback: T,
  detached?: boolean,
  onCleanup = (): void => {},
): () => void {
  subscriptions.add(callback)

  const removeSubscription = () => {
    const isDel = subscriptions.delete(callback)
    if (isDel) {
      onCleanup()
    }
  }

  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription)
  }

  return removeSubscription
}

export function triggerSubscriptions<T extends _Method>(
  subscriptions: Set<T>,
  ...args: Parameters<T>
): void {
  subscriptions.forEach((callback) => {
    callback(...args)
  })
}
