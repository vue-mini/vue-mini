# 0.2.1 (2021-01-10)

### 依赖

- @vue/reactivity 从 3.0.2 升至 3.0.5 ([3bac2f5](https://github.com/vue-mini/vue-mini/commit/3bac2f5d4b9ed51199e78de9b3072fe06d77ba5d))

# 0.2.0 (2020-11-24)

### Bug 修复

- 仅在 `canShareToOthers` 配置为 `true` 时才设置 `onShareAppMessage` 生命周期 ([75360e8](https://github.com/vue-mini/vue-mini/commit/75360e84970d8cfedf854bb1cb77f952d9ebd32a))

### 特性

- 新增 `onShareTimeline` 生命周期钩子 ([a175e03](https://github.com/vue-mini/vue-mini/commit/a175e032bed4c3551274b556a5f168d68ea2b20a))

# 0.1.1 (2020-11-17)

### 依赖

- @vue/reactivity 从 3.0.0 升至 3.0.2 ([cf9537f](https://github.com/vue-mini/vue-mini/commit/cf9537fd6929b72605c8f516d3372eb40fc4589c))
- @types/wechat-miniprogram 从 3.0.0 升至 3.1.0 ([6f2c55c](https://github.com/vue-mini/vue-mini/commit/6f2c55c866ad95566b29b4103aba99460a69ab8c))

### Bug 修复

- computed ref 值未变更时不应触发 watch ([ff638be](https://github.com/vue-mini/vue-mini/commit/ff638bef03053280a6fc9dcc5580e2933d70a27f))

# 0.1.0 (2020-10-20)

### 依赖

- @vue/reactivity 从 3.0.0-rc.9 升至 3.0.0 ([2f8f641](https://github.com/vue-mini/vue-mini/commit/efd3da82efc97de1b214278de44c444932f8f641), [a1c5515](https://github.com/vue-mini/vue-mini/commit/f0f81e1085344a9a3fa7012f1dbc35ebea1c5515))

### Bug 修复

- inject 支持工厂函数型默认值 ([0100777](https://github.com/vue-mini/vue-mini/commit/b5d32a3c12455a8f9e814691a8f843a130100777))

# 0.1.0-rc4 (2020-08-28)

### 依赖

- @vue/reactivity 从 3.0.0-rc.6 升至 3.0.0-rc.9 ([f48b91b](https://github.com/vue-mini/vue-mini/commit/f48b91b3b8323c776755a885d96a7019e29f54f1), [9227135](https://github.com/vue-mini/vue-mini/commit/9227135ebbc896da5f19cb498c1ca87cae06222e))

### Bug 修复

- refs 深度侦听修复 ([91d0c6f](https://github.com/vue-mini/vue-mini/commit/91d0c6f88f8b134b3defcf06f35779040a4e2acc))

# 0.1.0-rc3 (2020-08-23)

### 依赖

- @vue/reactivity 从 3.0.0-rc.5 升至 3.0.0-rc.6 ([80583ba](https://github.com/vue-mini/vue-mini/commit/80583baaed3edd0ecbecade7e24e4caa96fe0549))
- 将 miniprogram-api-typings 2.12.0 升级为 @types/wechat-miniprogram 3.0.0 ([b65ede8](https://github.com/vue-mini/vue-mini/commit/b65ede811097b8e7ffe3d6a8859a4577edb1baa2))
- 解锁 @types/wechat-miniprogram 的版本

### Bug 修复

- scheduler 仅允许带回调的 watch 自我触发 ([7ee769e](https://github.com/vue-mini/vue-mini/commit/7ee769ec28cc19f42d8d01382830c23adcb2f8ea))
- 调用 triggerRef 应该触发 ref 的 watcher ([f7cfe99](https://github.com/vue-mini/vue-mini/commit/f7cfe99d038b0a29703900d026c8b8c7b9698929))

# 0.1.0-rc.2 (2020-07-30)

### 依赖

- @vue/reactivity 从 3.0.0-rc.4 升至 3.0.0-rc.5 ([7c42438](https://github.com/vue-mini/vue-mini/commit/7c42438c06c83d578d57f0b7e964959c235f0aee))
- miniprogram-api-typings 从 2.11.0-1 升至 2.12.0 ([8d32448](https://github.com/vue-mini/vue-mini/commit/8d3244831797ed0553f1f36e19dbe041b2c492db))
- 锁定 @vue/reactivity 及 miniprogram-api-typings 的版本

### Bug 修复

- scheduler 应允许故意自我触发的副作用 ([5e9a2dd](https://github.com/vue-mini/vue-mini/commit/5e9a2dd6d078a972cd8262b465fb3a846470dcdc))

### 特性

- 导出 `proxyRefs` 函数，以及 `ShallowUnwrapRefs` 类型 ([bc51d68](https://github.com/vue-mini/vue-mini/commit/bc51d6882084ea96ead4906fa37d6af28da1b5ab))

# 0.1.0-rc.1 (2020-07-27)

### 依赖

- @vue/reactivity 从 3.0.0-beta.15 升至 3.0.0-rc.4 ([b8821b8](https://github.com/vue-mini/vue-mini/commit/b8821b8ea068ceedc9bdec6c2a6375c53d0c796f))

### Bug 修复

- 页面/组件销毁后不应再执行异步 watchers ([3efe44c](https://github.com/vue-mini/vue-mini/commit/3efe44c2da0b2ea770d49dcb1d4f17bcc997c690))
- 响应式数组侦听修复 ([6856e00](https://github.com/vue-mini/vue-mini/commit/6856e006ca601de8c9f4d6bd1386abc8666e5993))

### 特性

- 导出 `WritableComputedRef` 类型 ([9fa3626](https://github.com/vue-mini/vue-mini/commit/9fa3626429f889145c97ddc049b8d05d12210268))
- 导出 `DeepReadonly` 类型 ([f970958](https://github.com/vue-mini/vue-mini/commit/f970958be7155f97e70cc4273f32358b8dafaf7f))

### 性能优化

- 优化队列任务执行性能 ([4a67044](https://github.com/vue-mini/vue-mini/commit/4a67044b6b290b219409cc04ec735e670bde8810))

# 0.1.0-beta.5 (2020-06-27)

### 依赖

- @vue/reactivity 从 3.0.0-beta.14 升至 3.0.0-beta.15
- miniprogram-api-typings 从 2.11.0 升至 2.11.0-1
