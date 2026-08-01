import { PrismaClient, PlanTier, Role } from '@prisma/client'

const prisma = new PrismaClient()

// ── Plan rules ──────────────────────────────────────────────────
export const PLAN_RANK: Record<PlanTier, number> = {
  FREE:  0,
  BASIC: 1,
  PRO:   2,
}

export const PLAN_PRICES: Record<PlanTier, number> = {
  FREE:  0,
  BASIC: 4.99,
  PRO:   9.99,
}

export const PLAN_NAMES: Record<PlanTier, string> = {
  FREE:  'Free',
  BASIC: 'Basic',
  PRO:   'Pro',
}

// ── Get user plan ─────────────────────────────────────────────
export async function getUserPlan(userId: string): Promise<PlanTier> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return PlanTier.FREE

  // Admins get full access
  if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
    return PlanTier.PRO
  }

  return user.plan
}

// ── Check if user can access lesson ──────────────────────────
export async function canAccessLesson(
  userId:   string,
  lessonId: string
): Promise<{ allowed: boolean; reason?: string; requiredPlan?: PlanTier }> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { allowed: false, reason: 'User not found' }

  // Admins always have access
  if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
    return { allowed: true }
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) return { allowed: false, reason: 'Lesson not found' }

  const userPlan = await getUserPlan(userId)

  if (PLAN_RANK[userPlan] < PLAN_RANK[lesson.requiredPlan]) {
    return {
      allowed:      false,
      reason:       `This lesson requires the ${PLAN_NAMES[lesson.requiredPlan]} plan`,
      requiredPlan: lesson.requiredPlan,
    }
  }

  return { allowed: true }
}

// ── Upgrade plan ────────────────────────────────────────────────
export async function upgradePlan(userId: string, plan: PlanTier): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { plan } })

  // Unlock all lessons for the new plan
  await unlockLessonsForPlan(userId, plan)
}

// ── Cancel plan (revert to Free) ────────────────────────────────
export async function cancelSubscription(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { plan: PlanTier.FREE } })
}

// ── Unlock lessons based on plan ────────────────────────────────
export async function unlockLessonsForPlan(
  userId: string,
  plan:   PlanTier
): Promise<void> {
  const allowedRank = PLAN_RANK[plan]
  const allowedPlans = (Object.keys(PLAN_RANK) as PlanTier[])
    .filter(p => PLAN_RANK[p] <= allowedRank)

  // Get all lessons this plan tier grants access to
  const lessons = await prisma.lesson.findMany({
    where: { requiredPlan: { in: allowedPlans } },
  })

  // Unlock first lesson per instrument and all lessons after a completed one
  for (const lesson of lessons) {
    const isFirst = lesson.order === 1

    const prevLesson = await prisma.lesson.findFirst({
      where: { instrument: lesson.instrument, order: lesson.order - 1 },
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
