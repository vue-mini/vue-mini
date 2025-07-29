# 版本发布

Vue Mini 的发布遵循[语义化版本](https://semver.org/)，但有一些例外。

## TypeScript 类型声明

Vue Mini 的**次要版本**可能会包含 TypeScript 类型声明的不兼容变更，因为：

1. 有的时候 TypeScript 自身会在其次要版本发布不兼容变更，我们不得不为了支持更新版本的 TypeScript 而调整自身的类型定义。

2. 我们也会偶尔需要使用最新版本的 TypeScript 中才可用的特性，并提升 TypeScript 的最低版本要求。

3. Vue 的次要版本可能会包含 TypeScript 类型声明的不兼容变更。

4. miniprogram-api-typings 的新版本可能会包含不兼容变更。

如果你正在使用 TypeScript，则可以使用一个语义化版本的范围来锁住当前的次要版本，并在 Vue Mini 新的次要版本发布时进行手动升级。需要说明的是 TypeScript 类型声明的不兼容变更不会导致你的程序运行出错，对于运行时来说仍然是兼容的。
