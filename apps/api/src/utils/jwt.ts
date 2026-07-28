import jwt from 'jsonwebtoken'
import { env } from '../config/env'

interface Payload { userId: string; email: string }

export const signAccessToken  = (p: Payload) =>
  jwt.sign(p, env.JWT_SECRET,         { expiresIn: env.JWT_EXPIRES_IN } as any)
export const signRefreshToken = (p: Payload) =>
  jwt.sign(p, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as any)
export const verifyAccessToken  = (t: string) =>
  jwt.verify(t, env.JWT_SECRET)         as Payload
export const verifyRefreshToken = (t: string) =>
  jwt.verify(t, env.JWT_REFRESH_SECRET) as Payload
