---
sidebarDepth: 0
---

# 创建小程序

每个小程序都需要在 `app.js` 中调用 `createApp` 函数创建小程序实例。它是 `App` 函数的超集，它额外接收一个 `setup` 函数。

```js
// app.js
import { createApp } from '@vue-mini/wechat'

createApp({
  setup() {
    const greeting = 'Hello World!'

    return {
      greeting
    }
  }
})
```

如果 `setup` 返回一个对象，则对象的属性将会被原样合并到小程序实例上。

```js
// xxx.js
const app = getApp()
console.log(app.greeting) // Hello World!
```

## setup

- **调用时机**

`setup` 会在 `onLaunch` 阶段被调用。返回都数据和方法也会在此时才会被合并到小程序实例上。

- **参数**

`setup` 接收与 `onLaunch` 相同的参数。

```js
// app.js
import { createApp } from '@vue-mini/wechat'

createApp({
  setup(options) {
    // options 为小程序启动参数
  }
})
```

- **`this` 的用法**

**`this` 在 `setup()` 中不可用**。这是为了避免混乱。

## 生命周期

可以直接导入 `onXXX` 一族的函数来注册生命周期钩子。它们接收的参数与对应的生命周期一致，每个 `onXXX` 函数都能被多次调用。

```js
// app.js
import { createApp, onAppShow, onAppHide, onAppError } from '@vue-mini/wechat'

createApp({
  setup() {
    onAppShow(() => {
      console.log('show')
    })
    onAppHide(() => {
      console.log('hide')
    })
    onAppError(() => {
      console.log('error')
    })
  }
})
```

这些生命周期钩子注册函数只能在 `setup()` 期间同步使用，其他场景下调用这些函数会抛出一个错误。

- **生命周期对应关系**

  - `onLaunch` -> `setup`
  - `onShow` -> `onAppShow`
  - `onHide` -> `onAppHide`
  - `onError` -> `onAppError`
  - `onPageNotFound` -> `onPageNotFound`
  - `onUnhandledRejection` -> `onUnhandledRejection`
  - `onThemeChange` -> `onThemeChange`

## 与原生语法混用

由于 `createApp()` 是 `App()` 的超集，所以你也能使用原生语法。

```js
// app.js
import { createApp, onAppShow } from '@vue-mini/wechat'

createApp({
  setup() {
    const hello = 'Hello'

    onAppShow(() => {
      console.log('from setup')
    })

    return {
      hello
    }
  },
  onShow() {
    console.log('from option')
  },
  world: 'World!'
})
```

如果名称相同，`setup()` 返回的数据或方法会覆盖原生语法声明的数据或方法。你应该避免出现这种情况。

请不要在其他选项中访问 `setup()` 返回的数据或方法，这将引起混乱。如果确实有此需求，应该将相关逻辑搬到 `setup()` 内。

## 简洁语法

如果不需要使用原生语法，也可以直接传递一个 `setup` 函数给 `createApp()`。

```js
// app.js
import { createApp } from '@vue-mini/wechat'

createApp(() => {
  const greeting = 'Hello World!'

  return {
    greeting
  }
})
```
