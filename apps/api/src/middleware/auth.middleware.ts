import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { sendError }         from '../utils/apiResponse'

export interface AuthRequest extends Request {
  user?: { userId: string; email: string }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return sendError(res, 'No token', 401)
    req.user = verifyAccessToken(header.split(' ')[1])
    next()
  } catch { return sendError(res, 'Invalid token', 401) }
}
