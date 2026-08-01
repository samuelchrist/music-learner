import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.log('Usage: npx tsx src/prisma/make-admin.ts your@email.com')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data:  { role: 'SUPERADMIN', plan: 'PRO' },
    select: { id: true, email: true, username: true, role: true, plan: true },
  })

  // Unlock all lessons
  const lessons = await prisma.lesson.findMany()
  for (const lesson of lessons) {
    await prisma.lessonProgress.upsert({
      where:  { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      update: { unlocked: true },
      create: { userId: user.id, lessonId: lesson.id, unlocked: true },
    })
  }

  console.log(`✅ ${user.username} is now SUPERADMIN with PRO plan`)
  console.log(`   All ${lessons.length} lessons unlocked`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
