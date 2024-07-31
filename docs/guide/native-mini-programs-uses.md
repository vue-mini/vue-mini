
# 原生小程序直接使用 Vue Mini

## 使用包管理器安装

在小程序 miniprogramRoot 所在目录下创建package.json文件

::: code-group

```sh [npm]
$ npm init -y
```

```sh [pnpm]
$ pnpm init
```

```sh [yarn]
$ yarn init
```

:::

你也可以使用下列命令安装 Vue Mini：

::: code-group

```sh [npm]
$ npm install @vue-mini/core
```

```sh [pnpm]
$ pnpm install @vue-mini/core
```

```sh [yarn]
$ yarn add @vue-mini/core
```

:::


## 构建 npm

点击开发者工具中的菜单栏：工具 --> 构建 npm

## 原生小程序中直接使用Vue Mini


```js
// pages/index/index.js
import { defineComponent, ref } from '@vue-mini/core';

defineComponent(() => {
  const greeting = ref('欢迎使用 Vue Mini');

  return {
    greeting,
  };
});

```

```xml
<!-- page.wxml -->
<view>{{greeting}}</view>
```

## npm 支持
从小程序基础库版本 2.2.1 或以上、及开发者工具 1.02.1808300 或以上开始，小程序支持使用 npm 安装第三方包。

https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html