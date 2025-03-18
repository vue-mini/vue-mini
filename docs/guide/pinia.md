# Pinia 使用指南

在 Vue Mini 项目中可以使用 Pinia 进行状态管理

## 1. 安装

```bash
pnpm add @vue-mini/pinia pinia-mini-plugin-persistor
```

## 2. 注册

### 2.1 创建 Pinia 实例 (src/store/index.ts)

```typescript
import { createPinia } from '@vue-mini/pinia'
import persistor from 'pinia-mini-plugin-persistor'

// 创建 pinia 实例
export const pinia = createPinia()

// 使用持久化插件
pinia.use(persistor)
```

### 2.2 在 app.ts 中引入 Pinia (src/app.ts)

```typescript
import { createApp } from '@vue-mini/core'
import './store/index'

createApp(() => {
  console.log('App Launched!')
})
```

## 3. 定义 Store (src/store/user.ts)

使用 `defineStore` 函数创建 Store， 仅支持 Composition API：

https://pinia.vuejs.org/core-concepts/#Setup-Stores

```typescript
import { computed, ref } from '@vue-mini/core'
import { defineStore } from '@vue-mini/pinia'

// 定义 store
export const useUserStore = defineStore(
  'user',
  () => {
    // state (使用 ref)
    const username = ref('')

    // getters (使用 computed)
    const isSetUsername = computed(() => {
      return !!username.value
    })

    // actions (使用 function)
    function updateUsername(username: string) {
      username.value = username
    }

    // 没有 $reset，需要自己实现
    function reset() {
      username.value = ''
      // 重置其他状态...
    }

    // 返回状态和方法
    return {
      // state
      username,
      // getters
      isSetUsername,
      // actions
      updateUsername,
      reset,
    }
  },
  {
    // 持久化配置
    persist: true,
  }
)
```

## 4. 在页面中使用 Store (src/pages/mine/index.ts)

```typescript
import { definePage, ref } from '@vue-mini/core'
import { storeToRefs } from '@vue-mini/pinia'
import { useUserStore } from '../../store/user'

definePage(() => {
  // 1. 获取 store 实例
  const userStore = useUserStore()

  // 2. 使用 storeToRefs 获取响应式状态
  const { username, isSetUsername } = storeToRefs(userStore)

  // 3. 从 store 中获取方法
  const { updateUsername, reset: userReset } = userStore

  // 4. 在页面中使用 store 的方法
  const handleUsernameChange = (event: any) => {
    updateUsername(event.detail.value)
  }

  const handleReset = () => {
    userReset()
    wx.showToast({
      title: '已重置',
      icon: 'success',
    })
  }

  // 5. 返回页面需要的数据和方法
  return {
    username,
    isSetUsername,
    handleReset,
  }
})
```

## 5. 注意事项

1. Vue Mini Pinia 相较于原版 Pinia 有两点限制：

   - 不支持创建多个 pinia 实例，也就是不可以多次调用 createPinia()
   - 仅支持组合式 API 风格的 Store 定义

2. 使用 `storeToRefs` 可以保持状态的响应性，直接解构 store 会丢失响应性

3. 在 Vue Mini 中，Store 的状态变更会自动触发页面更新，无需额外的操作

4. 持久化配置可以简单使用 `persist: true`，也可以使用更详细的配置来控制哪些状态需要持久化
