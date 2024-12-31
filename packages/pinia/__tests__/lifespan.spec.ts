import { watch, ref } from '@vue-mini/core'
import { createPinia, disposePinia, defineStore } from '../src'

describe('store lifespan', () => {
  it('dispose stops store reactivity', () => {
    const pinia = createPinia()
    const inStoreWatch = vi.fn()

    const useStore = defineStore('a', () => {
      const n = ref(0)
      watch(n, inStoreWatch, {
        flush: 'sync',
      })
      return { n }
    })

    const store = useStore()
    store.n++
    expect(inStoreWatch).toHaveBeenCalledTimes(1)

    disposePinia(pinia)
    store.n++
    expect(inStoreWatch).toHaveBeenCalledTimes(1)
  })
})
