# 常见问题

## 我需要在小程序渲染后做一些操作，小程序原生语法可以使用 `setData` 的回调，Vue Mini 应该怎么写呢？

可以使用侦听器 `watch`，并指明 `flush: 'post'` 选项：

```js
defineComponent({
  setup() {
    const show = ref(false)
    watch(
      show,
      () => {
        // 会在 show 变更所触发的重渲染之后执行
        // ...
      },
      { flush: 'post' },
    )
    // ...
  },
})
```

也可以使用 `watchPostEffect`，但要注意 `watchPostEffect` 会先执行一次以搜集依赖。

## 默认情况下，Vue Mini 侦听器的回调是在渲染前被触发吗，就跟 Vue 一样？

不一定。虽然跟 Vue 一样，Vue Mini 侦听器的 `flush` 选项默认为 `pre`，但由于小程序的限制，默认情况下 Vue Mini 侦听器的回调的触发时机与小程序的渲染并无关联。从实际表现来看，默认情况下 Vue Mini 侦听器的回调一般会在小程序渲染前被触发，但这并不能被保证。

## 怎么实现双向数据绑定？

Vue Mini 目前不支持双向数据绑定，请通过事件监听自行实现数据更新。
