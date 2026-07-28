import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users   = await prisma.user.findMany()
  const lessons = await prisma.lesson.findMany()

  console.log(`Unlocking all ${lessons.length} lessons for ${users.length} users...`)

  for (const user of users) {
    for (const lesson of lessons) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: { userId: user.id, lessonId: lesson.id }
        },
        update: { unlocked: true },
        create: {
          userId:    user.id,
          lessonId:  lesson.id,
          unlocked:  true,
          completed: false,
          attempts:  0,
        }
      })
    }
    console.log(`  ✓ All lessons unlocked for ${user.username}`)
  }

  console.log('\n✅ All lessons unlocked!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
