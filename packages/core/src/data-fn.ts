import type { Ref } from '@vue/reactivity'
import { ref, ReactiveEffect, EffectFlags } from '@vue/reactivity'
import { queueJob } from './scheduler'

export function dataFn<T extends (...args: any[]) => any>(fn: T): Ref<T> {
  let initialArgs: any[] | undefined
  const effect = new ReactiveEffect(() => fn(...initialArgs!))

  const fnRef = ref((...args: any[]) => {
    if (!initialArgs) {
      initialArgs = args
      return effect.run()
    }

    return fn(...args)
  })

  const job = () => {
    /* istanbul ignore else -- @preserve */
    if (effect.dirty) {
      // Reset flags
      effect.run()
      fnRef.value = (...args: any[]) => fn(...args)
    }
  }

  effect.notify = () => {
    /* istanbul ignore else -- @preserve */
    if (!(effect.flags & EffectFlags.PAUSED)) {
      queueJob(job)
    }
  }

  return fnRef as Ref<T>
}
