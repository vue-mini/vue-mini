import { getCurrentScope, onScopeDispose } from '@vue-mini/core'
import type { _Method } from './types'

export function addSubscription<T extends _Method>(
  subscriptions: T[],
  callback: T,
  detached?: boolean,
  onCleanup = (): void => {},
): () => void {
  subscriptions.push(callback)

  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback)
    if (idx !== -1) {
      subscriptions.splice(idx, 1)
      onCleanup()
    }
  }

  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription)
  }

  return removeSubscription
}

export function triggerSubscriptions<T extends _Method>(
  subscriptions: T[],
  ...args: Parameters<T>
): void {
  ;[...subscriptions].forEach((callback) => {
    callback(...args)
  })
}
