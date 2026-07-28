import { PrismaClient, Plan, Role } from '@prisma/client'

const prisma = new PrismaClient()

// ── Plan access rules ─────────────────────────────────────────
export const PLAN_ACCESS: Record<Plan, number[]> = {
  FREE:  [1],           // Grade 1 only
  BASIC: [1, 2, 3],    // Grade 1-3
  PRO:   [1, 2, 3, 4, 5], // All grades
}

export const PLAN_PRICES: Record<Plan, number> = {
  FREE:  0,
  BASIC: 4.99,
  PRO:   9.99,
}

export const PLAN_NAMES: Record<Plan, string> = {
  FREE:  'Free',
  BASIC: 'Basic',
  PRO:   'Pro',
}

// ── Get user plan ─────────────────────────────────────────────
export async function getUserPlan(userId: string): Promise<Plan> {
  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: { subscription: true },
  })

  if (!user) return Plan.FREE

  // Admins get full access
  if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
    return Plan.PRO
  }

  // Check subscription
  const sub = user.subscription
  if (!sub || sub.status !== 'ACTIVE') return Plan.FREE
  if (sub.endDate && sub.endDate < new Date()) return Plan.FREE

  return sub.plan
}

// ── Check if user can access lesson ──────────────────────────
export async function canAccessLesson(
  userId:   string,
  lessonId: string
): Promise<{ allowed: boolean; reason?: string; requiredPlan?: Plan }> {
  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: { subscription: true },
  })

  if (!user) return { allowed: false, reason: 'User not found' }

  // Admins always have access
  if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
    return { allowed: true }
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) return { allowed: false, reason: 'Lesson not found' }

  const userPlan   = await getUserPlan(userId)
  const allowedGrades = PLAN_ACCESS[userPlan]

  if (!allowedGrades.includes(lesson.grade)) {
    return {
      allowed:      false,
      reason:       `This lesson requires ${PLAN_NAMES[lesson.requiredPlan]} plan`,
      requiredPlan: lesson.requiredPlan,
    }
  }

  return { allowed: true }
}

// ── Upgrade subscription ──────────────────────────────────────
export async function upgradePlan(
  userId:    string,
  plan:      Plan,
  paymentRef?: string
): Promise<void> {
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)

  await prisma.subscription.upsert({
    where:  { userId },
    update: {
      plan,
      status:     'ACTIVE',
      startDate:  new Date(),
      endDate,
      paymentRef: paymentRef || null,
      autoRenew:  true,
    },
    create: {
      userId,
      plan,
      status:     'ACTIVE',
      startDate:  new Date(),
      endDate,
      paymentRef: paymentRef || null,
      autoRenew:  true,
    },
  })

  // Unlock all lessons for the new plan
  await unlockLessonsForPlan(userId, plan)
}

// ── Cancel subscription ───────────────────────────────────────
export async function cancelSubscription(userId: string): Promise<void> {
  await prisma.subscription.update({
    where:  { userId },
    data:   { status: 'CANCELLED', autoRenew: false },
  })
}

// ── Unlock lessons based on plan ──────────────────────────────
export async function unlockLessonsForPlan(
  userId: string,
  plan:   Plan
): Promise<void> {
  const allowedGrades = PLAN_ACCESS[plan]

  // Get all lessons for allowed grades
  const lessons = await prisma.lesson.findMany({
    where: { grade: { in: allowedGrades } },
  })

  // Unlock first lesson per instrument per grade
  // and all previously completed ones
  for (const lesson of lessons) {
    const isFirst = lesson.order === 1

    // Check if previous lesson completed
    const prevLesson = await prisma.lesson.findFirst({
      where: {
        instrument: lesson.instrument,
        order:      lesson.order - 1,
        grade:      lesson.grade,
      },
    })

    let shouldUnlock = isFirst

    if (prevLesson) {
      const prevProgress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: { userId, lessonId: prevLesson.id }
        },
      })
      if (prevProgress?.completed) shouldUnlock = true
    }

    if (shouldUnlock) {
      await prisma.lessonProgress.upsert({
        where:  { userId_lessonId: { userId, lessonId: lesson.id } },
        update: { unlocked: true },
        create: { userId, lessonId: lesson.id, unlocked: true },
      })
    }
  }
}
