import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📚 Updating lesson grades and required plans...\n')

  const lessons = await prisma.lesson.findMany()

  for (const lesson of lessons) {
    const match = lesson.slug.match(/-g(\d)-/)
    const grade = match ? parseInt(match[1]) : 1

    const requiredPlan =
      grade <= 1 ? 'FREE'  :
      grade <= 3 ? 'BASIC' : 'PRO'

    await prisma.lesson.update({
      where: { id: lesson.id },
      data:  { grade, requiredPlan },
    })

    console.log(`  ✓ ${lesson.slug.padEnd(12)} grade=${grade} plan=${requiredPlan}`)
  }

  console.log(`\n✅ Updated ${lessons.length} lessons`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
