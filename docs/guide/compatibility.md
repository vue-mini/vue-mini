# 兼容性

Vue Mini 底层直接依赖于 [@vue/reactivity](https://github.com/vuejs/vue-next/tree/main/packages/reactivity)，它的内部使用了 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，所以 Vue Mini 需要运行环境原生支持 ES6。幸运的是绝大部分用户的微信小程序运行环境都已经原生支持 ES6 了。

## iOS

微信小程序在 iOS 上使用的是系统的 JavaScriptCore 运行逻辑层 JS，而 ES6 是从 iOS 10 开始被原生支持的。所以 Vue Mini 仅兼容 iOS 10 及以上版本。

## Android

微信小程序在 Android 上使用的是 V8 运行逻辑层 JS，经测试其所使用的 V8 已经原生支持 ES6 了。所以理论上 Vue Mini 在 Android 上并没有太大的兼容性问题。

## 微信小程序基础库

Vue Mini 仅兼容微信小程序基础库 v3.0.0 及以上。如果你对此有疑虑，建议[设置最低基础库版本](https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html#%E8%AE%BE%E7%BD%AE%E6%9C%80%E4%BD%8E%E5%9F%BA%E7%A1%80%E5%BA%93%E7%89%88%E6%9C%AC)，提示用户更新客户端。
