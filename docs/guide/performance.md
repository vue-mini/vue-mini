# 性能优化

Vue Mini 在大多数常见场景下性能都是很优秀的，通常不需要手动优化。然而，总会有一些具有挑战性的场景需要进行针对性的微调。

## 减少大型不可变数据的性能开销

::: tip 注意
这项优化在技术上属于破坏性变更，所以需要手动开启。可以使用 `createApp()` 的第二个配置参数开启这项优化。在下一个大版本中，这将成为默认行为。

```js [app.js]
createApp({/* ... */}, { respectHints: true })
```

:::

Vue Mini 默认会深度遍历侦听 `setup()` 返回的数据，并且会对其做深度拷贝。这能让你很方便的修改深层字段，也能很好的支持响应式数据嵌套。但在数据量巨大时，这也会导致不小的性能负担。好在这种性能负担通常只有在处理超大型数组或层级很深的对象时，才会变得比较明显。因此，它只会影响少数特定的场景。

Vue Mini 确实也为此提供了解决方案，在 Vue Mini 1.3+ 中，你可以通过使用 `markRaw()` `shallowRef()` `shallowReactive()` 和 `shallowReadonly()` 来绕开深度遍历侦听和深度拷贝。

如果你有一份大型静态数据需要暴露给模板，你可以使用 `markRaw()` 来标记它，这样 Vue Mini 就会跳过深度遍历侦听和深度拷贝。需要注意的是，这份数据**不能**包含响应式数据。

```js [component.js]
defineComponent({
  setup() {
    const staticArray = markRaw([/* 巨大的列表，里面包含深层的对象 */])

    // 不能包含响应式数据！
    const count = ref(0)
    const notSupported = markRaw({ count })

    return { staticArray }
  },
})
```

你也可以使用 `shallowRef()` `shallowReactive()` 和 `shallowReadonly()` 来创建**浅**响应式数据，对于这类数据 Vue Mini 只会做表层遍历侦听，也不会做深度拷贝。需要注意的是，修改浅响应式数据的深层字段不会触发更新，而且浅响应式数据也不能嵌套别的响应式数据。

```js [component.js]
defineComponent({
  setup() {
    const shallowArray = shallowRef([/* 巨大的列表，里面包含深层的对象 */])

    // 这不会触发更新...
    shallowArray.value.push(newObject)
    // 这才会触发更新
    shallowArray.value = [...shallowArray.value, newObject]

    // 这不会触发更新...
    shallowArray.value[0].foo = 1
    // 这才会触发更新
    shallowArray.value = [
      {
        ...shallowArray.value[0],
        foo: 1,
      },
      ...shallowArray.value.slice(1),
    ]

    // 不能嵌套别的响应式数据!
    const notSupported = shallowReactive({
      count: 0,
      double: computed(() => notSupported.count * 2),
    })

    return { shallowArray }
  },
})
```
