# 定义组件

小程序中的每个组件都需要在对应的 js 文件中使用 `defineComponent` 函数进行定义。它是 `Component` 函数的超集，它额外接收一个 `setup` 函数。

```js
// component.js
import { defineComponent, reactive, computed } from '@vue-mini/wechat'

defineComponent({
  setup() {
    const state = reactive({
      count: 0,
      double: computed(() => state.count * 2),
    })

    function increment() {
      state.count++
    }

    return {
      state,
      increment,
    }
  },
})
```

如果 `setup` 返回一个对象，则对象的属性将会被合并到组件实例上，可以直接在组件模版中使用。

```xml
<!-- component.wxml -->
<button bindtap="increment">
  Count is: {{ state.count }}, double is: {{ state.double }}
</button>
```

注意 `setup` 返回的 ref 在模板中会自动解开，不需要写 `.value`。

## setup

- **调用时机**

`setup` 会在 `attached` 阶段被调用。返回都数据和方法也会在此时才会被合并到组件实例上，所以模版初次渲染时数据可能是 `undefined`。不过小程序模版对此做了兼容，所以不用担心会报错。

- **调用顺序**

组件 `setup` 函数会跟 `attached` 钩子一样按组件树从上到下依次执行，但是可能会早于页面的 `setup` 函数执行（取决于定义页面的方式），所以在 `setup` 函数执行时，`props` 可能还未初始化。在这种情况下，如果你需要依据 `props` 派生状态，可以使用 `computed`，如果你需要依据 `props` 执行副作用，可以使用 `watchEffect` 或 `watch`。

- **参数**

`setup` 函数接收组件 `props` 作为其第一个参数，`props` 的声明与小程序原生语法没有差别。`setup` 函数无需返回 `props`，它的属性默认就能在模版中使用。

```js
// component.js
import { defineComponent } from '@vue-mini/wechat'

defineComponent({
  properties: {
    count: Number,
  },
  setup(props) {
    console.log(props.count)
  },
})
```

注意 `props` 对象是响应式的，可以用 `watchEffect` 或 `watch` 观察和响应 `props` 的更新，也可以基于 `props` 生成新的计算状态。

```js
// component.js
import { defineComponent, watchEffect, computed } from '@vue-mini/wechat'

defineComponent({
  properties: {
    count: Number,
  },
  setup(props) {
    watchEffect(() => {
      console.log('count is: ' + props.count)
    })

    const double = computed(() => props.count * 2)

    return {
      double,
    }
  },
})
```

然而**不要**解构 `props` 对象，那样会使其失去响应性。

```js
// component.js
import { defineComponent, watchEffect } from '@vue-mini/wechat'

defineComponent({
  properties: {
    count: Number,
  },
  setup({ count }) {
    watchEffect(() => {
      console.log('count is: ' + count) // Will not be reactive!
    })
  },
})
```

在开发过程中，`props` 对象对用户空间代码是不可变的（用户代码尝试修改 `props` 时会触发警告）。

第二个参数提供了一个上下文对象，从小程序组件 `this` 中选择性的暴露了一些 property。

```js
// component.js
import { defineComponent } from '@vue-mini/wechat'

defineComponent({
  setup(props, context) {
    context.is
    context.id
    context.dataset
    context.triggerEvent
    // ...
  },
})
```

- **`this` 的用法**

**`this` 在 `setup()` 中不可用**。这是为了避免混乱。

## 生命周期

可以直接导入 `onXXX` 一族的函数来注册生命周期钩子。它们接收的参数与对应的生命周期一致，每个 `onXXX` 函数都能被多次调用。

```js
// component.js
import { defineComponent, onReady, onMove, onDetach } from '@vue-mini/wechat'

createApp({
  setup() {
    onReady(() => {
      console.log('ready')
    })
    onMove(() => {
      console.log('move')
    })
    onDetach(() => {
      console.log('detach')
    })
  },
})
```

这些生命周期钩子注册函数只能在 `setup()` 期间同步使用，其他场景下调用这些函数会抛出一个错误。

在 `setup()` 内同步创建的侦听器和计算状态会在页面销毁时自动删除。

- **created**

Vue Mini 并没有 `onCreate` 钩子函数，这是因为 `setup` 是在 `attached` 阶段执行的，此时 `created` 生命周期已经执行完毕了。不过在绝大部分情况下，你应该都不需要使用 `created` 生命周期。如果你真的需要，可以使用小程序原生语法。

- **生命周期对应关系**

  - `lifetimes.created` -> 无
  - `lifetimes.attached` -> `setup`
  - `lifetimes.ready` -> `onReady`
  - `lifetimes.moved` -> `onMove`
  - `lifetimes.detached` -> `onDetach`
  - `lifetimes.error` -> `onError`
  - `pageLifetimes.show` -> `onShow`
  - `pageLifetimes.hide` -> `onHide`
  - `pageLifetimes.resize` -> `onResize`
  - `pageLifetimes.routeDone` -> `onRouteDone`

## 与原生语法混用

由于 `defineComponent()` 是 `Component()` 的超集，所以你也能使用原生语法。

```js
// component.js
import { defineComponent, ref } from '@vue-mini/wechat'

defineComponent({
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    return {
      count,
      increment,
    }
  },
  data: {
    number: 0,
  },
  methods: {
    add() {
      this.setData({ number: this.data.number + 1 })
    },
  },
})
```

如果名称相同，`setup()` 返回的数据或方法会覆盖原生语法声明的数据或方法。你应该避免出现这种情况。

请不要在其他选项中访问 `setup()` 返回的数据或方法，这将引起混乱。如果确实有此需求，应该将相关逻辑搬到 `setup()` 内。

## 简洁语法

如果组件没有 `props`，且不需要使用原生语法，也可以直接传递一个 `setup` 函数给 `defineComponent()`。

```js
// page.js
import { defineComponent, ref } from '@vue-mini/wechat'

defineComponent(() => {
  const count = ref(0)

  function increment() {
    count.value++
  }

  return {
    count,
    increment,
  }
})
```
