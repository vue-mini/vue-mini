'use strict'

module.exports = {
  locales: {
    '/': {
      lang: 'zh-cmn-Hans',
    },
  },
  title: 'Vue Mini',
  description: '像写 Vue 3 一样写小程序',
  head: [['link', { rel: 'icon', href: '/logo.png' }]],
  themeConfig: {
    repo: 'vue-mini/vue-mini',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    nav: [
      {
        text: '指南',
        link: '/guide/',
      },
    ],
    sidebar: {
      '/guide/': [
        '/guide/',
        '/guide/installation',
        {
          title: '基础',
          collapsable: false,
          children: [
            '/guide/app',
            '/guide/page',
            '/guide/component',
            '/guide/page-component',
            '/guide/compatibility',
          ],
        },
      ],
    },
  },
}
