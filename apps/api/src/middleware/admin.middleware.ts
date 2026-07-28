import { Response, NextFunction } from 'express'
import { AuthRequest }            from './auth.middleware'
import { sendError }              from '../utils/apiResponse'
import { PrismaClient }           from '@prisma/client'

const prisma = new PrismaClient()

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user!.userId },
      select: { role: true },
    })

    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return sendError(res, 'Admin access required', 403)
    }

    next()
  } catch {
    return sendError(res, 'Authorization failed', 500)
  }
}

export async function requireSuperAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user!.userId },
      select: { role: true },
    })

    if (!user || user.role !== 'SUPERADMIN') {
      return sendError(res, 'Super admin access required', 403)
    }

    next()
  } catch {
    return sendError(res, 'Authorization failed', 500)
  }
}
