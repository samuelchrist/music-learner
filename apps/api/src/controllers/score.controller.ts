import { Response }    from 'express'
import { prisma }      from '../config/database'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middleware/auth.middleware'
import { UNLOCK_THRESHOLD, XP_REWARDS, getGrade, getLevelFromXP } from '@music-learner/shared'

export async function submitScore(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId
    const { lessonId, noteAccuracy, timingAccuracy, rhythmScore, overall, hits, misses, totalNotes, bpmPlayed } = req.body
    const grade  = getGrade(overall)
    const score  = await prisma.score.create({
      data: { userId, lessonId, noteAccuracy, timingAccuracy, rhythmScore, overall, grade, hits, misses, totalNotes, bpmPlayed }
    })
    const existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } }
    })
    const isNewBest = !existing?.bestScore || overall > existing.bestScore
    await prisma.lessonProgress.upsert({
      where:  { userId_lessonId: { userId, lessonId } },
      update: { completed: overall >= UNLOCK_THRESHOLD, bestScore: isNewBest ? overall : existing?.bestScore, attempts: { increment: 1 }, lastPlayed: new Date() },
      create: { userId, lessonId, unlocked: true, completed: overall >= UNLOCK_THRESHOLD, bestScore: overall, attempts: 1, lastPlayed: new Date() }
    })
    let unlocked = false
    if (overall >= UNLOCK_THRESHOLD) {
      const cur  = await prisma.lesson.findUnique({ where: { id: lessonId } })
      const next = cur ? await prisma.lesson.findFirst({ where: { instrument: cur.instrument, order: cur.order + 1 } }) : null
      if (next) {
        await prisma.lessonProgress.upsert({
          where:  { userId_lessonId: { userId, lessonId: next.id } },
          update: { unlocked: true },
          create: { userId, lessonId: next.id, unlocked: true }
        })
        unlocked = true
      }
    }
    let xpGained = XP_REWARDS.COMPLETE
    if (overall >= 95)           xpGained += XP_REWARDS.PERFECT
    if (!existing?.attempts)     xpGained += XP_REWARDS.FIRST_TRY
    const updated = await prisma.user.update({
      where: { id: userId }, data: { totalXP: { increment: xpGained }, level: getLevelFromXP((await prisma.user.findUnique({ where: { id: userId }, select: { totalXP: true } }))!.totalXP + xpGained) }
    })
    return sendSuccess(res, { score, unlocked, xpGained, grade })
  } catch (e) { return sendError(res, 'Failed to submit score', 500) }
}

export async function getScores(req: AuthRequest, res: Response) {
  try {
    const scores = await prisma.score.findMany({
      where: { userId: req.user!.userId, ...(req.query.lessonId ? { lessonId: req.query.lessonId as string } : {}) },
      orderBy: { createdAt: 'desc' }, take: 20,
      include: { lesson: { select: { name: true, instrument: true } } }
    })
    return sendSuccess(res, scores)
  } catch { return sendError(res, 'Failed to fetch scores', 500) }
}
