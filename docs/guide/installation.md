# 安装

## 拷贝

使用 Vue Mini 最简单的方式就是直接从 GitHub [拷贝文件](https://github.com/vue-mini/vue-mini/tree/master/packages/wechat/dist)到你的项目中，然后像使用你自己的文件一样使用 Vue Mini。你可以根据需要选择[开发版本](https://github.com/vue-mini/vue-mini/blob/master/packages/wechat/dist/wechat.cjs.js)或[生产版本](https://github.com/vue-mini/vue-mini/blob/master/packages/wechat/dist/wechat.cjs.prod.js)。

## 使用包管理工具

你也可以使用下列任一命令安装 Vue Mini：

```bash
yarn add @vue-mini/wechat
# OR
npm install @vue-mini/wechat
```

安装之后，你可以通过[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)来提取 Vue Mini 以供使用，但是这种方式会提取出一些不必要的文件，并且只能提取 Vue Mini 的开发版本。所以最好还是使用一段自定义脚本来提取 Vue Mini。

## 使用脚手架

Vue Mini 提供了一个全功能的小程序[脚手架](https://github.com/vue-mini/template)，你可以直接使用此脚手架创建新的小程序。现有小程序也可以迁移至此脚手架，或将此脚手架作为参考。

使用前请先全局安装 [SAO](https://github.com/saojs/sao) v2：

```bash
yarn global add sao@beta
# OR
npm install -g sao@beta
```

然后运行：

```bash
sao vue-mini/template new-miniprogram
```
