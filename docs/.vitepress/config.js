import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-cmn-Hans',
  title: 'Vue Mini',
  description: '基于 Vue 3 的小程序框架',
  head: [['link', { rel: 'icon', href: '/logo.png' }]],
  themeConfig: {
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vue-mini/vue-mini' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Yang Mingshan',
    },
    nav: [
      {
        text: '指南',
        link: '/guide/',
        activeMatch: '/guide/',
      },
      {
        text: 'AI 百科（英文）',
        link: 'https://deepwiki.com/vue-mini/vue-mini',
      },
    ],
    sidebar: [
      {
        text: '简介',
        link: '/guide/',
      },
      {
        text: '快速上手',
        link: '/guide/quick-start',
      },
      {
        text: '基础',
        items: [
          { text: '创建小程序', link: '/guide/app' },
          { text: '定义页面', link: '/guide/page' },
          { text: '定义组件', link: '/guide/component' },
          { text: '定义页面组件', link: '/guide/page-component' },
          { text: '依赖注入', link: '/guide/provide-inject' },
          { text: 'Pinia (试验)', link: '/guide/pinia' },
        ],
      },
      {
        text: '深入理解',
        items: [
          { text: '兼容性', link: '/guide/compatibility' },
          { text: '比较', link: '/guide/comparisons' },
          { text: '性能', link: '/guide/performance' },
          { text: '常见问题', link: '/guide/faq' },
          { text: '版本发布', link: '/guide/releases' },
        ],
      },
      {
        text: '案例',
        link: '/guide/cases',
      },
      {
        text: '社群',
        link: '/guide/community',
      },
      {
        text: '赞助',
        link: '/guide/sponsor',
      },
    ],
    outline: {
      label: '本页目录',
    },
    docFooter: {
      prev: '前一篇',
      next: '下一篇',
    },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索',
          },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '重置搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '无相关结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '向上箭头',
              navigateDownKeyAriaLabel: '向下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'esc',
            },
          },
        },
      },
    },
  },
})
