# 从 Less 迁移到 SCSS

本指南帮助你将现有的 Less 样式迁移到 SCSS。

## 语法对比

### 变量

**Less:**
```less
@primary-color: #07c160;
@spacing: 24rpx;

.element {
  color: @primary-color;
  padding: @spacing;
}
```

**SCSS:**
```scss
$primary-color: #07c160;
$spacing: 24rpx;

.element {
  color: $primary-color;
  padding: $spacing;
}
```

### Mixin

**Less:**
```less
.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  .flex-center();
}
```

**SCSS:**
```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  @include flex-center;
}
```

### 参数化 Mixin

**Less:**
```less
.border-radius(@radius: 4rpx) {
  border-radius: @radius;
}

.box {
  .border-radius(8rpx);
}
```

**SCSS:**
```scss
@mixin border-radius($radius: 4rpx) {
  border-radius: $radius;
}

.box {
  @include border-radius(8rpx);
}
```

### 嵌套

两者语法相同：

```scss
.container {
  padding: 20rpx;
  
  .header {
    background: #fff;
    
    &.active {
      background: #f0f0f0;
    }
  }
}
```

### 导入

**Less:**
```less
@import "variables";
@import "mixins";
```

**SCSS (推荐):**
```scss
@use 'variables' as *;
@use 'mixins' as *;
```

或使用命名空间：

```scss
@use 'variables' as vars;

.element {
  color: vars.$primary-color;
}
```

## 迁移步骤

### 1. 准备工作

1. 安装 sass 依赖
2. 更新 build.js 支持 SCSS
3. 确保构建脚本同时支持 Less 和 SCSS

### 2. 迁移变量文件

创建 `_variables.scss`：

```scss
// 从 variables.less 迁移
$primary-color: #07c160;
$text-color: #333333;
$spacing-sm: 16rpx;
$spacing-md: 24rpx;
```

### 3. 迁移 Mixin 文件

创建 `_mixins.scss`：

```scss
// 从 mixins.less 迁移
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin text-ellipsis($lines: 1) {
  overflow: hidden;
  text-overflow: ellipsis;
  @if $lines == 1 {
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
  }
}
```

### 4. 迁移页面样式

逐个将 `.less` 文件重命名为 `.scss` 并更新语法：

```bash
# 批量重命名（谨慎使用）
find src -name "*.less" -exec sh -c 'mv "$1" "${1%.less}.scss"' _ {} \;
```

### 5. 更新导入语句

在所有 SCSS 文件中更新导入：

```scss
// 旧的 Less 导入
// @import '../../styles/variables';

// 新的 SCSS 导入
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;
```

## 自动化迁移工具

可以使用简单的脚本辅助迁移：

```javascript
// migrate-to-scss.js
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// 转换 Less 语法到 SCSS
function convertLessToScss(content) {
  return content
    // 变量
    .replace(/@(\w+):/g, '$$1:')
    .replace(/@(\w+)/g, '$$1')
    // Mixin 定义
    .replace(/\.(\w+)\s*\(\s*\)/g, '@mixin $1')
    .replace(/\.(\w+)\s*\(([^)]+)\)/g, '@mixin $1($2)')
    // Mixin 调用
    .replace(/\.([\w-]+)\s*\(\s*\);/g, '@include $1;')
    .replace(/\.([\w-]+)\s*\(([^)]+)\);/g, '@include $1($2);');
}

// 处理文件
async function migrateFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const converted = convertLessToScss(content);
  const newPath = filePath.replace('.less', '.scss');
  await fs.writeFile(newPath, converted);
  await fs.remove(filePath);
  console.log(`Migrated: ${filePath} -> ${newPath}`);
}

// 批量迁移
glob('src/**/*.less', async (err, files) => {
  for (const file of files) {
    await migrateFile(file);
  }
});
```

## 注意事项

1. **函数差异**：SCSS 使用内置模块
   ```scss
   @use 'sass:math';
   width: math.div(100%, 3);
   ```

2. **字符串插值**：
   - Less: `~"@{variable}"`
   - SCSS: `#{$variable}`

3. **转义**：
   - Less: `~'value'`
   - SCSS: `unquote('value')`

4. **颜色函数**：
   ```scss
   @use 'sass:color';
   background: color.adjust($primary, $lightness: 20%);
   ```

## 验证迁移

迁移完成后：

1. 运行构建确认无错误
2. 检查生成的 WXSS 文件
3. 在小程序开发工具中测试样式
4. 对比迁移前后的视觉效果

## 渐进式迁移

如果项目较大，可以逐步迁移：

1. 先迁移公共样式文件
2. 逐个迁移页面样式
3. 最后迁移组件样式
4. 完成后移除 Less 依赖