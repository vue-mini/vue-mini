# 侦听器

## 回调的触发时机

你可以通过侦听器的 `flush?: 'pre' | 'post' | 'sync'` 参数控制回调的触发时机。

### flush: 'pre'（默认值）

回调会在下一个微任务队列中被触发。需要特别说明的是，此触发时机与渲染状态无强关联，这与 Vue 不太一样。

### flush: 'post'

回调会在 `setData` 调用完成后被触发，由于 `setData` 是[同步更新](https://developers.weixin.qq.com/miniprogram/dev/framework/component-framework/data-updates.html)的，因此你可以在回调中访问组件树，也可以在回调中获取界面上的节点信息等。

### flush: 'sync'

回调会在侦听数据变化后被同步触发。
