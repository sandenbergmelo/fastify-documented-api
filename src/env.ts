import { z } from 'zod'

const envSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
  DATABASE_URL: z.url(),
  PORT: z
    .string()
    .transform((value) => Number(value))
    .optional()
    .default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),
})

export const env = envSchema.parse(process.env)
