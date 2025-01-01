# @vue-mini/pinia <a href="https://codecov.io/gh/vue-mini/vue-mini"><img src="https://img.shields.io/codecov/c/github/vue-mini/vue-mini.svg" alt="Coverage Status"></a>

Pinia 的 Vue Mini 移植版，拥有与 Pinia 完全一样的 API 和能力。

## 安装

```bash
npm install @vue-mini/pinia
```

## 限制

@vue-mini/pinia 相较于 pinia 有额外两点限制：

- 不支持创建多个 pinia 实例，也就是不可以多次调用 `createPinia()`。
- `defineStore()` 仅支持组合式 API。

## 致谢

此项目 Fork 至 [Pinia](https://github.com/vuejs/pinia)，并且 [pinia-vue-mini](https://github.com/akinoccc/pinia-vue-mini) 也提供了帮助。

## 许可证

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2024-present Yang Mingshan
