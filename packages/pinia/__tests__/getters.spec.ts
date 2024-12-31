import { ref, computed } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore } from '../src'

// eslint-disable-next-line @typescript-eslint/no-empty-function
function expectType<T>(_value: T): void {}

describe('getters', () => {
  let pinia: Pinia

  const useStore = defineStore('main', () => {
    const name = ref('Eduardo')
    const upperCaseName = computed(() => name.value.toUpperCase())
    const doubleName = computed(() => upperCaseName.value)
    const composed = computed(() => upperCaseName.value + ': ok')
    return { name, upperCaseName, doubleName, composed }
  })

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('adds getters to the store', () => {
    const store = useStore()
    expect(store.upperCaseName).toBe('EDUARDO')

    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.nope

    store.name = 'Ed'
    expect(store.upperCaseName).toBe('ED')
  })

  it('updates the value', () => {
    const store = useStore()
    store.name = 'Ed'
    expect(store.upperCaseName).toBe('ED')
  })

  it('can use other getters', () => {
    const store = useStore()
    expect(store.composed).toBe('EDUARDO: ok')
    store.name = 'Ed'
    expect(store.composed).toBe('ED: ok')
  })

  it('can use getters with setters', () => {
    const useStore = defineStore('main', () => {
      const name = ref('Eduardo')
      const upperCaseName = computed({
        get() {
          return name.value.toUpperCase()
        },
        set(value: string) {
          store.name = value.toLowerCase()
        },
      })
      return { name, upperCaseName }
    })

    const store = useStore()
    expect(store.upperCaseName).toBe('EDUARDO')
    store.upperCaseName = 'ED'
    expect(store.name).toBe('ed')
  })

  it('can use getters with setters with different types', () => {
    const useStore = defineStore('main', () => {
      const n = ref(0)
      const double = computed({
        get() {
          return n.value * 2
        },
        set(value: string | number) {
          n.value =
            (typeof value === 'string' ?
              Number.parseInt(value, 10) || 0
            : value) / 2
        },
      })
      return { n, double }
    })

    const store = useStore()
    expect(store.$state).not.toHaveProperty('double')
    store.double = 4
    expect(store.n).toBe(2)
    // @ts-expect-error: still not doable
    store.double = '6'
    expect(store.n).toBe(3)
  })

  describe('cross used stores', () => {
    const useA = defineStore('a', () => {
      const B = useB()

      const n = ref(0)
      const double = computed(() => n.value * 2)
      const sum = computed(() => n.value + B.n)

      function increment() {
        return n.value++
      }

      function incrementB() {
        return B.increment()
      }

      return { n, double, sum, increment, incrementB }
    })

    const useB = defineStore('b', () => {
      const A = useA()

      const n = ref(0)
      const double = computed(() => n.value * 2)

      function increment() {
        return n.value++
      }

      function incrementA() {
        return A.increment()
      }

      return { n, double, incrementA, increment }
    })

    it('keeps getters reactive', () => {
      const a = useA()
      const b = useB()

      expectType<() => number>(a.increment)
      expectType<() => number>(b.increment)
      expectType<() => number>(a.incrementB)
      expectType<() => number>(b.incrementA)

      expect(a.double).toBe(0)
      b.incrementA()
      expect(a.double).toBe(2)
      a.increment()
      expect(a.double).toBe(4)

      expect(b.double).toBe(0)
      a.incrementB()
      expect(b.double).toBe(2)
      b.increment()
      expect(b.double).toBe(4)
    })
  })
})
