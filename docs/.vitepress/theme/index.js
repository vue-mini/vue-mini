import 'vitepress/dist/client/theme-default/styles/vars.css'
import 'vitepress/dist/client/theme-default/styles/layout.css'
import 'vitepress/dist/client/theme-default/styles/code.css'
import 'vitepress/dist/client/theme-default/styles/custom-blocks.css'
import 'vitepress/dist/client/theme-default/styles/sidebar-links.css'

import NotFound from 'vitepress/dist/client/theme-default/NotFound.vue'
import Layout from './layout.vue'

export default {
  Layout,
  NotFound,
  enhanceApp() {
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      const adScript = document.createElement('script')
      adScript.async = true
      adScript.src = 'https://cdn.wwads.cn/js/makemoney.js'
      document.body.append(adScript)
    }
  },
}
