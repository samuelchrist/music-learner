import { Response }    from 'express'
import { prisma }      from '../config/database'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middleware/auth.middleware'

export async function getProgress(req: AuthRequest, res: Response) {
  try {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: req.user!.userId },
      include: { lesson: { select: { name:true, instrument:true, difficulty:true } } }
    })
    return sendSuccess(res, {
      progress,
      stats: {
        totalCompleted: progress.filter(p => p.completed).length,
        totalUnlocked:  progress.filter(p => p.unlocked).length,
        totalAttempts:  progress.reduce((s, p) => s + p.attempts, 0),
        byInstrument: {
          piano:  progress.filter(p => p.lesson.instrument === 'piano').length,
          guitar: progress.filter(p => p.lesson.instrument === 'guitar').length,
          drums:  progress.filter(p => p.lesson.instrument === 'drums').length
        }
      }
    })
  } catch { return sendError(res, 'Failed to fetch progress', 500) }
}
