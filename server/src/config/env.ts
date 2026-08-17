// Loads and validates environment variables ONCE at startup.
// If something required is missing, we crash immediately with a clear message
// instead of hitting a confusing error deep in the app later.
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DEFAULT_STUDENT_PASSWORD: z.string().min(4).default('school123'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  // Pretty-print what's wrong and stop the server from starting.
  console.error('❌ Invalid environment variables:')
  console.error(z.treeifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'
