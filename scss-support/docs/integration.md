# SCSS 集成指南

本指南展示如何在现有的 Vue Mini 项目中添加 SCSS 支持。

## 1. 安装依赖

```bash
pnpm add -D sass
```

## 2. 修改 build.js

### 2.1 添加 sass 导入

在文件顶部添加：

```javascript
const sass = require('sass');
```

### 2.2 更新 processStyle 函数

```javascript
async function processStyle(filePath, origin = localPath) {
  let source = await fs.readFile(filePath, 'utf8');
  
  // 如果是 SCSS 文件，先编译为 CSS
  if (filePath.endsWith('.scss')) {
    try {
      const result = sass.compileString(source, {
        loadPaths: [
          path.dirname(filePath),
          path.resolve('src'),
          path.resolve('src/styles')
        ],
        style: __PROD__ ? 'compressed' : 'expanded',
      });
      source = result.css;
    } catch (error) {
      console.error(`Failed to compile SCSS ${filePath}`);
      
      if (__PROD__) throw error;
      
      console.error(error);
      return;
    }
  }
  
  // ... 继续 PostCSS 处理
}
```

### 2.3 更新文件处理逻辑

在 `dev()` 和 `prod()` 函数中：

```javascript
// 匹配 SCSS 文件
if (/\.(less|scss|css)$/.test(filePath)) {
  await processStyle(filePath);
  return;
}

// 不复制 SCSS 源文件到 dist 目录
if (!filePath.endsWith('.scss')) {
  await fs.copy(filePath, filePath.replace('src', 'dist'));
}
```

### 2.4 更新样式重编译逻辑

```javascript
function recompileStyles() {
  const watcher = chokidar.watch([
    'src/**/*.less',
    'src/**/*.scss',
    'src/**/*.css',
    '!src/styles/**/*'
  ]);
  // ...
}
```

## 3. Sass 编译选项说明

### loadPaths
模块查找路径，按顺序查找：
- 当前文件目录
- 项目 src 目录
- styles 目录

### style
输出样式格式：
- `expanded` - 开发模式，格式化输出
- `compressed` - 生产模式，压缩输出

## 4. 使用示例

### 定义变量 (_variables.scss)

```scss
$primary-color: #07c160;
$spacing-md: 24rpx;
```

### 定义 Mixin (_mixins.scss)

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### 页面样式 (index.scss)

```scss
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.container {
  padding: $spacing-md;
  
  .header {
    @include flex-center;
    background: $primary-color;
  }
}
```

## 5. 注意事项

1. **使用 Dart Sass**：确保安装的是 `sass` 包而非 `node-sass`
2. **模块系统**：推荐使用 `@use` 替代 `@import`
3. **单位**：使用 rpx 而非 px
4. **兼容性**：保持对 CSS 和 Less 的向后兼容

## 6. 常见问题

### Q: SCSS 文件没有被编译？
- 检查文件扩展名是否为 `.scss`
- 确认文件路径在监听范围内
- 查看控制台是否有编译错误

### Q: @use 导入报错？
- 确保使用的是 Dart Sass
- 检查导入路径是否正确
- 确认被导入文件存在

### Q: 如何调试编译错误？
- 开发模式会显示详细错误信息
- 生产模式会抛出错误中断构建
- 使用 `console.error` 输出调试信息