import { computed, nextTick, ref, watch } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore } from '../src'

describe('state', () => {
  let pinia: Pinia

  const useStore = defineStore('main', () => {
    const name = ref('Eduardo')
    const counter = ref(0)
    const nested = ref({ n: 0 })
    return { name, counter, nested }
  })

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('can directly access state at the store level', () => {
    const store = useStore()
    expect(store.name).toBe('Eduardo')
    store.name = 'Ed'
    expect(store.name).toBe('Ed')
  })

  it('state is reactive', () => {
    const store = useStore()
    const upperCased = computed(() => store.name.toUpperCase())
    expect(upperCased.value).toBe('EDUARDO')
    store.name = 'Ed'
    expect(upperCased.value).toBe('ED')
  })

  it('can be set with patch', () => {
    const store = useStore()

    store.$patch({ name: 'a' })

    expect(store.name).toBe('a')
    expect(store.$state.name).toBe('a')
    expect(pinia.state.value.main.name).toBe('a')
  })

  it('can be set on store', () => {
    const store = useStore()

    store.name = 'a'

    expect(store.name).toBe('a')
    expect(store.$state.name).toBe('a')
    expect(pinia.state.value.main.name).toBe('a')
  })

  it('can be set on store.$state', () => {
    const store = useStore()

    store.$state.name = 'a'

    expect(store.name).toBe('a')
    expect(store.$state.name).toBe('a')
    expect(pinia.state.value.main.name).toBe('a')
  })

  it('can be nested set with patch', () => {
    const store = useStore()

    store.$patch({ nested: { n: 3 } })

    expect(store.nested.n).toBe(3)
    expect(store.$state.nested.n).toBe(3)
    expect(pinia.state.value.main.nested.n).toBe(3)
  })

  it('can be nested set on store', () => {
    const store = useStore()

    store.nested.n = 3

    expect(store.nested.n).toBe(3)
    expect(store.$state.nested.n).toBe(3)
    expect(pinia.state.value.main.nested.n).toBe(3)
  })

  it('can be nested set on store.$state', () => {
    const store = useStore()

    store.$state.nested.n = 3

    expect(store.nested.n).toBe(3)
    expect(store.$state.nested.n).toBe(3)
    expect(pinia.state.value.main.nested.n).toBe(3)
  })

  it('state can be watched', async () => {
    const store = useStore()
    const spy = vi.fn()
    watch(() => store.name, spy)
    expect(spy).not.toHaveBeenCalled()
    store.name = 'Ed'
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('unwraps refs', () => {
    const name = ref('Eduardo')
    const counter = ref(0)

    const useStore = defineStore('main', () => ({ name, counter }))

    const store = useStore()

    expect(store.name).toBe('Eduardo')
    expect(store.$state.name).toBe('Eduardo')
    expect(pinia.state.value.main).toEqual({
      name: 'Eduardo',
      counter: 0,
    })

    name.value = 'Ed'
    expect(store.name).toBe('Ed')
    expect(store.$state.name).toBe('Ed')
    expect(pinia.state.value.main.name).toBe('Ed')

    store.name = 'Edu'
    expect(store.name).toBe('Edu')

    store.$patch({ counter: 2 })
    expect(store.counter).toBe(2)
    expect(counter.value).toBe(2)
  })
})
