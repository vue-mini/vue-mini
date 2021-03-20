import defaultTheme from 'vitepress/theme'

export default {
  ...defaultTheme,
  enhanceApp() {
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      const analyticsScript = document.createElement('script')
      analyticsScript.defer = true
      analyticsScript.src =
        'https://static.cloudflareinsights.com/beacon.min.js'
      analyticsScript.dataset.cfBeacon = `{"token": "${
        location.hostname === 'vue-mini.github.io'
          ? '860f4aaff387460faaf6c4a62ffa8a63'
          : '3ee00252b4e1416e9f2e9379d35bf113'
      }"}`
      document.body.append(analyticsScript)
    }
  },
}
