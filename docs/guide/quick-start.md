# 快速上手

## 创建一个 Vue Mini 小程序

:::tip 前提条件

- 熟悉命令行
- 已安装 >= 18.19.1 < 19 或 >= 20.6.1 版本的 [Node.js](https://nodejs.org)

:::

创建 Vue Mini 小程序最推荐的方案是 [create-vue-mini](https://github.com/vue-mini/create-vue-mini)，它是官方项目脚手架工具。你可以在终端内直接运行以下命令（不要带上 `$` 符号）：

::: code-group

```sh [npm]
$ npm create vue-mini@latest
```

```sh [pnpm]
$ pnpm create vue-mini@latest
```

```sh [yarn]
$ yarn create vue-mini
```

```sh [bun]
$ bun create vue-mini@latest
```

:::

然后你将会看到一些诸如 TypeScript 和测试支持之类的可选功能提示：

<div class="language-sh"><pre class="vp-code"><code><span style="color:#42b883;">✔</span> <span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">请输入项目名称：<span style="color:#888;">… <span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;">&lt;</span><span style="color:#888;">your-project-name</span><span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;">&gt;</span></span></span>
<span style="color:#42b883;">✔</span> <span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">是否使用 TypeScript 语法？<span style="color:#888;">… <span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;text-decoration:underline">否</span> / 是</span></span>
<span style="color:#42b883;">✔</span> <span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">是否引入 Pinia 用于状态管理？（试验）<span style="color:#888;">… <span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;text-decoration:underline">否</span> / 是</span></span>
<span style="color:#42b883;">✔</span> <span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">是否引入 Vitest 用于单元测试？<span style="color:#888;">… <span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;text-decoration:underline">否</span> / 是</span></span>
<span style="color:#42b883;">✔</span> <span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">是否引入 ESLint 用于 JS 代码质量检测？<span style="color:#888;">… <span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;text-decoration:underline">否</span> / 是</span></span>
<span style="color:#42b883;">✔</span> <span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">是否引入 Stylelint 用于 CSS 代码质量检测？<span style="color:#888;">… <span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;text-decoration:underline">否</span> / 是</span></span>
<span style="color:#42b883;">✔</span> <span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">是否引入 Prettier 用于代码格式化？<span style="color:#888;">… <span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;text-decoration:underline">否</span> / 是</span></span>
<span></span>
<span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">正在初始化项目 ./<span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;">&lt;</span><span style="color:#888;">your-project-name</span><span style="--shiki-light:#00B6FF;--shiki-dark:#89DDFF;">&gt;</span>...</span>
<span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">项目初始化完成。</span></code></pre></div>

如果不确定是否要开启某个功能，你可以直接按下回车键选择`否`。在项目被创建后，通过以下步骤安装依赖并启动开发服务器：

::: code-group

```sh [npm]
$ cd <your-project-name>
$ npm install
$ npm run dev
```

```sh [pnpm]
$ cd <your-project-name>
$ pnpm install
$ pnpm dev
```

```sh [yarn]
$ cd <your-project-name>
$ yarn
$ yarn dev
```

```sh [bun]
$ cd <your-project-name>
$ bun install
$ bun run dev
```

:::

你现在应该已经运行起来了你的第一个 Vue Mini 项目！现在你可以将项目导入[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)，注意选择项目根目录而非 `dist` 目录。

当你准备将小程序发布上线时，请运行：

::: code-group

```sh [npm]
$ npm run build
```

```sh [pnpm]
$ pnpm build
```

```sh [yarn]
$ yarn build
```

```sh [bun]
$ bun run build
```

:::

然后使用微信开发者工具上传。请忽略微信开发者工具关于 JS 代码未压缩的警告，上述命令已经对 JS 代码做了自定义压缩。

## 使用包管理器安装

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

```sh [bun]
$ bun add @vue-mini/core
```

:::

## 从 GitHub 下载

当然，使用 Vue Mini 最简单的方式就是直接从 GitHub [下载](https://github.com/vue-mini/vue-mini/releases)编译好的文件压缩包，解压缩后拷贝到你的项目中，然后像使用你自己的文件一样使用 Vue Mini。你可以根据自身情况选择需要的文件。
