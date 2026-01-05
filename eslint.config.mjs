import baseConfig from '@rocketseat/eslint-config/node.mjs'
import drizzle from 'eslint-plugin-drizzle'
import importNewLines from 'eslint-plugin-import-newlines'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['src/database/migrations'],
    extends: [baseConfig],
    plugins: {
      'import-newlines': importNewLines,
      drizzle,
    },
    rules: {
      'no-empty-pattern': 'off',
      'import-newlines/enforce': ['warn', { items: 40, 'max-len': 80 }],
      ...drizzle.configs.recommended.rules,
    },
  },
])
