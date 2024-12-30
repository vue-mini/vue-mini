import { ref, reactive } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore } from '../src'

describe('store.$patch', () => {
  let pinia: Pinia

  const useStore = defineStore('main', () => {
    const a = ref(true)
    const nested = ref({
      foo: 'foo',
      a: { b: 'string' },
    })
    const list = ref<number[]>([])

    return { a, nested, list }
  })

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('patches a property without touching the rest', () => {
    const store = useStore()
    store.$patch({ a: false })
    expect(store.$state).toEqual({
      a: false,
      nested: {
        foo: 'foo',
        a: { b: 'string' },
      },
      list: [],
    })

    expect(store.a).toBe(false)
  })

  it('replaces whole arrays', () => {
    const store = useStore()
    store.$patch({ list: [1, 2] })
    expect(store.$state.list).toEqual([1, 2])
    expect(store.list).toEqual([1, 2])
  })

  it('can patch an item that has been copied to an array', () => {
    const store = defineStore('main', () => {
      const items = ref([{ id: 0 }])
      const currentItem = ref({ id: 1 })

      return { items, currentItem }
    })()
    store.$state.currentItem = { id: 2 }
    // NOTE: a patch of an object is always recursive, writing in the object, in
    // place.
    store.items.push(store.currentItem)
    store.$state.currentItem = { id: 3 }

    expect(store.$state.items).toEqual([{ id: 0 }, { id: 2 }])
    expect(store.items).toEqual([{ id: 0 }, { id: 2 }])
  })

  it('replaces whole nested arrays', () => {
    const store = useStore()
    // @ts-expect-error: new state
    store.$patch({ nested: { list: [1, 2] } })
    expect(store.$state.nested).toEqual({
      foo: 'foo',
      a: { b: 'string' },
      list: [1, 2],
    })
    // @ts-expect-error: new state
    store.$patch({ nested: { list: [] } })
    expect(store.$state.nested).toEqual({
      foo: 'foo',
      a: { b: 'string' },
      list: [],
    })
  })

  it('patches using a function', () => {
    const store = useStore()
    store.$patch((state) => {
      expect(state).toBe(store.$state)
      state.a = !state.a
      state.list.push(1)
    })
    expect(store.$state).toEqual({
      a: false,
      nested: {
        foo: 'foo',
        a: { b: 'string' },
      },
      list: [1],
    })
  })

  it('patches a nested property without touching the rest', () => {
    const store = useStore()
    store.$patch({ nested: { foo: 'bar' } })
    expect(store.$state).toEqual({
      a: true,
      nested: {
        foo: 'bar',
        a: { b: 'string' },
      },
      list: [],
    })
    store.$patch({ nested: { a: { b: 'hello' } } })
    expect(store.$state).toEqual({
      a: true,
      nested: {
        foo: 'bar',
        a: { b: 'hello' },
      },
      list: [],
    })
  })

  it('patches multiple properties at the same time', () => {
    const store = useStore()
    store.$patch({ a: false, nested: { foo: 'hello' } })
    expect(store.$state).toEqual({
      a: false,
      nested: {
        foo: 'hello',
        a: { b: 'string' },
      },
      list: [],
    })
  })

  describe('skipping nested objects', () => {
    const useStore = defineStore('main', () => {
      const arr = ref<any[]>([])
      const name = ref('Eduardo')
      const item = ref<null | { a: number; b?: number }>({ a: 0, b: 0 })
      return { arr, name, item }
    })

    it('nested ref', () => {
      const store = useStore()
      const item = ref({ nested: { a: 1, b: 1 } })
      const oldItem = store.item
      store.$patch({ item: item.value.nested })
      expect(oldItem).toEqual({ a: 0, b: 0 })
      expect(store.item).toEqual({ a: 1, b: 1 })
    })

    it('reactive', () => {
      const store = useStore()
      const item = reactive({ a: 1, b: 1 })
      const oldItem = store.item
      store.$patch({ item })
      expect(oldItem).toEqual({ a: 0, b: 0 })
      expect(store.item).toEqual({ a: 1, b: 1 })
    })

    it('from store', () => {
      const store = useStore()
      store.arr.push({ a: 1, b: 1 })
      const oldItem = store.item
      store.$patch({ item: store.arr[0] })
      expect(oldItem).toEqual({ a: 0, b: 0 })
      expect(store.item).toEqual({ a: 1, b: 1 })
    })
  })
})
