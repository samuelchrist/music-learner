import { PrismaClient } from '@prisma/client'
import { seedPianoLessons } from './piano-lessons'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  await seedPianoLessons()
  console.log('✅ Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
