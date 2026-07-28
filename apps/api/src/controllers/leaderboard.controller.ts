import { Request, Response } from 'express'
import { prisma }             from '../config/database'
import { sendSuccess, sendError } from '../utils/apiResponse'

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      take: parseInt(req.query.limit as string || '20'),
      orderBy: { totalXP: 'desc' },
      select: { id:true, username:true, avatar:true, totalXP:true, level:true }
    })
    return sendSuccess(res, users.map((u, i) => ({ ...u, rank: i + 1 })))
  } catch { return sendError(res, 'Failed', 500) }
}
