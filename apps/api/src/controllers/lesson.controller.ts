import { Response }    from 'express'
import { prisma }      from '../config/database'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middleware/auth.middleware'

export async function getLessons(req: AuthRequest, res: Response) {
  try {
    const { instrument } = req.query
    const userId = req.user!.userId
    const lessons = await prisma.lesson.findMany({
      where: instrument ? { instrument: instrument as string } : {},
      orderBy: [{ instrument: 'asc' }, { order: 'asc' }]
    })
    const progress    = await prisma.lessonProgress.findMany({ where: { userId } })
    const progressMap = new Map(progress.map(p => [p.lessonId, p]))
    return sendSuccess(res, lessons.map(l => ({
      ...l, progress: progressMap.get(l.id) || { unlocked:false, completed:false, bestScore:null, attempts:0, lastPlayed:null }
    })))
  } catch { return sendError(res, 'Failed to fetch lessons', 500) }
}

export async function getLessonById(req: AuthRequest, res: Response) {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id } })
    if (!lesson) return sendError(res, 'Lesson not found', 404)
    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: req.user!.userId, lessonId: req.params.id } }
    })
    return sendSuccess(res, { ...lesson, progress })
  } catch { return sendError(res, 'Failed to fetch lesson', 500) }
}
