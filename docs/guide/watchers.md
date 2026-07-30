# 侦听器

## 回调的触发时机

你可以通过侦听器的 `flush?: 'pre' | 'post' | 'sync'` 参数控制回调的触发时机。

### flush: 'pre'（默认值）

回调会在下一个微任务队列中被触发。需要特别说明的是，此触发时机与渲染状态无关联，这与 Vue 不太一样。

### flush: 'post'

回调会在渲染完毕后被触发，与 `setData` 回调函数的触发时机相同。需要特别注意的是，不要使用 `flush: 'post'` 侦听未参与渲染的数据，例如：

```js [component.js]
import { defineComponent, ref, watch } from '@vue-mini/core'

defineComponent(() => {
  const count = ref(0)

  function increment() {
    count.value++
  }

  watch(
    count,
    () => {
      // 不会被触发！
      console.log('count changed')
    },
    { flush: 'post' },
  )

  return { increment }
})
```

这里 `count` 没有暴露给模板，因此它更新后页面不会重渲染，侦听器回调也就不会被触发。

### flush: 'sync'

回调会在侦听数据变化后被同步触发。
