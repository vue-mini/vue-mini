# Pinia

[Pinia](https://pinia.vuejs.org/zh/) 是 Vue.js 的官方状态管理库。Vue Mini 将其移植了过来，移植版本与官方版本有着一模一样的 API 和能力，但是也有一些差异。关于 Pinia 的具体使用方式以及 API 请参考 Pinia 官方文档，这篇文档只会着重说明二者的不同之处。

## 安装

::: code-group

```sh [npm]
$ npm install @vue-mini/pinia
```

```sh [pnpm]
$ pnpm install @vue-mini/pinia
```

```sh [yarn]
$ yarn add @vue-mini/pinia
```

```sh [bun]
$ bun add @vue-mini/pinia
```

:::

## 初始化

```js [pinia.js]
import { createPinia } from '@vue-mini/pinia'

export const pinia = createPinia()
```

```js [app.js]
import { createApp } from '@vue-mini/core'
import './pinia'

createApp(() => {
  // ...
})
```

在 Vue.js 中初始化 Pinia 你需要将 Pinia 实例作为插件传递给 Vue.js 的 App 实例，也就是：`app.use(pinia)`，在 Vue Mini 中没有这个步骤。

## 定义 Store

```js
import { ref, computed } from '@vue-mini/core'
import { defineStore } from '@vue-mini/pinia'

export const useStore = defineStore('main', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  const increment = () => {
    count.value++
  }
  return { count, double, increment }
})
```

`@vue-mini/pinia` 仅支持 Setup Store，**不支持** Option Store。又因为 Store 实例的 `$reset` 方法仅针对 Option Store 有效，所以 `@vue-mini/pinia` 的 Store 实例没有 `$reset` 方法。如果你有需要可以自行实现：

```js
import { ref, computed } from '@vue-mini/core'
import { defineStore } from '@vue-mini/pinia'

export const useStore = defineStore('main', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  const increment = () => {
    count.value++
  }
  const $reset = () => {
    count.value = 0
  }
  return { count, double, increment, $reset }
})
```

## 使用 Store

```js
import { defineComponent } from '@vue-mini/core'
import { storeToRefs } from '@vue-mini/pinia'
import { useStore } from '../../store'

defineComponent(() => {
  const store = useStore()
  const { increment } = store
  const { count, double } = storeToRefs(store)

  // 不可以这样写：
  // return { store }

  // 也不可以这样写（会丢失响应性）：
  // const { count, double } = store
  // return { count, double }
  // 或者：
  // return { count: store.count, double: store.double }

  return {
    count,
    double,
    increment,
  }
})
```

在 Vue.js 中你可以将整个 store 暴露给模版，然后在模版中使用 `store.xxx`，这很方便。但是很遗憾在小程序中你不能这样干，这是因为小程序模版运行在一个独立的线程中，与 JS 并不共享同一个上下文。所以你需要逐个的将 store 的状态和方法暴露给小程序模板。

然后因为从 store 中获取原始值会导致响应性丢失，所以你需要使用 `storeToRefs()` 以保留响应性，如上面的代码所示。

## 插件

`@vue-mini/pinia` 也支持自定义插件，插件的编写和使用与 Pinia 一样。你可以根据需要编写自己的插件，或者选择已有的插件使用。例如我写了一个状态持久化插件：[pinia-mini-plugin-persistor](https://github.com/yangmingshan/pinia-mini-plugin-persistor)，使用这个插件可以自动的持久化存储并恢复 Store 状态。

```js
import { ref, computed } from '@vue-mini/core'
import { createPinia } from '@vue-mini/pinia'
import persistor from 'pinia-mini-plugin-persistor'

export const pinia = createPinia()

pinia.use(persistor)

export const useStore = defineStore(
  'main',
  () => {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    const increment = () => {
      count.value++
    }
    return { count, double, increment }
  },
  {
    persist: true,
  },
)
```
