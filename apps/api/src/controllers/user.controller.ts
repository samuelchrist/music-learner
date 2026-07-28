import { Response }    from 'express'
import { prisma }      from '../config/database'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middleware/auth.middleware'

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user!.userId },
      select: { id:true, email:true, username:true, avatar:true, totalXP:true, level:true, streak:true, createdAt:true }
    })
    if (!user) return sendError(res, 'User not found', 404)
    return sendSuccess(res, user)
  } catch { return sendError(res, 'Failed', 500) }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.update({
      where:  { id: req.user!.userId },
      data:   req.body,
      select: { id:true, email:true, username:true, avatar:true }
    })
    return sendSuccess(res, user, 'Updated')
  } catch { return sendError(res, 'Failed', 500) }
}
