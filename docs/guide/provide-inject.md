# 依赖注入

与 Vue 一样，Vue Mini 提供了依赖注入功能，以解决 `props` 深度透传的问题。它们是一对 `provide / inject` 函数，它们的使用方式和 API 与 Vue 基本一致。

::: tip 注意
依赖注入对执行顺序有所要求，`provide` 必须先于 `inject` 执行。由于 `definePage` 的 `setup` 会晚于其子组件的 `setup` 执行，所以请不要在 `definePage` 中调用 `provide`。`defineComponent` 没有这个问题，因此建议使用 `defineComponent` 定义页面。
:::

::: tip 注意
Vue 的依赖注入是与组件树绑定的，但是小程序没有提供可靠的方式获取组件树，所以 Vue Mini 的依赖注入与组件树没有关系，每一项依赖都会被保存到一个全局的单一的仓库中。也就是说依赖项的 `key` 必须是全局唯一的，使用 [Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 作 `key` 可以保证这一点。
:::

## Provide

```js [parent-component.js]
import { defineComponent, ref, provide, readonly } from '@vue-mini/core'

defineComponent({
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    provide('count', readonly(count))
    provide('increment', increment)
  },
})
```

## Inject

```js [deep-child-component.js]
import { defineComponent, inject } from '@vue-mini/core'

defineComponent({
  setup() {
    const count = inject('count')
    const increment = inject('increment')

    return {
      count,
      increment,
    }
  },
})
```

## 删除

由于依赖项被保存在全局仓库中，所以它不会随着组件销毁而被删除回收。在 Vue Mini 1.3+ 中，`provide()` 会返回一个删除函数，调用此函数即可从全局仓库中删除提供的依赖项。删除函数是跟 key 绑定的，与 value 无关。你可以在组件销毁时手动调用，也可以将整个逻辑包装成一个组合函数：

::: code-group

```js [use-provide.js]
import { provide, onDetach } from '@vue-mini/core'

export function useProvide(key, value) {
  const remove = provide(key, value)

  onDetach(() => {
    remove()
  })

  return remove
}
```

```ts [use-provide.ts]
import type { InjectionKey } from '@vue-mini/core'
import { provide, onDetach } from '@vue-mini/core'

export function useProvide<T, K = InjectionKey<T> | string>(
  key: K,
  value: K extends InjectionKey<infer V> ? V : T,
): () => void {
  const remove = provide(key, value)

  onDetach(() => {
    remove()
  })

  return remove
}
```

:::

## 限制

基于单一全局仓库的依赖注入模型，存在着一定的限制。当提供组件（即调用 `provide()` 的组件）在一个页面存在多个实例时，或者提供组件同时在多个 Active 页面使用时，提供组件的各实例之间可能会互相覆盖，因为它们共享同一个 `key`。也就是说提供组件在同一时间只能有一个实例。
