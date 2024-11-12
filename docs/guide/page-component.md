# 定义页面组件

小程序支持将组件作为页面使用，本文档称此类组件为`页面组件`。定义页面组件与定义普通组件没有什么区别，都是使用 `defineComponent`，只需注意[小程序自身的规则](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html#%E4%BD%BF%E7%94%A8-Component-%E6%9E%84%E9%80%A0%E5%99%A8%E6%9E%84%E9%80%A0%E9%A1%B5%E9%9D%A2)。

## setup

::: tip 注意
setup 只能是同步函数。
:::

- **调用顺序**

页面组件也是组件，所以页面组件的 `setup` 函数会按组件层级优先执行，不会存在晚于子组件 `setup` 函数执行的情况。所以如果你依赖 `setup` 的执行顺序，可以使用页面组件。

## 生命周期

```js
import { defineComponent } from '@vue-mini/core'

defineComponent({
  lifetimes: {
    created() {
      console.log('created')
    },
    attached() {
      console.log('attached')
    },
    ready() {
      console.log('ready')
    },
    moved() {
      console.log('moved')
    },
    detached() {
      console.log('detached')
    },
    error() {
      console.log('error')
    },
  },
  pageLifetimes: {
    show() {
      console.log('show')
    },
    hide() {
      console.log('hide')
    },
    resize() {
      console.log('resize')
    },
    routeDone() {
      console.log('routeDone')
    },
  },
  methods: {
    onLoad() {
      console.log('onLoad')
    },
    onShow() {
      console.log('onShow')
    },
    onReady() {
      console.log('onReady')
    },
    onHide() {
      console.log('onHide')
    },
    onUnload() {
      console.log('onUnload')
    },
    onRouteDone() {
      console.log('onRouteDone')
    },
    onPullDownRefresh() {
      console.log('onPullDownRefresh')
    },
    onReachBottom() {
      console.log('onReachBottom')
    },
    onShareAppMessage() {
      console.log('onShareAppMessage')
    },
    onShareTimeline() {
      console.log('onShareTimeline')
    },
    onAddToFavorites() {
      console.log('onAddToFavorites')
    },
    onPageScroll() {
      console.log('onPageScroll')
    },
    onResize() {
      console.log('onResize')
    },
    onTabItemTap() {
      console.log('onTabItemTap')
    },
    onSaveExitState() {
      console.log('onSaveExitState')
    },
  },
})
```

以上是页面组件可用的所有生命周期，可以看到这些生命周期有些混乱，并且很多是重复的。

Vue Mini 对页面组件的生命周期钩子做了些许整合和简化。同样它们是一族 `onXXX` 函数，它们接收的参数和返回值与对应的生命周期一致。`onPageScroll()`、`onShareAppMessage()`、`onShareTimeline()`、`onAddToFavorites()` 以及 `onSaveExitState()` 的使用限制与页面中一样。

- **onLoad**

`onLoad()` 是页面组件特有的生命周期钩子，在页面中使用会抛出一个错误，在普通组件中使用不会有效果。

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
  - `methods.onLoad` -> `onLoad`
  - `methods.onShow` -> `onShow`
  - `methods.onReady` -> `onReady`
  - `methods.onHide` -> `onHide`
  - `methods.onUnload` -> `onUnload`
  - `methods.onRouteDone` -> `onRouteDone`
  - `methods.onPullDownRefresh` -> `onPullDownRefresh`
  - `methods.onReachBottom` -> `onReachBottom`
  - `methods.onShareAppMessage` -> `onShareAppMessage`
  - `methods.onShareTimeline` -> `onShareTimeline`
  - `methods.onAddToFavorites` -> `onAddToFavorites`
  - `methods.onPageScroll` -> `onPageScroll`
  - `methods.onResize` -> `onResize`
  - `methods.onTabItemTap` -> `onTabItemTap`
  - `methods.onSaveExitState` -> `onSaveExitState`
