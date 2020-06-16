---
sidebarDepth: 0
---

# 定义页面组件

小程序支持将组件作为页面使用，本文档称此类组件为`页面组件`。使用页面组件的好处是可以使用 `behaviors` 来提取和复用逻辑。然而 Vue Mini 支持更好的逻辑提取与复用机制，也就是 Composition 函数。另外页面组件的生命周期十分混乱。因此 Vue Mini 虽然支持页面组件，但**不推荐**使用。

```js
import { defineComponent } from '@vue-mini/wechat'

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
    }
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
    }
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
    onPullDownRefresh() {
      console.log('onPullDownRefresh')
    },
    onReachBottom() {
      console.log('onReachBottom')
    },
    onShareAppMessage() {
      console.log('onShareAppMessage')
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
    }
  }
})
```

以上是页面组件可用的所有生命周期，其中很多是重复的。

## 生命周期

Vue Mini 对页面组件的生命周期钩子做了些许整合简化。同样它们是一族 `onXXX` 函数，它们接收的参数和返回值与对应的生命周期一致。`onPageScroll()`、`onShareAppMessage()` 和 `onAddToFavorites()` 的使用限制与页面中一样。

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
  - `methods.onLoad` -> `onLoad`
  - `methods.onShow` -> `onShow`
  - `methods.onReady` -> `onReady`
  - `methods.onHide` -> `onHide`
  - `methods.onUnload` -> `onUnload`
  - `methods.onPullDownRefresh` -> `onPullDownRefresh`
  - `methods.onReachBottom` -> `onReachBottom`
  - `methods.onShareAppMessage` -> `onShareAppMessage`
  - `methods.onAddToFavorites` -> `onAddToFavorites`
  - `methods.onPageScroll` -> `onPageScroll`
  - `methods.onResize` -> `onResize`
  - `methods.onTabItemTap` -> `onTabItemTap`
