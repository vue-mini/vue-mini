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
      analyticsScript.setAttribute(
        'data-cf-beacon',
        '{"token": "860f4aaff387460faaf6c4a62ffa8a63"}'
      )
      document.body.append(analyticsScript)
    }
  },
}
