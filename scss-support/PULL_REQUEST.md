# 为 Vue Mini 项目添加 SCSS 支持
# Add SCSS support for Vue Mini projects

## 📋 概述
## 📋 Summary

本 PR 为 Vue Mini 项目添加了完整的 SCSS 支持，让开发者能够使用现代 CSS 预处理器的强大功能，同时保持对现有 CSS 和 Less 文件的完全向后兼容。
This PR adds comprehensive SCSS support to Vue Mini projects, allowing developers to use modern CSS preprocessing features while maintaining full backward compatibility with existing CSS and Less files.

## ✨ 主要特性
## ✨ Key Features

- 🚀 **零配置** - 只需安装 `sass` 依赖即可使用
- 🚀 **Zero Configuration** - Just install `sass` dependency and start using
- 🔄 **向后兼容** - 保持对 CSS/Less 文件的完全支持
- 🔄 **Backward Compatible** - Maintains full support for CSS/Less files  
- 📦 **完整模板** - 提供包含 SCSS 示例的项目模板
- 📦 **Complete Template** - Provides project template with SCSS examples
- 📚 **详尽文档** - 包含集成指南和迁移指南
- 📚 **Comprehensive Docs** - Includes integration and migration guides
- ⚡ **性能优化** - 开发模式易读，生产模式自动压缩
- ⚡ **Performance Optimized** - Readable in dev, compressed in production

## 🔧 实现方式
## 🔧 Implementation

### 1. 构建脚本修改
### 1. Build Script Modifications

在 `build.js` 中添加 SCSS 编译支持：
Added SCSS compilation support in `build.js`:

```javascript
// 添加 sass 模块导入
// Import sass module
const sass = require('sass');

// 在 processStyle 函数中添加 SCSS 处理
// Add SCSS processing in processStyle function
if (filePath.endsWith('.scss')) {
  const result = sass.compileString(source, {
    loadPaths: [path.dirname(filePath), 'src', 'src/styles'],
    style: __PROD__ ? 'compressed' : 'expanded',
  });
  source = result.css;
}
```

### 2. 文件结构
### 2. File Structure

```
scss-support/
├── README.md              # 主说明文档 / Main documentation
├── template/              # 模板项目 / Template project
│   ├── build.js          # 构建脚本 / Build script
│   ├── package.json      # 依赖配置 / Dependencies
│   └── src/              # 示例代码 / Example code
│       ├── styles/       # SCSS 样式 / SCSS styles
│       └── pages/        # 页面示例 / Page examples
└── docs/                  # 文档 / Documentation
    ├── integration.md    # 集成指南 / Integration guide
    └── migration.md      # 迁移指南 / Migration guide
```

## 🎯 为什么需要 SCSS？
## 🎯 Why SCSS?

许多开发者更偏好使用 SCSS，因为：
Many developers prefer SCSS because:

- 更强大的功能（模块系统、内置函数、更好的嵌套语法）
- More powerful features (module system, built-in functions, better nesting)
- 活跃的开发和社区支持
- Active development and community support
- 更符合现代 Web 开发实践
- Better alignment with modern web development practices
- 与流行的 UI 框架兼容性更好
- Better compatibility with popular UI frameworks

## 📖 使用示例
## 📖 Usage Example

```scss
// 定义变量 / Define variables
$primary-color: #07c160;
$spacing-md: 24rpx;

// 定义 Mixin / Define mixin
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// 使用 / Usage
.container {
  padding: $spacing-md;
  
  .header {
    @include flex-center;
    background: $primary-color;
  }
}
```

## 🧪 测试方法
## 🧪 How to Test

```bash
# 1. 进入模板目录
# 1. Navigate to template directory
cd scss-support/template

# 2. 安装依赖
# 2. Install dependencies
pnpm install

# 3. 运行开发构建
# 3. Run development build
pnpm dev

# 4. 运行生产构建
# 4. Run production build
pnpm build
```

## 💔 破坏性变更
## 💔 Breaking Changes

无。此功能完全向后兼容，不影响现有项目。
None. This feature is fully backward compatible and does not affect existing projects.

## ✅ 检查清单
## ✅ Checklist

- [x] 代码遵循项目风格指南 / Code follows project style guidelines
- [x] 已完成自我审查 / Self-review completed
- [x] 已添加/更新文档 / Documentation added/updated
- [x] 更改向后兼容 / Changes are backward compatible
- [x] 已在开发和生产模式下测试 / Tested in dev and production modes
- [x] 已提供示例代码 / Example code provided

## 🔮 未来计划
## 🔮 Future Plans

- 在 `create-vue-mini` 中添加 SCSS 选项
- Add SCSS option in `create-vue-mini`
- 支持全局变量自动注入
- Support automatic global variables injection
- 添加 Source Maps 支持
- Add Source Maps support

## 📚 相关链接
## 📚 Related Links

- [Sass 官方文档 / Sass Documentation](https://sass-lang.com/documentation)
- [Vue Mini 文档 / Vue Mini Documentation](https://vuemini.org)

---

感谢您的审阅！如有任何问题或建议，欢迎在评论中提出。
Thank you for reviewing! Feel free to leave any questions or suggestions in the comments.