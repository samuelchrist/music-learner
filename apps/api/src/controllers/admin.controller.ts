import { Response }    from 'express'
import { PrismaClient, Plan, Role } from '@prisma/client'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middleware/auth.middleware'
import {
  upgradePlan,
  cancelSubscription,
  unlockLessonsForPlan
} from '../services/subscription.service'

const prisma = new PrismaClient()

// ── Get all users ─────────────────────────────────────────────
export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const { page = '1', limit = '20', search } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { email:    { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take:    parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, username: true,
          role: true, totalXP: true, level: true,
          streak: true, createdAt: true,
          subscription: {
            select: { plan: true, status: true, endDate: true }
          },
          _count: {
            select: { progress: true, scores: true }
          }
        },
      }),
      prisma.user.count({ where }),
    ])

    return sendSuccess(res, {
      users,
      pagination: {
        total,
        page:       parseInt(page as string),
        limit:      parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (e) {
    return sendError(res, 'Failed to fetch users', 500)
  }
}

// ── Get single user ───────────────────────────────────────────
export async function getUser(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where:   { id: req.params.id },
      include: {
        subscription: true,
        _count: { select: { progress: true, scores: true } },
      },
    })
    if (!user) return sendError(res, 'User not found', 404)
    const { passwordHash: _, ...safe } = user
    return sendSuccess(res, safe)
  } catch {
    return sendError(res, 'Failed to fetch user', 500)
  }
}

// ── Update user role ──────────────────────────────────────────
export async function updateUserRole(req: AuthRequest, res: Response) {
  try {
    const { role } = req.body
    if (!Object.values(Role).includes(role)) {
      return sendError(res, 'Invalid role', 400)
    }
    const user = await prisma.user.update({
      where:  { id: req.params.id },
      data:   { role },
      select: { id: true, username: true, email: true, role: true },
    })
    return sendSuccess(res, user, `Role updated to ${role}`)
  } catch {
    return sendError(res, 'Failed to update role', 500)
  }
}

// ── Update subscription ───────────────────────────────────────
export async function updateSubscription(req: AuthRequest, res: Response) {
  try {
    const { plan, action } = req.body
    const userId = req.params.id

    if (action === 'cancel') {
      await cancelSubscription(userId)
      return sendSuccess(res, null, 'Subscription cancelled')
    }

    if (!Object.values(Plan).includes(plan)) {
      return sendError(res, 'Invalid plan', 400)
    }

    await upgradePlan(userId, plan, 'admin-override')
    return sendSuccess(res, null, `Plan upgraded to ${plan}`)
  } catch {
    return sendError(res, 'Failed to update subscription', 500)
  }
}

// ── Lock / Unlock specific lesson ────────────────────────────
export async function setLessonAccess(req: AuthRequest, res: Response) {
  try {
    const { userId, lessonId, unlocked } = req.body

    await prisma.lessonProgress.upsert({
      where:  { userId_lessonId: { userId, lessonId } },
      update: { unlocked },
      create: { userId, lessonId, unlocked },
    })

    return sendSuccess(
      res, null,
      `Lesson ${unlocked ? 'unlocked' : 'locked'} for user`
    )
  } catch {
    return sendError(res, 'Failed to update lesson access', 500)
  }
}

// ── Bulk unlock for user ──────────────────────────────────────
export async function bulkUnlockLessons(req: AuthRequest, res: Response) {
  try {
    const { userId, grade, instrument } = req.body

    const where: any = {}
    if (grade)      where.grade      = grade
    if (instrument) where.instrument = instrument

    const lessons = await prisma.lesson.findMany({ where })

    for (const lesson of lessons) {
      await prisma.lessonProgress.upsert({
        where:  { userId_lessonId: { userId, lessonId: lesson.id } },
        update: { unlocked: true },
        create: { userId, lessonId: lesson.id, unlocked: true },
      })
    }

    return sendSuccess(
      res, null,
      `Unlocked ${lessons.length} lessons for user`
    )
  } catch {
    return sendError(res, 'Failed to bulk unlock', 500)
  }
}

// ── Get dashboard stats ───────────────────────────────────────
export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      totalLessons,
      totalScores,
      planBreakdown,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.lesson.count(),
      prisma.score.count(),
      prisma.subscription.groupBy({
        by:     ['plan'],
        _count: { plan: true },
        where:  { status: 'ACTIVE' },
      }),
      prisma.user.findMany({
        take:    5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, email: true,
          createdAt: true,
          subscription: { select: { plan: true } },
        },
      }),
    ])

    const revenue = planBreakdown.reduce((sum, p) => {
      const prices: Record<string, number> = { FREE: 0, BASIC: 4.99, PRO: 9.99 }
      return sum + (prices[p.plan] || 0) * p._count.plan
    }, 0)

    return sendSuccess(res, {
      stats: {
        totalUsers,
        activeSubscriptions,
        totalLessons,
        totalScores,
        estimatedMonthlyRevenue: revenue.toFixed(2),
      },
      planBreakdown,
      recentUsers,
    })
  } catch {
    return sendError(res, 'Failed to fetch stats', 500)
  }
}

// ── Update lesson required plan ───────────────────────────────
export async function updateLessonPlan(req: AuthRequest, res: Response) {
  try {
    const { requiredPlan, grade } = req.body

    if (!Object.values(Plan).includes(requiredPlan)) {
      return sendError(res, 'Invalid plan', 400)
    }

    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data:  { requiredPlan, grade },
    })

    return sendSuccess(res, lesson, 'Lesson updated')
  } catch {
    return sendError(res, 'Failed to update lesson', 500)
  }
}
