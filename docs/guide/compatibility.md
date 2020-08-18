---
sidebarDepth: 0
---

# 兼容性

Vue Mini 底层直接依赖于 [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity)，它的内部使用了 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，所以 Vue Mini 需要运行环境原生支持 ES6。幸运的是绝大部分用户的微信小程序运行环境都已经原生支持 ES6 了。

## iOS

微信小程序在 iOS 上是使用的是系统的 WebView，而 ES6 是从 iOS 10 开始被原生支持的。所以 Vue Mini 仅兼容 iOS 10 及以上版本。

## Android

微信小程序在 Android 上使用的是基于 Mobile Chrome 的自定义 WebView。经测试 Mobile Chrome 的版本为 66（文档编写时所测，将来可能更高），此版本的 Mobile Chrome 已经原生支持 ES6 了。所以理论上 Vue Mini 在 Android 上并没有太大的兼容性问题。

## 微信小程序基础库

Vue Mini 仅兼容微信小程序基础库 v2.9.0 及以上（参考：[#3](https://github.com/vue-mini/vue-mini/issues/3)）。

## 已知问题

- [微信小程序真机并不支持 Generator 函数](https://developers.weixin.qq.com/community/develop/doc/00080c83528300fe011a6ed2051400)。
