import type { EffectScope } from '../src'
import { ReactiveEffect } from '../src'

export function getEffectsCount(scope: EffectScope): number {
  let n = 0
  for (let dep = scope.deps; dep !== undefined; dep = dep.nextDep) {
    if (dep.dep instanceof ReactiveEffect) {
      n++
    }
  }
  return n
}
