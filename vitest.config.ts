import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: 'verbose',
    coverage: {
      provider: 'v8',
    },
    setupFiles: ['./test/setup.ts'],
  },
})
