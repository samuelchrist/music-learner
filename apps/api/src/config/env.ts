import { z } from 'zod'
import dotenv from 'dotenv'
dotenv.config()

const envSchema = z.object({
  NODE_ENV:               z.enum(['development','production','test']).default('development'),
  PORT:                   z.string().default('5000'),
  DATABASE_URL:           z.string(),
  JWT_SECRET:             z.string().min(10),
  JWT_REFRESH_SECRET:     z.string().min(10),
  JWT_EXPIRES_IN:         z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL:             z.string().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid env vars:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}
export const env = parsed.data
