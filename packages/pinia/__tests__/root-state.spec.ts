import { ref } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore } from '../src'

describe('Root State', () => {
  let pinia: Pinia

  const useA = defineStore('a', () => {
    const a = ref('a')
    return { a }
  })

  const useB = defineStore('b', () => {
    const b = ref('b')
    return { b }
  })

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('works with no stores', () => {
    expect(pinia.state.value).toEqual({})
  })

  it('retrieves the root state of one store', () => {
    useA()
    expect(pinia.state.value).toEqual({
      a: { a: 'a' },
    })
  })

  it('can hold multiple stores', () => {
    useA()
    useB()
    expect(pinia.state.value).toEqual({
      a: { a: 'a' },
      b: { b: 'b' },
    })
  })
})
