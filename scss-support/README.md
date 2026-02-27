# Vue Mini SCSS 支持扩展

本目录包含了为 Vue Mini 小程序框架添加 SCSS 支持的完整方案。

## 📁 目录结构

```
scss-support/
├── README.md              # 本文件
├── template/              # 支持 SCSS 的模板项目
│   ├── build.js          # 修改后的构建脚本
│   ├── package.json      # 包含 sass 依赖
│   └── src/              # 示例代码
└── docs/                  # 文档
    ├── integration.md    # 集成指南
    └── migration.md      # 迁移指南
```

## 🚀 快速开始

### 1. 复制模板

将 `template/` 目录下的内容复制到你的项目中。

### 2. 安装依赖

```bash
pnpm add -D sass
```

### 3. 使用 SCSS

创建 `.scss` 文件并像平常一样使用：

```scss
// 使用变量
$primary: #07c160;

// 使用嵌套
.container {
  padding: 20rpx;
  
  .header {
    background: $primary;
  }
}

// 使用 Mixin
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.box {
  @include flex-center;
}
```

## ✨ 特性

- ✅ 零配置，开箱即用
- ✅ 完整 SCSS 特性支持
- ✅ 向后兼容 CSS/Less
- ✅ 自动优化（开发/生产模式）
- ✅ 支持模块化导入

## 📚 详细文档

- [集成指南](./docs/integration.md) - 如何在现有项目中添加 SCSS 支持
- [迁移指南](./docs/migration.md) - 从 Less 迁移到 SCSS

## 🤝 贡献

欢迎提交 Issue 和 PR！