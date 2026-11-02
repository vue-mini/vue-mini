# Skyline

[Skyline](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/introduction.html) 是微信小程序的高性能渲染引擎，它与 [glass-easel](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/glass-easel/migration.html) 组件框架绑定。因此本文档提到 Skyline 模式时是指 Skyline 渲染引擎 + glass-easel 组件框架。Vue Mini 完美支持 Skyline 模式。

## 数据函数

Skyline 模式中组件 data 的字段可以是函数，并且你可以直接在模板里调用这类数据函数，只是要注意[调用限制](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/expression.html#函数调用限制)。数据函数很适合用来做多语言、格式化等。Vue Mini 1.3+ 为数据函数提供了专门的支持，你可以使用 `dataFn()` 来声明数据函数，它返回的是一个响应式的 Function Ref。

::: code-group

```js [component.js]
import { defineComponent, ref, dataFn } from '@vue-mini/core'

defineComponent({
  setup() {
    const lang = ref()

    wx.request({
      url: 'https://api.example.com/lang',
      data: { lang: 'en' },
      success(response) {
        lang.value = response.data
      },
    })

    // `t` 是响应式的，`lang` 更新后 `t` 也会自动更新，
    // 从而触发界面更新，因此无需将 `lang` 暴露给模板。
    const t = dataFn((key) => lang.value?.[key])

    // `t` 是一个 Function Ref，在 JS 中可以这样调用。
    t.value('welcome')

    // 无需返回 `lang`
    return { t }
  },
})
```

```html [component.wxml]
<view>{{ t('welcome') }}</view>
```

:::

你也可以将数据函数向下传递给子组件，并在子组件中使用它。

::: code-group

```html [parent.wxml]
<child data-fn="{{ dataFn }}" />
```

```js [child.js]
import { defineComponent } from '@vue-mini/core'

defineComponent({
  properties: {
    dataFn: Function,
  },
})
```

```html [child.wxml]
<view>{{ dataFn() }}</view>
```

:::

::: tip 注意
`dataFn()` 的参数函数**不能**包含副作用，因为不仅模版渲染时会调用它，Vue Mini 内部在某些时候也会调用它。它可以是一个纯函数，或者是上面例子中那样的纯 getter 函数。
:::

::: tip 注意
`dataFn()` 的依赖项需要保持稳定，不能跟函数参数相关联。

```js
// 不支持，依赖项不能随着参数变化而变化！
const fn = dataFn((condition) => (condition ? fooRef.value : barRef.value))
```

:::
