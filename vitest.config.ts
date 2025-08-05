import { fileURLToPath } from 'node:url'
import type { ViteUserConfig } from 'vitest/config'
import { defineConfig } from 'vitest/config'

const config: ViteUserConfig = defineConfig({
  define: {
    __DEV__: true,
  },
  resolve: {
    alias: {
      '@vue-mini/core': fileURLToPath(
        new URL('packages/core/src', import.meta.url),
      ),
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

export default config
