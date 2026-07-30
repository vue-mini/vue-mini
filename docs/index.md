---
layout: home

title: Vue Mini
titleTemplate: 基于 Vue 的小程序框架

hero:
  name: Vue Mini
  text: 基于 Vue 的小程序框架
  tagline: 简单，强大，高性能。为你和 AI 打造。
  image:
    src: /logo-with-shadow.png
    alt: Vue Mini
  actions:
    - theme: brand
      text: 开始
      link: /guide/
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/vue-mini/vue-mini

features:
  - icon: 📝
    title: 响应式
    details: 只需要更改数据，视图便会自动更新，不再需要 setData。
  - icon: 🧩
    title: 组合式
    details: 组合式 API 赋予你最灵活的代码编写方式，以及最强大的代码抽象能力。
  - icon: 👣
    title: 渐进式
    details: 与小程序原生语法完全兼容，你可以渐进的采用，无需大规模重写。
  - icon: 🤏
    title: 小巧
    details: Gzip 后仅 8KB，不会占用你宝贵的小程序空间。
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  --vp-home-hero-image-background-image: linear-gradient(0deg, #42d39280 50%, #34485e80);
  --vp-home-hero-image-filter: blur(40px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(72px);
  }
}
</style>
