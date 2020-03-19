import {
  computed as _computed,
  ComputedRef,
  WritableComputedOptions,
  ReactiveEffect,
  WritableComputedRef,
  ComputedGetter
} from '@vue/reactivity'
import { getCurrentInstance } from './instance'

// Record effects created during a component's setup() so that they can be
// stopped when the component unmounts
export function recordInstanceBoundEffect(effect: ReactiveEffect): void {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    ;(currentInstance.__effects__ || (currentInstance.__effects__ = [])).push(
      effect
    )
  }
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T>
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  const c = _computed(getterOrOptions as any)
  recordInstanceBoundEffect(c.effect)
  return c
}
