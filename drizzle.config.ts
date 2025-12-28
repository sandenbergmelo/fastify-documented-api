import { defineConfig } from 'drizzle-kit'
import { env } from './src/env.ts'

export default defineConfig({
  out: './src/database/migrations',
  schema: './src/database/schema/**',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: 'snake_case',
})
