import { PrismaClient } from '@prisma/client'
import { env } from './env'

const g = global as unknown as { prisma: PrismaClient }
export const prisma = g.prisma || new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query','error','warn'] : ['error']
})
if (env.NODE_ENV !== 'production') g.prisma = prisma

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
  } catch (e) {
    console.error('❌ DB connection failed:', e)
    process.exit(1)
  }
}
