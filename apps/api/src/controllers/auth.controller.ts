import { Request, Response }                          from 'express'
import { prisma }                                     from '../config/database'
import { hashPassword, comparePassword }              from '../utils/bcrypt'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { sendSuccess, sendError }                     from '../utils/apiResponse'
import { logger }                                     from '../config/logger'

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password } = req.body
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) return sendError(res, 'Email or username already exists', 409)

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, username, passwordHash },
      select: { id:true, email:true, username:true, totalXP:true, level:true, streak:true, createdAt:true }
    })

    const firstLessons = await prisma.lesson.findMany({ where: { order: 1 } })
    await prisma.lessonProgress.createMany({
      data: firstLessons.map(l => ({ userId: user.id, lessonId: l.id, unlocked: true }))
    })

    const accessToken  = signAccessToken({ userId: user.id, email: user.email })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email })
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
    })
    return sendSuccess(res, { user, accessToken, refreshToken }, 'Account created', 201)
  } catch (e) { logger.error('Register:' + e); return sendError(res, 'Registration failed', 500) }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return sendError(res, 'Invalid credentials', 401)
    if (!await comparePassword(password, user.passwordHash)) return sendError(res, 'Invalid credentials', 401)

    const accessToken  = signAccessToken({ userId: user.id, email: user.email })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email })
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) }
    })
    const { passwordHash: _, ...safe } = user
    return sendSuccess(res, { user: safe, accessToken, refreshToken })
  } catch (e) { return sendError(res, 'Login failed', 500) }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return sendError(res, 'No refresh token', 401)
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) return sendError(res, 'Invalid refresh token', 401)
    const payload    = verifyRefreshToken(refreshToken)
    const accessToken = signAccessToken({ userId: payload.userId, email: payload.email })
    return sendSuccess(res, { accessToken })
  } catch { return sendError(res, 'Token refresh failed', 401) }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    return sendSuccess(res, null, 'Logged out')
  } catch { return sendError(res, 'Logout failed', 500) }
}
