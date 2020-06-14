---
sidebarDepth: 0
---

# 定义组件

小程序中的每个组件都需要在对应的 js 文件中使用 `defineComponent` 函数进行定义。它是 `Component` 函数的超集，它额外接收一个 `setup` 函数。

```js
// component.js
import { defineComponent, reactive, computed } from '@vue-mini/wechat'

defineComponent({
  setup() {
    const state = reactive({
      count: 0,
      double: computed(() => state.count * 2)
    })

    function increment() {
      state.count++
    }

    return {
      state,
      increment
    }
  }
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

- **参数**

`setup` 函数接收组件 `props` 作为其第一个参数，`props` 的声明与小程序原生语法没有差别。`setup` 函数无需返回 `props`，它的属性默认就能在模版中使用。

```js
// component.js
import { defineComponent } from '@vue-mini/wechat'

defineComponent({
  properties: {
    count: Number
  },
  setup(props) {
    console.log(props.count)
  }
})
```

注意 `props` 对象是响应式的，可以用 `watchEffect` 或 `watch` 观察和响应 `props` 的更新，也可以基于 `props` 生成新的计算状态。

```js
// component.js
import { defineComponent, watchEffect, computed } from '@vue-mini/wechat'

defineComponent({
  properties: {
    count: Number
  },
  setup(props) {
    watchEffect(() => {
      console.log('count is: ' + props.count)
    })

    const double = computed(() => props.count * 2)

    return {
      double
    }
  }
})
```

然而**不要**解构 `props` 对象，那样会使其失去响应性。

```js
// component.js
import { defineComponent, watchEffect } from '@vue-mini/wechat'

defineComponent({
  properties: {
    count: Number
  },
  setup({ count }) {
    watchEffect(() => {
      console.log('count is: ' + count) // Will not be reactive!
    })
  }
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
  }
})
```

- **`this` 的用法**

**`this` 在 `setup()` 中不可用**。这是为了避免混乱。
