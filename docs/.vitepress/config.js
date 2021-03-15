"use strict";

module.exports = {
  lang: "zh-cmn-Hans",
  title: "Vue Mini",
  description: "像写 Vue 3 一样写小程序",
  head: [["link", { rel: "icon", href: "/logo.png" }]],
  themeConfig: {
    repo: "vue-mini/vue-mini",
    docsDir: "docs",
    editLinks: true,
    editLinkText: "在 GitHub 上编辑此页",
    nav: [
      {
        text: "指南",
        link: "/guide/",
        activeMatch: "^/guide/",
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "介绍",
          link: "/guide/",
        },
        {
          text: "安装",
          link: "/guide/installation",
        },
        {
          text: "基础",
          children: [
            { text: "创建小程序", link: "/guide/app" },
            { text: "定义页面", link: "/guide/page" },
            { text: "定义组件", link: "/guide/component" },
            { text: "定义页面组件", link: "/guide/page-component" },
            { text: "依赖注入", link: "/guide/provide-inject" },
            { text: "兼容性", link: "/guide/compatibility" },
          ],
        },
      ],
    },
  },
};
