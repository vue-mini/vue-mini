# 定义页面组件

小程序支持将组件作为页面使用，详见[小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html#%E4%BD%BF%E7%94%A8-Component-%E6%9E%84%E9%80%A0%E5%99%A8%E6%9E%84%E9%80%A0%E9%A1%B5%E9%9D%A2)，本文档将此类组件称为`页面组件`。定义页面组件与定义普通组件没有什么区别，都是使用 `defineComponent`。这是**推荐**的页面定义方式。

## setup

::: tip 注意
setup 只能是同步函数。
:::

- **调用顺序**

页面组件也是组件，所以页面组件的 `setup` 函数会按组件层级优先执行，不会存在晚于子组件 `setup` 函数执行的情况。

- **参数**

页面组件的 `props` 可以用于接收页面的参数。

```js [page-component.js]
import { defineComponent } from '@vue-mini/core'

defineComponent({
  properties: {
    id: Number,
    category: String,
  },
  setup(props) {
    // /pages/detail/index?id=123&category=food
    props.id // 123
    props.category // 'food'
  },
})
```

## 生命周期

```js [page-component.js]
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

相较于普通组件，页面组件有一些额外的生命周期。以上是页面组件可用的所有生命周期，可以看到这些生命周期有些混乱，并且很多是重复的。

Vue Mini 对页面组件的生命周期钩子做了些许整合和简化。同样它们是一族 `onXXX` 函数，它们接收的参数和返回值与对应的生命周期一致。除 `onShareAppMessage`、`onShareTimeline`、 `onAddToFavorites` 和 `onSaveExitState` 外每个 `onXXX` 函数都能被多次调用。

- **onLoad**

`onLoad()` 是页面组件特有的生命周期钩子，在页面中使用会被忽略并打印一个警告（开发环境），在普通组件中使用不会有效果。

- **onUnload**

`onUnload()` 可用于页面组件，但是在普通组件中使用不会有效果。

- **onPageScroll**

监听页面滚动会引起小程序渲染层与逻辑层的通信。为避免定义空的 `onPageScroll` 监听造成不必要的性能损耗，需要使用 `defineComponent` 的第二个参数提前告知 Vue Mini 是否会调用 `onPageScroll()` 钩子。

```js [page-component.js]
import { defineComponent, onPageScroll } from '@vue-mini/core'

defineComponent(
  {
    setup() {
      onPageScroll(({ scrollTop }) => {
        console.log('scrollTop:', scrollTop)
      })
    },
  },
  {
    listenPageScroll: true, // 默认为 false
  },
)
```

如果已存在另外的 `onPageScroll` 方法，那么可以忽略此参数。

```js [page-component.js]
import { defineComponent, onPageScroll } from '@vue-mini/core'

defineComponent({
  setup() {
    onPageScroll(({ scrollTop }) => {
      console.log('scrollTop (from setup):', scrollTop)
    })
  },
  methods: {
    onPageScroll({ scrollTop }) {
      console.log('scrollTop (from option):', scrollTop)
    },
  },
})
```

如果以上两个条件都不满足，在 `setup()` 中调用 `onPageScroll()` 钩子会被忽略并打印一个警告（开发环境）。

- **onShareAppMessage**

由于小程序会根据是否定义了 `onShareAppMessage` 监听来决定页面是否可以转发，所以需要使用 `defineComponent` 的第二个参数提前告知 Vue Mini 是否会调用 `onShareAppMessage()` 钩子。又由于 `onShareAppMessage` 会返回自定义转发内容，所以一个页面只能有一个 `onShareAppMessage` 监听。

```js [page-component.js]
import { defineComponent, onShareAppMessage } from '@vue-mini/core'

defineComponent(
  {
    setup() {
      // 仅第一次调用，且 `canShareToOthers` 为 `true`，且 `onShareAppMessage` 方法不存在时才生效。
      onShareAppMessage(() => {
        return {
          title: '自定义标题',
          path: '/my/page/path',
          imageUrl: 'https://hosts.com/my-image.png',
        }
      })
    },
  },
  {
    canShareToOthers: true, // 默认为 false
  },
)
```

如果条件不满足，在 `setup()` 中调用 `onShareAppMessage()` 钩子会被忽略并打印一个警告（开发环境）。

- **onShareTimeline**

由于小程序会根据是否定义了 `onShareTimeline` 监听来决定页面是否可以分享到朋友圈，所以需要使用 `defineComponent` 的第二个参数提前告知 Vue Mini 是否会调用 `onShareTimeline()` 钩子。又由于 `onShareTimeline` 会返回自定义分享内容，所以一个页面只能有一个 `onShareTimeline` 监听。

```js [page-component.js]
import { defineComponent, onShareTimeline } from '@vue-mini/core'

defineComponent(
  {
    setup() {
      // 仅第一次调用，且 `canShareToTimeline` 为 `true`，且 `onShareTimeline` 方法不存在时才生效。
      onShareTimeline(() => {
        return {
          title: '自定义标题',
          query: 'a=1&b=2',
          imageUrl: 'https://hosts.com/my-image.png',
        }
      })
    },
  },
  {
    canShareToTimeline: true, // 默认为 false
  },
)
```

如果条件不满足，在 `setup()` 中调用 `onShareTimeline()` 钩子会被忽略并打印一个警告（开发环境）。

- **onAddToFavorites**

由于 `onAddToFavorites` 会返回自定义收藏内容，所以一个页面只能有一个 `onAddToFavorites` 监听。

```js [page-component.js]
import { defineComponent, onAddToFavorites } from '@vue-mini/core'

defineComponent({
  setup() {
    // 仅第一次调用，且 `onAddToFavorites` 方法不存在才生效。
    onAddToFavorites(() => {
      return {
        title: '自定义标题',
        query: 'a=xxx&b=xxx',
        imageUrl: 'https://hosts.com/my-image.png',
      }
    })
  },
})
```

如果条件不满足，在 `setup()` 中调用 `onAddToFavorites()` 钩子会被忽略并打印一个警告（开发环境）。

- **onSaveExitState**

由于 `onSaveExitState` 会返回需要保存的状态，所以一个页面只能有一个 `onSaveExitState` 监听。

```js [page-component.js]
import { defineComponent, ref, onSaveExitState } from '@vue-mini/core'

defineComponent({
  setup(_, context) {
    const foo = ref(context.exitState?.foo ?? '')

    // 仅第一次调用，且 `onSaveExitState` 方法不存在才生效。
    onSaveExitState(() => {
      return {
        data: { foo: 'foo' },
      }
    })

    // ...
  },
})
```

如果条件不满足，在 `setup()` 中调用 `onSaveExitState()` 钩子会被忽略并打印一个警告（开发环境）。

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
