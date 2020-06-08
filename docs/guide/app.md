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

`setup` 函数的返回值会被原样添加到小程序实例上。

```js
// xxx.js
const app = getApp()
console.log(app.greeting) // Hello World!
```
