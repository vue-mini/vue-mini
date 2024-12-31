import { ref, nextTick } from '@vue-mini/core'
import type { Pinia } from '../src'
import { createPinia, disposePinia, defineStore } from '../src'

describe('on action', () => {
  let pinia: Pinia

  const useStore = defineStore('main', () => {
    const user = ref('Eduardo')

    const direct = (name: string) => {
      user.value = name
    }

    const asyncUpperName = async () => user.value.toUpperCase()

    const upperName = () => user.value.toUpperCase()

    const throws = (e: any) => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw e
    }

    const rejects = async (e: any) => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw e
    }

    return {
      user,
      direct,
      asyncUpperName,
      upperName,
      throws,
      rejects,
    }
  })

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    disposePinia(pinia)
  })

  it('fires callback when action is called', () => {
    const store = useStore()
    const spy = vi.fn()
    store.$onAction(spy)
    store.direct('Cleiton')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'direct',
        args: ['Cleiton'],
        store,
      }),
    )
  })

  it('removes the callback when unsubscribe is called', () => {
    const store = useStore()
    const spy = vi.fn()
    const unsubscribe = store.$onAction(spy)
    unsubscribe()
    store.direct('Cleiton')
    expect(spy).not.toHaveBeenCalled()
  })

  it('can register multiple onAction', async () => {
    const store = useStore()
    const spy1 = vi.fn()
    const spy2 = vi.fn()
    store.$onAction(({ after }) => {
      after(spy1)
    })
    store.$onAction(({ after }) => {
      after(spy2)
    })

    await expect(store.asyncUpperName()).resolves.toBe('EDUARDO')
    expect(spy2).toHaveBeenCalledTimes(1)
    expect(spy1).toHaveBeenCalledTimes(1)
  })

  it('calls after with the returned value', async () => {
    const store = useStore()
    const spy = vi.fn()
    // Cannot destructure because of https://github.com/microsoft/TypeScript/issues/38020
    store.$onAction((context) => {
      if (context.name === 'upperName') {
        context.after((ret) => {
          // @ts-expect-error
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          ret * 2
          ret.toUpperCase()
        })
      }

      context.after(spy)
    })
    expect(store.upperName()).toBe('EDUARDO')
    await nextTick()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('EDUARDO')
  })

  it('calls after with the resolved value', async () => {
    const store = useStore()
    const spy = vi.fn()
    store.$onAction(({ after }) => {
      after(spy)
    })
    await expect(store.asyncUpperName()).resolves.toBe('EDUARDO')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('EDUARDO')
  })

  it('calls onError when it throws', () => {
    const store = useStore()
    const spy = vi.fn()
    store.$onAction(({ onError }) => {
      onError(spy)
    })
    expect(() => store.throws('fail')).toThrow()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('fail')
  })

  it('calls onError when it rejects', async () => {
    const store = useStore()
    const spy = vi.fn()
    expect.assertions(3)
    store.$onAction(({ onError }) => {
      onError(spy)
    })
    await expect(store.rejects('fail')).rejects.toBe('fail')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('fail')
  })

  it('listeners are not affected when unsubscribe is called multiple times', () => {
    const store = useStore()
    const func1 = vi.fn()
    const func2 = vi.fn()
    const unsubscribe1 = store.$onAction(func1)
    store.$onAction(func2)
    unsubscribe1()
    unsubscribe1()
    store.direct('Cleiton')
    expect(func1).not.toHaveBeenCalled()
    expect(func2).toHaveBeenCalledTimes(1)
  })

  it('can listen to setup actions within other actions thanks to `action`', () => {
    const store = defineStore('id', ({ action }) => {
      const a1 = action(() => 1)
      const a2 = action(() => a1() * 2)
      return { a1, a2 }
    })()
    const spy = vi.fn()
    store.$onAction(spy)
    store.a1()
    expect(spy).toHaveBeenCalledTimes(1)

    store.a2()
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ name: 'a2' }),
    )
    expect(spy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ name: 'a1' }),
    )
  })

  describe('multiple store instances', () => {
    const useStore = defineStore('main', () => {
      const name = ref('Eduardo')

      const changeName = (newName: string) => {
        name.value = newName
      }

      return {
        name,
        changeName,
      }
    })

    it('triggers subscribe only once', async () => {
      const s1 = useStore()
      const s2 = useStore()

      expect(s2).toBe(s1)

      const spy1 = vi.fn()
      const spy2 = vi.fn()

      s1.$onAction(spy1)
      s2.$onAction(spy2)

      expect(spy1).toHaveBeenCalledTimes(0)
      expect(spy2).toHaveBeenCalledTimes(0)

      s1.changeName('Edu')

      expect(spy1).toHaveBeenCalledTimes(1)
      expect(spy2).toHaveBeenCalledTimes(1)
    })
  })
})
