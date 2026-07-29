import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('password123', 10)
  await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: { passwordHash: hash },
    create: {
      email: 'test@test.com',
      username: 'testuser',
      passwordHash: hash,
      plan: 'PRO'
    }
  })
  console.log('✅ Test user created')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
