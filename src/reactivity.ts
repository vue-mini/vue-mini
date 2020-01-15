export {
  ref,
  isRef,
  toRefs,
  reactive,
  isReactive,
  readonly,
  isReadonly,
  toRaw,
  markReadonly,
  markNonReactive,
  effect,
  ReactiveEffect,
  ReactiveEffectOptions,
  DebuggerEvent,
  TrackOpTypes,
  TriggerOpTypes,
  Ref,
  ComputedRef,
  UnwrapRef,
  WritableComputedOptions
} from '@next-vue/reactivity'

import {
  computed as _computed,
  ComputedRef,
  WritableComputedOptions,
  ReactiveEffect,
  WritableComputedRef,
  ComputedGetter
} from '@next-vue/reactivity'

import { getCurrentInstance } from './instance'

// Record effects created during a component's setup() so that they can be
// stopped when the component unmounts
export function recordEffect(effect: ReactiveEffect): void {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    ;(currentInstance._effects || (currentInstance._effects = [])).push(effect)
  }
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(
  options: WritableComputedOptions<T>
): WritableComputedRef<T>
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
): ComputedRef<T> | WritableComputedRef<T> {
  const c = _computed(getterOrOptions as any)
  recordEffect(c.effect)
  return c as any
}