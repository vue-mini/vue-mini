import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    __DEV__: true,
  },
  resolve: {
    alias: {
      '@vue-mini/core': 'packages/core/src/index.ts',
    },
  },
  test: {
    watch: false,
    globals: true,
    setupFiles: 'vitest.setup.ts',
    include: ['packages/**/__tests__/**/*.spec.ts'],
    sequence: {
      hooks: 'list',
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'json'],
      include: ['packages/*/src/**/*.ts', '!packages/*/src/index.ts'],
    },
  },
})
