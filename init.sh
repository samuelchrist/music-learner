#!/bin/bash

echo "🎵 Music Learner — Full Auto Setup"
echo "==================================="

# ── Create directories ────────────────────────────────────────
mkdir -p apps/web/public
mkdir -p apps/web/src/assets/{fonts,images,sounds}
mkdir -p apps/web/src/components/ui/{Button,Modal,Card,Badge,Input,LoadingSpinner}
mkdir -p apps/web/src/components/layout/{Navbar,Sidebar,Footer,PageWrapper}
mkdir -p apps/web/src/components/practice/{PianoRoll,DrumPad,GuitarFretboard,NoteSequence,Metronome,FeedbackFlash,Countdown}
mkdir -p apps/web/src/components/lessons/{LessonCard,LessonList,LessonFilter,LessonProgress}
mkdir -p apps/web/src/components/score/{ScoreBoard,ScoreBreakdown,GradeDisplay,Leaderboard}
mkdir -p apps/web/src/components/auth/{LoginForm,RegisterForm,ProtectedRoute}
mkdir -p apps/web/src/components/dashboard/{StatsCard,ProgressChart,RecentActivity,StreakTracker}
mkdir -p apps/web/src/pages/{Home,Dashboard,Practice,Lessons,Profile,Leaderboard,Settings,NotFound}
mkdir -p apps/web/src/pages/Auth/{Login,Register}
mkdir -p apps/web/src/lib/{midi,audio,scoring,utils}
mkdir -p apps/web/src/{hooks,store,services,types,constants,router,styles}
mkdir -p apps/api/src/{config,controllers,middleware,routes,services,validators,types,utils}
mkdir -p apps/api/src/prisma/migrations
mkdir -p apps/api/src/sockets/handlers
mkdir -p packages/shared/src/{types,constants,utils}
mkdir -p packages/midi-core/src
mkdir -p docker
mkdir -p .github/workflows

echo "✅ Directories created"

# ═══════════════════════════════════════════════════════════════
# HELPER FUNCTION — writes file content
# Usage: write_file "path/to/file" << 'EOF'
# ...content...
# EOF
# ═══════════════════════════════════════════════════════════════
write_file() { cat > "$1"; echo "  ✓ $1"; }

echo ""
echo "📝 Writing root files..."

# ── ROOT: package.json ────────────────────────────────────────
write_file "package.json" << 'EOF'
{
  "name": "music-learner",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/*","packages/*"],
  "scripts": {
    "dev":        "turbo run dev",
    "build":      "turbo run build",
    "test":       "turbo run test",
    "lint":       "turbo run lint",
    "clean":      "turbo run clean",
    "db:migrate": "turbo run db:migrate",
    "db:seed":    "turbo run db:seed"
  },
  "devDependencies": {
    "turbo":      "^1.13.0",
    "typescript": "^5.3.0",
    "prettier":   "^3.2.0",
    "@types/node":"^20.0.0"
  },
  "engines": { "node": ">=20.0.0" }
}
EOF

# ── ROOT: turbo.json ──────────────────────────────────────────
write_file "turbo.json" << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build":      { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev":        { "cache": false, "persistent": true },
    "test":       { "dependsOn": ["build"] },
    "lint":       { "outputs": [] },
    "clean":      { "cache": false },
    "db:migrate": { "cache": false },
    "db:seed":    { "cache": false }
  }
}
EOF

# ── ROOT: .env.example ────────────────────────────────────────
write_file ".env.example" << 'EOF'
DATABASE_URL="postgresql://postgres:password@localhost:5432/musiclearner"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
EOF

# ── ROOT: .gitignore ──────────────────────────────────────────
write_file ".gitignore" << 'EOF'
node_modules/
dist/
build/
.env
.env.local
.turbo/
*.log
.DS_Store
coverage/
apps/api/src/prisma/dev.db
EOF

# ── ROOT: docker-compose.yml ──────────────────────────────────
write_file "docker-compose.yml" << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: musiclearner_db
    environment:
      POSTGRES_DB: musiclearner
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL","pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
volumes:
  postgres_data:
  redis_data:
EOF

echo ""
echo "📝 Writing packages/shared..."

write_file "packages/shared/package.json" << 'EOF'
{
  "name": "@music-learner/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": { "build": "tsc", "clean": "rm -rf dist" },
  "devDependencies": { "typescript": "^5.3.0" }
}
EOF

write_file "packages/shared/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
EOF

write_file "packages/shared/src/types/index.ts" << 'EOF'
export type Instrument = 'piano' | 'guitar' | 'drums'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
export type Grade      = 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F'

export interface User {
  id: string; email: string; username: string; avatar?: string
  createdAt: string; updatedAt: string; streak: number
  totalXP: number; level: number
}

export interface Note {
  note: number; beat: number; duration: number
  label: string; isRest: boolean
}

export interface Lesson {
  id: string; name: string; description: string
  instrument: Instrument; difficulty: Difficulty
  bpm: number; notes: Note[]; order: number; xpReward: number
}

export interface ScoreResult {
  noteAccuracy: number; timingAccuracy: number
  rhythmScore: number; overall: number; grade: Grade
  hits: number; misses: number; totalNotes: number
}

export interface LessonProgress {
  lessonId: string; userId: string; unlocked: boolean
  completed: boolean; bestScore: number | null
  attempts: number; lastPlayed: string | null
}

export interface ApiResponse<T> {
  success: boolean; data?: T; error?: string; message?: string
}

export interface AuthTokens { accessToken: string; refreshToken: string }

export interface LoginPayload    { email: string; password: string }
export interface RegisterPayload { email: string; username: string; password: string }

export interface LeaderboardEntry {
  rank: number; userId: string; username: string
  avatar?: string; totalScore: number; level: number
}
EOF

write_file "packages/shared/src/constants/index.ts" << 'EOF'
export const TIMING_WINDOWS = {
  PERFECT: 80, GOOD: 200, OK: 350, MAX: 500
} as const

export const SCORE_WEIGHTS = {
  NOTE_ACCURACY: 0.50, TIMING: 0.35, RHYTHM: 0.15
} as const

export const XP_REWARDS = {
  COMPLETE: 100, PERFECT: 250, FIRST_TRY: 50
} as const

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000, 6500
]

export const UNLOCK_THRESHOLD = 60

export const KEYBOARD_MAP: Record<string, number> = {
  a:60, s:62, d:64, f:65, g:67, h:69, j:71, k:72,
  w:61, e:63, t:66, y:68, u:70,
  '1':36,'2':38,'3':42,'4':46,'5':50,'6':47,'7':45,'8':49
}
EOF

write_file "packages/shared/src/utils/index.ts" << 'EOF'
import type { Grade } from '../types'
import { LEVEL_THRESHOLDS } from '../constants'

export function getGrade(score: number): Grade {
  if (score >= 95) return 'S'
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

export function getLevelFromXP(xp: number): number {
  let level = 0
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i
    else break
  }
  return level
}

export function midiToNoteName(midi: number): string {
  if (midi === 0) return '—'
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}
EOF

write_file "packages/shared/src/index.ts" << 'EOF'
export * from './types'
export * from './constants'
export * from './utils'
EOF

echo ""
echo "📝 Writing apps/api..."

write_file "apps/api/package.json" << 'EOF'
{
  "name": "@music-learner/api",
  "version": "1.0.0",
  "scripts": {
    "dev":        "tsx watch src/server.ts",
    "build":      "tsc",
    "start":      "node dist/server.js",
    "lint":       "eslint src/",
    "clean":      "rm -rf dist",
    "db:migrate": "prisma migrate dev",
    "db:seed":    "tsx src/prisma/seed.ts",
    "db:studio":  "prisma studio"
  },
  "dependencies": {
    "@music-learner/shared": "*",
    "@prisma/client":        "^5.9.0",
    "bcryptjs":              "^2.4.3",
    "cors":                  "^2.8.5",
    "express":               "^4.18.2",
    "express-rate-limit":    "^7.1.5",
    "helmet":                "^7.1.0",
    "jsonwebtoken":          "^9.0.2",
    "morgan":                "^1.10.0",
    "socket.io":             "^4.6.1",
    "winston":               "^3.11.0",
    "zod":                   "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs":    "^2.4.6",
    "@types/cors":        "^2.8.17",
    "@types/express":     "^4.17.21",
    "@types/jsonwebtoken":"^9.0.5",
    "@types/morgan":      "^1.9.9",
    "@types/node":        "^20.0.0",
    "prisma":             "^5.9.0",
    "tsx":                "^4.7.0",
    "typescript":         "^5.3.0"
  }
}
EOF

write_file "apps/api/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": { "@music-learner/shared": ["../../packages/shared/src"] }
  },
  "include": ["src"]
}
EOF

write_file "apps/api/.env.example" << 'EOF'
DATABASE_URL="postgresql://postgres:password@localhost:5432/musiclearner"
JWT_SECRET="change-this-secret"
JWT_REFRESH_SECRET="change-this-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EOF

write_file "apps/api/src/config/env.ts" << 'EOF'
import { z } from 'zod'
import dotenv from 'dotenv'
dotenv.config()

const envSchema = z.object({
  NODE_ENV:               z.enum(['development','production','test']).default('development'),
  PORT:                   z.string().default('5000'),
  DATABASE_URL:           z.string(),
  JWT_SECRET:             z.string().min(10),
  JWT_REFRESH_SECRET:     z.string().min(10),
  JWT_EXPIRES_IN:         z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL:             z.string().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid env vars:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}
export const env = parsed.data
EOF

write_file "apps/api/src/config/database.ts" << 'EOF'
import { PrismaClient } from '@prisma/client'
import { env } from './env'

const g = global as unknown as { prisma: PrismaClient }
export const prisma = g.prisma || new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query','error','warn'] : ['error']
})
if (env.NODE_ENV !== 'production') g.prisma = prisma

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
  } catch (e) {
    console.error('❌ DB connection failed:', e)
    process.exit(1)
  }
}
EOF

write_file "apps/api/src/config/cors.ts" << 'EOF'
import { CorsOptions } from 'cors'
import { env } from './env'
export const corsOptions: CorsOptions = {
  origin: [env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}
EOF

write_file "apps/api/src/config/logger.ts" << 'EOF'
import winston from 'winston'
import { env } from './env'
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console()]
})
EOF

write_file "apps/api/src/utils/jwt.ts" << 'EOF'
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
EOF

write_file "apps/api/src/utils/bcrypt.ts" << 'EOF'
import bcrypt from 'bcryptjs'
export const hashPassword    = (p: string) => bcrypt.hash(p, 12)
export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h)
EOF

write_file "apps/api/src/utils/apiResponse.ts" << 'EOF'
import { Response } from 'express'
export const sendSuccess = <T>(res: Response, data: T, message?: string, status = 200) =>
  res.status(status).json({ success: true, data, message })
export const sendError = (res: Response, error: string, status = 400) =>
  res.status(status).json({ success: false, error })
EOF

write_file "apps/api/src/middleware/auth.middleware.ts" << 'EOF'
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
EOF

write_file "apps/api/src/middleware/errorHandler.middleware.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express'
import { logger }       from '../config/logger'
import { sendError }    from '../utils/apiResponse'

export function errorHandler(err: Error, req: Request, res: Response, _: NextFunction) {
  logger.error(err.message)
  return sendError(res, err.message || 'Internal server error', 500)
}
EOF

write_file "apps/api/src/middleware/rateLimit.middleware.ts" << 'EOF'
import rateLimit from 'express-rate-limit'
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { success: false, error: 'Too many attempts' }
})
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 100,
  message: { success: false, error: 'Too many requests' }
})
EOF

write_file "apps/api/src/controllers/auth.controller.ts" << 'EOF'
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
EOF

write_file "apps/api/src/controllers/lesson.controller.ts" << 'EOF'
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
EOF

write_file "apps/api/src/controllers/score.controller.ts" << 'EOF'
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
EOF

write_file "apps/api/src/controllers/progress.controller.ts" << 'EOF'
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
EOF

write_file "apps/api/src/controllers/user.controller.ts" << 'EOF'
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
EOF

write_file "apps/api/src/controllers/leaderboard.controller.ts" << 'EOF'
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
EOF

write_file "apps/api/src/routes/auth.routes.ts" << 'EOF'
import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/auth.controller'
import { authLimiter } from '../middleware/rateLimit.middleware'
const r = Router()
r.post('/register', authLimiter, register)
r.post('/login',    authLimiter, login)
r.post('/refresh',  refresh)
r.post('/logout',   logout)
export default r
EOF

write_file "apps/api/src/routes/lesson.routes.ts" << 'EOF'
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getLessons, getLessonById } from '../controllers/lesson.controller'
const r = Router()
r.use(authenticate)
r.get('/', getLessons); r.get('/:id', getLessonById)
export default r
EOF

write_file "apps/api/src/routes/score.routes.ts" << 'EOF'
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { submitScore, getScores } from '../controllers/score.controller'
const r = Router()
r.use(authenticate)
r.post('/', submitScore); r.get('/', getScores)
export default r
EOF

write_file "apps/api/src/routes/progress.routes.ts" << 'EOF'
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getProgress }  from '../controllers/progress.controller'
const r = Router()
r.use(authenticate); r.get('/', getProgress)
export default r
EOF

write_file "apps/api/src/routes/user.routes.ts" << 'EOF'
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getMe, updateProfile } from '../controllers/user.controller'
const r = Router()
r.use(authenticate); r.get('/me', getMe); r.patch('/me', updateProfile)
export default r
EOF

write_file "apps/api/src/routes/leaderboard.routes.ts" << 'EOF'
import { Router } from 'express'
import { getLeaderboard } from '../controllers/leaderboard.controller'
const r = Router()
r.get('/', getLeaderboard)
export default r
EOF

write_file "apps/api/src/routes/index.ts" << 'EOF'
import { Router } from 'express'
import auth        from './auth.routes'
import users       from './user.routes'
import lessons     from './lesson.routes'
import progress    from './progress.routes'
import scores      from './score.routes'
import leaderboard from './leaderboard.routes'
const r = Router()
r.use('/auth',        auth)
r.use('/users',       users)
r.use('/lessons',     lessons)
r.use('/progress',    progress)
r.use('/scores',      scores)
r.use('/leaderboard', leaderboard)
export default r
EOF

write_file "apps/api/src/sockets/index.ts" << 'EOF'
import { Server }     from 'socket.io'
import { Server as Http } from 'http'
import { env }        from '../config/env'
import { logger }     from '../config/logger'

export function initSockets(http: Http) {
  const io = new Server(http, { cors: { origin: env.CLIENT_URL } })
  io.on('connection', socket => {
    logger.info(`Socket: ${socket.id}`)
    socket.on('join-session', (uid: string) => socket.join(`user:${uid}`))
    socket.on('score-submitted', data => io.emit('leaderboard-update', data))
    socket.on('disconnect', () => logger.info(`Disconnected: ${socket.id}`))
  })
  return io
}
EOF

write_file "apps/api/src/app.ts" << 'EOF'
import express    from 'express'
import cors       from 'cors'
import helmet     from 'helmet'
import morgan     from 'morgan'
import { corsOptions }  from './config/cors'
import { apiLimiter }   from './middleware/rateLimit.middleware'
import { errorHandler } from './middleware/errorHandler.middleware'
import routes           from './routes'

const app = express()
app.use(helmet(), cors(corsOptions), apiLimiter)
app.use(express.json({ limit: '10mb' }), express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.use('/api/v1', routes)
app.use(errorHandler)
export default app
EOF

write_file "apps/api/src/server.ts" << 'EOF'
import { createServer } from 'http'
import app              from './app'
import { connectDB }    from './config/database'
import { env }          from './config/env'
import { logger }       from './config/logger'
import { initSockets }  from './sockets'

async function main() {
  await connectDB()
  const server = createServer(app)
  initSockets(server)
  server.listen(env.PORT, () => logger.info(`🚀 http://localhost:${env.PORT}`))
}
main().catch(e => { logger.error(e); process.exit(1) })
EOF

write_file "apps/api/src/prisma/schema.prisma" << 'EOF'
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  username     String    @unique
  passwordHash String
  avatar       String?
  totalXP      Int       @default(0)
  level        Int       @default(1)
  streak       Int       @default(0)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  progress      LessonProgress[]
  scores        Score[]
  refreshTokens RefreshToken[]
  @@map("users")
}
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields:[userId], references:[id], onDelete:Cascade)
  @@map("refresh_tokens")
}
model Lesson {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  instrument  String
  difficulty  String
  bpm         Int
  order       Int
  xpReward    Int      @default(100)
  notes       Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  progress    LessonProgress[]
  scores      Score[]
  @@map("lessons")
}
model LessonProgress {
  id         String    @id @default(cuid())
  userId     String
  lessonId   String
  unlocked   Boolean   @default(false)
  completed  Boolean   @default(false)
  bestScore  Float?
  attempts   Int       @default(0)
  lastPlayed DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  user       User      @relation(fields:[userId], references:[id], onDelete:Cascade)
  lesson     Lesson    @relation(fields:[lessonId], references:[id], onDelete:Cascade)
  @@unique([userId, lessonId])
  @@map("lesson_progress")
}
model Score {
  id             String   @id @default(cuid())
  userId         String
  lessonId       String
  noteAccuracy   Float
  timingAccuracy Float
  rhythmScore    Float
  overall        Float
  grade          String
  hits           Int
  misses         Int
  totalNotes     Int
  bpmPlayed      Int
  createdAt      DateTime @default(now())
  user           User     @relation(fields:[userId], references:[id], onDelete:Cascade)
  lesson         Lesson   @relation(fields:[lessonId], references:[id], onDelete:Cascade)
  @@map("scores")
}
EOF

echo ""
echo "📝 Writing apps/web..."

write_file "apps/web/package.json" << 'EOF'
{
  "name": "@music-learner/web",
  "version": "1.0.0",
  "scripts": {
    "dev":     "vite",
    "build":   "tsc && vite build",
    "preview": "vite preview",
    "lint":    "eslint src/",
    "clean":   "rm -rf dist"
  },
  "dependencies": {
    "@music-learner/shared": "*",
    "@tanstack/react-query": "^5.17.0",
    "axios":                 "^1.6.5",
    "clsx":                  "^2.1.0",
    "framer-motion":         "^11.0.0",
    "react":                 "^18.2.0",
    "react-dom":             "^18.2.0",
    "react-hot-toast":       "^2.4.1",
    "react-router-dom":      "^6.21.0",
    "recharts":              "^2.10.3",
    "socket.io-client":      "^4.6.1",
    "zustand":               "^4.4.7"
  },
  "devDependencies": {
    "@types/react":          "^18.2.48",
    "@types/react-dom":      "^18.2.18",
    "@vitejs/plugin-react":  "^4.2.1",
    "autoprefixer":          "^10.4.17",
    "postcss":               "^8.4.33",
    "tailwindcss":           "^3.4.1",
    "typescript":            "^5.3.0",
    "vite":                  "^5.0.11"
  }
}
EOF

write_file "apps/web/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020","DOM","DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@music-learner/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["src"]
}
EOF

write_file "apps/web/vite.config.ts" << 'EOF'
import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import path             from 'path'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } }
  }
})
EOF

write_file "apps/web/tailwind.config.ts" << 'EOF'
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f1a', surface: '#1a1a2e', surface2: '#16213e',
        accent: { DEFAULT: '#7c3aed', light: '#a855f7' },
        success: '#10b981', danger: '#ef4444', warning: '#f59e0b'
      }
    }
  },
  plugins: []
} satisfies Config
EOF

write_file "apps/web/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Music Learner</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

write_file "apps/web/src/styles/globals.css" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  body { @apply bg-bg text-slate-200 font-sans min-h-screen; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #1a1a2e; }
  ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 3px; }
}

@layer components {
  .btn-primary   { @apply bg-gradient-to-r from-accent to-accent-light text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50; }
  .btn-secondary { @apply bg-surface2 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg text-sm hover:border-accent-light transition-colors; }
  .btn-ghost     { @apply text-slate-400 px-3 py-2 rounded-lg text-sm hover:text-slate-200 hover:bg-surface transition-all; }
  .card          { @apply bg-surface border border-slate-800 rounded-xl p-5; }
  .input         { @apply w-full bg-surface2 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-accent-light transition-colors placeholder:text-slate-500; }
  .badge         { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold; }
  .badge-easy    { @apply bg-emerald-900/40 text-emerald-400; }
  .badge-medium  { @apply bg-amber-900/40 text-amber-400; }
  .badge-hard    { @apply bg-red-900/40 text-red-400; }
  .badge-expert  { @apply bg-purple-900/40 text-purple-400; }
}

.piano-key-white { width:36px; height:100px; background:#e8e8f0; border:1px solid #999; color:#444; font-size:10px; font-weight:700; @apply relative flex items-end justify-center pb-2 rounded-b-md cursor-pointer select-none transition-all; }
.piano-key-black { width:22px; height:64px; background:#1a1a2e; border:1px solid #555; color:#ccc; font-size:9px; @apply absolute flex items-end justify-center pb-1 rounded-b-md cursor-pointer select-none transition-all z-10; }
.piano-key-white.active   { background:#a855f7 !important; color:white; }
.piano-key-black.active   { background:#7c3aed !important; }
.piano-key-white.expected { background:rgba(124,58,237,.3) !important; border-color:#a855f7 !important; }
EOF

# ── Store files ───────────────────────────────────────────────
write_file "apps/web/src/store/authStore.ts" << 'EOF'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@music-learner/shared'

interface S {
  user: User|null; accessToken:string|null; refreshToken:string|null; isAuth:boolean
  setAuth:(u:User,a:string,r:string)=>void
  setTokens:(a:string,r:string)=>void
  logout:()=>void
  updateUser:(d:Partial<User>)=>void
}

export const useAuthStore = create<S>()(persist(set => ({
  user:null, accessToken:null, refreshToken:null, isAuth:false,
  setAuth:(user,accessToken,refreshToken) => set({user,accessToken,refreshToken,isAuth:true}),
  setTokens:(accessToken,refreshToken) => set({accessToken,refreshToken}),
  logout:() => set({user:null,accessToken:null,refreshToken:null,isAuth:false}),
  updateUser:data => set(s => ({user: s.user ? {...s.user,...data} : null}))
}), { name:'auth-storage' }))
EOF

write_file "apps/web/src/store/practiceStore.ts" << 'EOF'
import { create } from 'zustand'
import type { Lesson } from '@music-learner/shared'

type State = 'idle'|'countdown'|'playing'|'finished'

interface S {
  lesson:Lesson|null; sessionState:State; noteIndex:number
  bpm:number; metronomeOn:boolean; hits:number
  setLesson:(l:Lesson)=>void; setSessionState:(s:State)=>void
  setNoteIndex:(i:number)=>void; setBPM:(b:number)=>void
  toggleMetronome:()=>void; incrementHits:()=>void; reset:()=>void
}

export const usePracticeStore = create<S>()(set => ({
  lesson:null, sessionState:'idle', noteIndex:0, bpm:80, metronomeOn:false, hits:0,
  setLesson: l    => set({lesson:l, bpm:l.bpm}),
  setSessionState: s => set({sessionState:s}),
  setNoteIndex:    i => set({noteIndex:i}),
  setBPM:          b => set({bpm:b}),
  toggleMetronome: () => set(s => ({metronomeOn:!s.metronomeOn})),
  incrementHits:   () => set(s => ({hits:s.hits+1})),
  reset: () => set({sessionState:'idle', noteIndex:0, hits:0})
}))
EOF

write_file "apps/web/src/store/lessonStore.ts" << 'EOF'
import { create } from 'zustand'
import type { Instrument } from '@music-learner/shared'
interface S {
  lessons:any[]; selectedInstrument:Instrument|null
  setLessons:(l:any[])=>void; setInstrument:(i:Instrument)=>void
}
export const useLessonStore = create<S>()(set => ({
  lessons:[], selectedInstrument:null,
  setLessons:  l => set({lessons:l}),
  setInstrument: i => set({selectedInstrument:i})
}))
EOF

write_file "apps/web/src/store/settingsStore.ts" << 'EOF'
import { create }  from 'zustand'
import { persist } from 'zustand/middleware'
interface S {
  volume:number; keyboardEnabled:boolean; showNoteNames:boolean
  setVolume:(v:number)=>void; toggleKeyboard:()=>void; toggleNoteNames:()=>void
}
export const useSettingsStore = create<S>()(persist(set => ({
  volume:0.8, keyboardEnabled:true, showNoteNames:true,
  setVolume:       v => set({volume:v}),
  toggleKeyboard:  () => set(s => ({keyboardEnabled:!s.keyboardEnabled})),
  toggleNoteNames: () => set(s => ({showNoteNames:!s.showNoteNames}))
}), { name:'settings-storage' }))
EOF

write_file "apps/web/src/store/index.ts" << 'EOF'
export { useAuthStore }     from './authStore'
export { usePracticeStore } from './practiceStore'
export { useLessonStore }   from './lessonStore'
export { useSettingsStore } from './settingsStore'
EOF

# ── Services ──────────────────────────────────────────────────
write_file "apps/web/src/services/api.ts" << 'EOF'
import axios from 'axios'
import toast  from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({ baseURL:'/api/v1', timeout:10000 })

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(res => res, async error => {
  const orig = error.config
  if (error.response?.status === 401 && !orig._retry) {
    orig._retry = true
    try {
      const refresh = useAuthStore.getState().refreshToken
      const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken: refresh })
      useAuthStore.getState().setTokens(data.data.accessToken, refresh)
      orig.headers.Authorization = `Bearer ${data.data.accessToken}`
      return api(orig)
    } catch { useAuthStore.getState().logout(); window.location.href = '/login' }
  }
  toast.error(error.response?.data?.error || 'Something went wrong')
  return Promise.reject(error)
})

export default api
EOF

write_file "apps/web/src/services/auth.service.ts" << 'EOF'
import api from './api'
export const authService = {
  register: (d: any) => api.post('/auth/register', d),
  login:    (d: any) => api.post('/auth/login', d),
  logout:   (t: string) => api.post('/auth/logout', { refreshToken:t }),
  refresh:  (t: string) => api.post('/auth/refresh', { refreshToken:t })
}
EOF

write_file "apps/web/src/services/lesson.service.ts" << 'EOF'
import api from './api'
export const lessonService = {
  getAll:   (instrument?: string) => api.get('/lessons', { params: instrument ? { instrument } : {} }),
  getById:  (id: string) => api.get(`/lessons/${id}`)
}
EOF

write_file "apps/web/src/services/score.service.ts" << 'EOF'
import api from './api'
export const scoreService = {
  submit: (d: any) => api.post('/scores', d),
  getAll: (lessonId?: string) => api.get('/scores', { params: lessonId ? { lessonId } : {} })
}
EOF

write_file "apps/web/src/services/progress.service.ts" << 'EOF'
import api from './api'
export const progressService = { getAll: () => api.get('/progress') }
EOF

write_file "apps/web/src/services/user.service.ts" << 'EOF'
import api from './api'
export const userService = {
  getMe:         () => api.get('/users/me'),
  updateProfile: (d: any) => api.patch('/users/me', d)
}
EOF

# ── Constants ─────────────────────────────────────────────────
write_file "apps/web/src/constants/routes.ts" << 'EOF'
export const ROUTES = {
  HOME:        '/',
  LOGIN:       '/login',
  REGISTER:    '/register',
  DASHBOARD:   '/dashboard',
  LESSONS:     '/lessons',
  PRACTICE:    (id: string) => `/practice/${id}`,
  PROFILE:     '/profile',
  LEADERBOARD: '/leaderboard',
  SETTINGS:    '/settings'
} as const
EOF

write_file "apps/web/src/constants/midiNotes.ts" << 'EOF'
export const NOTE: Record<string,number> = {
  C3:48,D3:50,E3:52,F3:53,G3:55,A3:57,B3:59,
  C4:60,D4:62,E4:64,F4:65,G4:67,A4:69,B4:71,
  C5:72,D5:74,E5:76,F5:77,G5:79,A5:81,B5:83,
  Cs4:61,Ds4:63,Fs4:66,Gs4:68,As4:70,
  Cs5:73,Ds5:75,Fs5:78,Gs5:80,As5:82
}
export const DRUM: Record<string,number> = {
  KICK:36,SNARE:38,HIHAT:42,OHAT:46,CLAP:39,
  TOM_HI:50,TOM_MD:47,TOM_LO:45,CRASH:49,RIDE:51
}
export const midiToName = (m: number) => {
  if(m===0) return '—'
  const n=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return `${n[m%12]}${Math.floor(m/12)-1}`
}
export const midiToFreq = (m: number) => 440*Math.pow(2,(m-69)/12)
EOF

write_file "apps/web/src/constants/drumMap.ts" << 'EOF'
export const DRUM_NAMES: Record<number,string> = {
  36:'KICK',38:'SNARE',42:'HH',46:'OHH',39:'CLAP',
  50:'TOM1',47:'TOM2',45:'TOM3',49:'CRASH',51:'RIDE'
}
export const DRUM_COLORS: Record<number,string> = {
  36:'#ef4444',38:'#f59e0b',42:'#3b82f6',46:'#60a5fa',
  50:'#10b981',47:'#34d399',45:'#6ee7b7',49:'#a855f7',51:'#8b5cf6'
}
EOF

# ── Lib files ─────────────────────────────────────────────────
write_file "apps/web/src/lib/midi/MidiManager.ts" << 'EOF'
type CB = (note:number, velocity:number) => void
class MM {
  private access: MIDIAccess|null=null; private inputs: MIDIInput[]=[]
  private onCb: CB|null=null; private offCb: CB|null=null; private _conn=false

  async init() {
    if(!navigator.requestMIDIAccess) return false
    try {
      this.access = await navigator.requestMIDIAccess({sysex:false})
      this.setup(); this.access.onstatechange=()=>this.setup(); return this._conn
    } catch { return false }
  }
  private setup() {
    this.inputs=[]
    this.access?.inputs.forEach(i => { i.onmidimessage=this.msg.bind(this); this.inputs.push(i) })
    this._conn = this.inputs.length>0
  }
  private msg(e: MIDIMessageEvent) {
    const [s,n,v]=Array.from(e.data), c=s&0xf0
    if(c===0x90&&v>0) this.onCb?.(n,v)
    else if(c===0x80||(c===0x90&&v===0)) this.offCb?.(n,0)
  }
  onNoteOn(cb:CB)  { this.onCb=cb }
  onNoteOff(cb:CB) { this.offCb=cb }
  get connected()  { return this._conn }
  get deviceName() { return this.inputs[0]?.name||null }
}
export const MidiManager = new MM()
EOF

write_file "apps/web/src/lib/midi/KeyboardFallback.ts" << 'EOF'
import { KEYBOARD_MAP } from '@music-learner/shared'
type CB = (note:number, velocity:number) => void
class KB {
  private pressed=new Set<string>(); private onCb:CB|null=null; private offCb:CB|null=null; private en=true
  init() {
    document.addEventListener('keydown', e => {
      if(!this.en||e.repeat||this.pressed.has(e.key)) return
      const n=KEYBOARD_MAP[e.key.toLowerCase()]
      if(n!==undefined) { this.pressed.add(e.key); this.onCb?.(n,80) }
    })
    document.addEventListener('keyup', e => {
      const n=KEYBOARD_MAP[e.key.toLowerCase()]
      if(n!==undefined) { this.pressed.delete(e.key); this.offCb?.(n,0) }
    })
  }
  onNoteOn(cb:CB)   { this.onCb=cb }
  onNoteOff(cb:CB)  { this.offCb=cb }
  setEnabled(v:boolean) { this.en=v }
}
export const KeyboardFallback = new KB()
EOF

write_file "apps/web/src/lib/audio/Metronome.ts" << 'EOF'
class Metro {
  private ctx:AudioContext|null=null; private timer:number|null=null
  private next=0; private beat=0; private bpm=80; private running=false
  private onBeatCb:((b:number,t:number)=>void)|null=null
  private LA=0.1; private INT=50

  getCtx() {
    if(!this.ctx) this.ctx=new (window.AudioContext||(window as any).webkitAudioContext)()
    return this.ctx
  }
  private click(t:number,accent:boolean) {
    const ctx=this.getCtx(),o=ctx.createOscillator(),g=ctx.createGain()
    o.connect(g);g.connect(ctx.destination)
    o.frequency.value=accent?1000:800
    g.gain.setValueAtTime(accent?.5:.25,t)
    g.gain.exponentialRampToValueAtTime(.001,t+.05)
    o.start(t);o.stop(t+.06)
  }
  private sched() {
    const ctx=this.getCtx(),spb=60/this.bpm
    while(this.next<ctx.currentTime+this.LA) {
      this.click(this.next,this.beat%4===0)
      if(this.onBeatCb) { const d=(this.next-ctx.currentTime)*1000; setTimeout(()=>this.onBeatCb!(this.beat,this.next),Math.max(0,d)) }
      this.next+=spb; this.beat++
    }
  }
  start(bpm?:number) {
    if(this.running) this.stop()
    if(bpm) this.bpm=bpm
    const ctx=this.getCtx()
    if(ctx.state==='suspended') ctx.resume()
    this.next=ctx.currentTime+.05; this.beat=0; this.running=true
    this.timer=window.setInterval(()=>this.sched(),this.INT)
  }
  stop() { if(this.timer) clearInterval(this.timer); this.running=false; this.beat=0 }
  setBPM(b:number) { this.bpm=Math.max(20,Math.min(300,b)) }
  countdown(beats:number,bpm:number):Promise<void> {
    return new Promise(res => {
      this.bpm=bpm; const ctx=this.getCtx()
      if(ctx.state==='suspended') ctx.resume()
      let t=ctx.currentTime+.1
      for(let i=beats;i>=1;i--) { this.click(t,true); t+=60/bpm }
      setTimeout(res,(t-ctx.currentTime)*1000)
    })
  }
  onBeat(cb:(b:number,t:number)=>void) { this.onBeatCb=cb }
  isRunning() { return this.running }
  getBPM()    { return this.bpm }
}
export const Metronome = new Metro()
EOF

write_file "apps/web/src/lib/audio/NotePlayer.ts" << 'EOF'
import { midiToFreq } from '@/constants/midiNotes'
class NP {
  private ctx:AudioContext|null=null
  getCtx() {
    if(!this.ctx) this.ctx=new (window.AudioContext||(window as any).webkitAudioContext)()
    return this.ctx
  }
  play(midi:number,dur=.4,vol=.4) {
    const ctx=this.getCtx(); if(ctx.state==='suspended') ctx.resume()
    const o=ctx.createOscillator(),g=ctx.createGain()
    o.connect(g);g.connect(ctx.destination)
    o.type='triangle'; o.frequency.value=midiToFreq(midi)
    g.gain.setValueAtTime(vol,ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur)
    o.start(ctx.currentTime); o.stop(ctx.currentTime+dur)
  }
  playDrum(midi:number) {
    const ctx=this.getCtx(); if(ctx.state==='suspended') ctx.resume()
    const buf=ctx.createBuffer(1,ctx.sampleRate*.1,ctx.sampleRate)
    const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1
    const src=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter()
    src.buffer=buf; f.type=midi===36?'lowpass':'highpass'; f.frequency.value=midi===36?200:3000
    src.connect(f);f.connect(g);g.connect(ctx.destination)
    g.gain.setValueAtTime(.6,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.15)
    src.start()
  }
}
export const NotePlayer = new NP()
EOF

write_file "apps/web/src/lib/scoring/ScoringEngine.ts" << 'EOF'
import { TIMING_WINDOWS, SCORE_WEIGHTS, getGrade } from '@music-learner/shared'
import type { ScoreResult } from '@music-learner/shared'

interface Event { expectedNote:number; expectedTime:number; playedNote:number|null; playedTime:number|null; timingError:number|null }

export class ScoringEngine {
  private events:Event[]=[];  private total=0
  reset(n:number) { this.events=[]; this.total=n }
  recordHit(en:number,et:number,pn:number,pt:number) { this.events.push({expectedNote:en,expectedTime:et,playedNote:pn,playedTime:pt,timingError:Math.abs(pt-et)}) }
  recordMiss(en:number,et:number) { this.events.push({expectedNote:en,expectedTime:et,playedNote:null,playedTime:null,timingError:null}) }

  calculate():ScoreResult {
    const hits=this.events.filter(e=>e.playedNote!==null)
    const noteAcc=this.total>0?(hits.length/this.total)*100:0
    let timing=0
    if(hits.length>0) {
      const pts=hits.map(h=>{ const e=h.timingError!; return e<=TIMING_WINDOWS.PERFECT?100:e<=TIMING_WINDOWS.GOOD?70:e<=TIMING_WINDOWS.OK?40:0 })
      timing=pts.reduce((a,b)=>a+b,0)/hits.length
    }
    let rhythm=0
    if(hits.length>=2) {
      const errs=hits.map(h=>h.timingError!),mean=errs.reduce((a,b)=>a+b,0)/errs.length
      const std=Math.sqrt(errs.reduce((a,e)=>a+(e-mean)**2,0)/errs.length)
      rhythm=Math.max(0,100-std/3)
    } else if(hits.length===1) rhythm=60
    const overall=noteAcc*SCORE_WEIGHTS.NOTE_ACCURACY+timing*SCORE_WEIGHTS.TIMING+rhythm*SCORE_WEIGHTS.RHYTHM
    return { noteAccuracy:Math.round(noteAcc), timingAccuracy:Math.round(timing), rhythmScore:Math.round(rhythm), overall:Math.round(overall), grade:getGrade(Math.round(overall)), hits:hits.length, misses:this.events.filter(e=>e.playedNote===null).length, totalNotes:this.total }
  }

  getFeedback(r:ScoreResult):string {
    if(r.overall>=95) return '🌟 Absolutely perfect!'
    if(r.overall>=85) return '🎯 Excellent work!'
    if(r.overall>=70) return '👍 Good job! Keep practicing.'
    if(r.overall>=55) return '📈 Getting there! Focus on timing.'
    if(r.noteAccuracy<50) return '🎵 Try to hit more correct notes.'
    return '💪 Keep practicing!'
  }
}
EOF

# ── Hooks ─────────────────────────────────────────────────────
write_file "apps/web/src/hooks/useMidi.ts" << 'EOF'
import { useEffect, useRef, useState } from 'react'
import { MidiManager }      from '@/lib/midi/MidiManager'
import { KeyboardFallback } from '@/lib/midi/KeyboardFallback'
import { NotePlayer }       from '@/lib/audio/NotePlayer'
import { useSettingsStore } from '@/store/settingsStore'

export function useMidi({ onNoteOn, onNoteOff }: { onNoteOn?:(n:number,v:number)=>void; onNoteOff?:(n:number)=>void } = {}) {
  const [connected,setConnected]=useState(false)
  const [deviceName,setDeviceName]=useState<string|null>(null)
  const { keyboardEnabled } = useSettingsStore()
  const onRef=useRef(onNoteOn), offRef=useRef(onNoteOff)
  useEffect(()=>{ onRef.current=onNoteOn },[onNoteOn])
  useEffect(()=>{ offRef.current=onNoteOff },[onNoteOff])

  useEffect(()=>{
    MidiManager.init().then(ok=>{ setConnected(ok); setDeviceName(MidiManager.deviceName) })
    MidiManager.onNoteOn((n,v)=>{ NotePlayer.play(n,.3); onRef.current?.(n,v) })
    MidiManager.onNoteOff(n=>offRef.current?.(n))
    KeyboardFallback.init()
    KeyboardFallback.onNoteOn((n,v)=>{ if(!keyboardEnabled) return; NotePlayer.play(n,.3); onRef.current?.(n,v) })
    KeyboardFallback.onNoteOff(n=>offRef.current?.(n))
  },[])

  useEffect(()=>{ KeyboardFallback.setEnabled(keyboardEnabled) },[keyboardEnabled])
  return { connected, deviceName }
}
EOF

write_file "apps/web/src/hooks/useMetronome.ts" << 'EOF'
import { useEffect } from 'react'
import { Metronome }          from '@/lib/audio/Metronome'
import { usePracticeStore }   from '@/store/practiceStore'

export function useMetronome() {
  const { bpm, metronomeOn, setBPM, toggleMetronome } = usePracticeStore()
  useEffect(()=>{ Metronome.setBPM(bpm); if(metronomeOn){ Metronome.stop(); Metronome.start(bpm) } },[bpm])
  useEffect(()=>{ if(metronomeOn) Metronome.start(bpm); else Metronome.stop(); return()=>Metronome.stop() },[metronomeOn])
  const adjustBPM = (d:number) => setBPM(Math.max(40,Math.min(200,bpm+d)))
  return { bpm, setBPM, adjustBPM, metronomeOn, toggleMetronome }
}
EOF

write_file "apps/web/src/hooks/useAuth.ts" << 'EOF'
import { useMutation }  from '@tanstack/react-query'
import { useNavigate }  from 'react-router-dom'
import toast            from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { authService }  from '@/services/auth.service'
import { ROUTES }       from '@/constants/routes'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuth, setAuth, logout: sl } = useAuthStore()

  const loginMut = useMutation({ mutationFn: authService.login, onSuccess:({data})=>{
    const { user, accessToken, refreshToken } = data.data
    setAuth(user,accessToken,refreshToken)
    toast.success(`Welcome back, ${user.username}!`)
    navigate(ROUTES.DASHBOARD)
  }})

  const regMut = useMutation({ mutationFn: authService.register, onSuccess:({data})=>{
    const { user, accessToken, refreshToken } = data.data
    setAuth(user,accessToken,refreshToken)
    toast.success('Account created! 🎵')
    navigate(ROUTES.DASHBOARD)
  }})

  const logout = async () => {
    try { const t=useAuthStore.getState().refreshToken; if(t) await authService.logout(t) }
    finally { sl(); navigate(ROUTES.LOGIN) }
  }

  return { user, isAuth, logout, login:loginMut.mutate, register:regMut.mutate, isLoading:loginMut.isPending||regMut.isPending }
}
EOF

write_file "apps/web/src/hooks/useLesson.ts" << 'EOF'
import { useQuery }      from '@tanstack/react-query'
import { lessonService } from '@/services/lesson.service'

export function useLessons(instrument?: string) {
  return useQuery({ queryKey:['lessons',instrument], queryFn:async()=>{ const {data}=await lessonService.getAll(instrument); return data.data }, staleTime:5*60*1000 })
}
export function useLesson(id:string) {
  return useQuery({ queryKey:['lesson',id], queryFn:async()=>{ const {data}=await lessonService.getById(id); return data.data }, enabled:!!id })
}
EOF

write_file "apps/web/src/hooks/usePracticeSession.ts" << 'EOF'
import { useCallback, useEffect, useRef } from 'react'
import { usePracticeStore }  from '@/store/practiceStore'
import { ScoringEngine }     from '@/lib/scoring/ScoringEngine'
import { Metronome }         from '@/lib/audio/Metronome'
import { TIMING_WINDOWS }    from '@music-learner/shared'

interface Win { idx:number; note:number; openTime:number; closeTime:number; hit:boolean }

export function usePracticeSession() {
  const { lesson, bpm, metronomeOn, sessionState, setSessionState, setNoteIndex, incrementHits, reset } = usePracticeStore()
  const scoring  = useRef(new ScoringEngine())
  const windows  = useRef<Win[]>([])
  const timers   = useRef<number[]>([])
  const clear    = () => { timers.current.forEach(clearTimeout); timers.current=[] }

  const startSession = useCallback(async () => {
    if(!lesson||sessionState!=='idle') return
    setSessionState('countdown')
    await Metronome.countdown(3,bpm)
    play()
  },[lesson,bpm,sessionState])

  const play = useCallback(() => {
    if(!lesson) return
    setSessionState('playing'); reset()
    scoring.current.reset(lesson.notes.filter(n=>!n.isRest).length)
    const now=performance.now(), ms=60/bpm*1000
    if(metronomeOn) Metronome.start(bpm)
    windows.current = lesson.notes.map((n,i)=>({ idx:i, note:n.note, openTime:now+(n.beat-1)*ms, closeTime:now+(n.beat-1)*ms+TIMING_WINDOWS.MAX, hit:false }))
    lesson.notes.forEach((_,i)=>{
      const w=windows.current[i]
      timers.current.push(
        window.setTimeout(()=>setNoteIndex(i), w.openTime-now),
        window.setTimeout(()=>{
          if(!w.hit&&!lesson.notes[i].isRest) scoring.current.recordMiss(w.note,w.openTime)
          if(i===windows.current.length-1) setTimeout(()=>{ Metronome.stop(); setSessionState('finished') },400)
        }, w.closeTime-now)
      )
    })
  },[lesson,bpm,metronomeOn])

  const handleNoteOn = useCallback((midi:number):string|undefined => {
    if(usePracticeStore.getState().sessionState!=='playing') return
    const now=performance.now()
    const w=windows.current.find(x=>!x.hit&&x.openTime-TIMING_WINDOWS.MAX/2<=now&&now<=x.closeTime)
    if(!w) return
    const exp=lesson?.notes[w.idx]; if(!exp||exp.isRest) return
    const correct=lesson?.instrument==='drums'?Math.abs(midi-w.note)<=2:midi===w.note
    if(correct) {
      w.hit=true
      scoring.current.recordHit(w.note,w.openTime,midi,now)
      incrementHits()
      return 'hit'
    }
    return 'wrong'
  },[lesson])

  const restartSession = useCallback(()=>{ Metronome.stop(); clear(); reset(); setSessionState('idle') },[])
  const getScore       = useCallback(()=>scoring.current.calculate(),[])
  const getFeedback    = useCallback((r:any)=>scoring.current.getFeedback(r),[])

  useEffect(()=>()=>{ Metronome.stop(); clear() },[])
  return { startSession, handleNoteOn, restartSession, getScore, getFeedback }
}
EOF

# ── Components ────────────────────────────────────────────────
write_file "apps/web/src/components/ui/LoadingSpinner/index.tsx" << 'EOF'
import { clsx } from 'clsx'
export default function LoadingSpinner({ fullScreen, size='md' }: { fullScreen?:boolean; size?:'sm'|'md'|'lg' }) {
  const s={sm:'w-5 h-5',md:'w-8 h-8',lg:'w-12 h-12'}
  const el=<div className={clsx('border-4 border-slate-700 border-t-accent rounded-full animate-spin',s[size])}/>
  return fullScreen ? <div className="fixed inset-0 bg-bg flex items-center justify-center">{el}</div> : el
}
EOF

write_file "apps/web/src/components/ui/Button/index.tsx" << 'EOF'
import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
interface P extends ButtonHTMLAttributes<HTMLButtonElement> { variant?:'primary'|'secondary'|'ghost'|'danger'; size?:'sm'|'md'|'lg'; loading?:boolean }
export default function Button({ variant='primary', size='md', loading, children, className, disabled, ...p }: P) {
  const v={primary:'btn-primary',secondary:'btn-secondary',ghost:'btn-ghost',danger:'bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 px-4 py-2.5 rounded-lg text-sm transition-colors'}
  const s={sm:'text-xs px-3 py-1.5',md:'',lg:'text-base px-6 py-3'}
  return <button className={clsx(v[variant],s[size],className)} disabled={disabled||loading} {...p}>{loading?<span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>Loading...</span>:children}</button>
}
EOF

write_file "apps/web/src/components/ui/Card/index.tsx" << 'EOF'
import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
interface P extends HTMLAttributes<HTMLDivElement> { hover?: boolean }
export default function Card({ hover, children, className, ...p }: P) {
  return <div className={clsx('card', hover&&'hover:border-accent/50 hover:translate-x-1 transition-all cursor-pointer', className)} {...p}>{children}</div>
}
EOF

write_file "apps/web/src/components/ui/Badge/index.tsx" << 'EOF'
import { clsx } from 'clsx'
export default function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <span className={clsx('badge',`badge-${difficulty}`)}>{difficulty}</span>
}
EOF

write_file "apps/web/src/components/ui/index.ts" << 'EOF'
export { default as Button }          from './Button'
export { default as Card }            from './Card'
export { default as DifficultyBadge } from './Badge'
export { default as LoadingSpinner }  from './LoadingSpinner'
EOF

write_file "apps/web/src/components/layout/PageWrapper/index.tsx" << 'EOF'
import { Outlet } from 'react-router-dom'
import Navbar     from '../Navbar'
export default function PageWrapper() {
  return <div className="min-h-screen flex flex-col bg-bg"><Navbar/><main className="flex-1"><Outlet/></main></div>
}
EOF

write_file "apps/web/src/components/layout/Navbar/index.tsx" << 'EOF'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth }            from '@/hooks/useAuth'
import { ROUTES }             from '@/constants/routes'
import Button                 from '@/components/ui/Button'

export default function Navbar() {
  const { user, isAuth, logout } = useAuth()
  const nav = useNavigate()
  return (
    <nav className="bg-surface border-b border-slate-800 px-6 py-3 flex items-center gap-6">
      <Link to={ROUTES.HOME} className="text-xl font-black text-accent-light">🎵 MusicLearner</Link>
      <div className="flex gap-1 ml-4">
        <Link to={ROUTES.LESSONS}     className="btn-ghost">Lessons</Link>
        <Link to={ROUTES.LEADERBOARD} className="btn-ghost">Leaderboard</Link>
        {isAuth&&<Link to={ROUTES.DASHBOARD} className="btn-ghost">Dashboard</Link>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        {isAuth ? <>
          <span className="text-sm text-slate-400">⭐{user?.totalXP} XP • Lv.{user?.level}</span>
          <Link to={ROUTES.PROFILE} className="text-sm font-medium text-accent-light hover:underline">{user?.username}</Link>
          <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
        </> : <>
          <Button variant="ghost"   size="sm" onClick={()=>nav(ROUTES.LOGIN)}>Login</Button>
          <Button variant="primary" size="sm" onClick={()=>nav(ROUTES.REGISTER)}>Sign Up</Button>
        </>}
      </div>
    </nav>
  )
}
EOF

write_file "apps/web/src/components/auth/ProtectedRoute/index.tsx" << 'EOF'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore }      from '@/store/authStore'
import { ROUTES }            from '@/constants/routes'
export default function ProtectedRoute() {
  return useAuthStore(s=>s.isAuth) ? <Outlet/> : <Navigate to={ROUTES.LOGIN} replace/>
}
EOF

write_file "apps/web/src/components/practice/Countdown/index.tsx" << 'EOF'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
export default function Countdown({ onComplete, bpm }: { onComplete:()=>void; bpm:number }) {
  const [count,setCount]=useState(3)
  useEffect(()=>{
    if(count===0){onComplete();return}
    const t=setTimeout(()=>setCount(c=>c-1),(60/bpm)*1000)
    return()=>clearTimeout(t)
  },[count,bpm])
  return (
    <div className="fixed inset-0 bg-bg/90 backdrop-blur-sm flex items-center justify-center z-50">
      <AnimatePresence mode="wait">
        <motion.div key={count} initial={{scale:1.5,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.5,opacity:0}} transition={{duration:.3}}
          className="text-9xl font-black text-accent-light" style={{textShadow:'0 0 60px #7c3aed'}}>
          {count===0?'GO!':count}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
EOF

write_file "apps/web/src/components/practice/FeedbackFlash/index.tsx" << 'EOF'
import { motion, AnimatePresence } from 'framer-motion'
export default function FeedbackFlash({ text, color, show }: { text:string; color:string; show:boolean }) {
  return (
    <AnimatePresence>
      {show&&<motion.div key={text+Date.now()} initial={{scale:.5,opacity:0}} animate={{scale:1.2,opacity:1}} exit={{scale:1,opacity:0}} transition={{duration:.3}}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black pointer-events-none z-50"
        style={{color,textShadow:`0 0 30px ${color}`}}>{text}</motion.div>}
    </AnimatePresence>
  )
}
EOF

write_file "apps/web/src/components/practice/NoteSequence/index.tsx" << 'EOF'
import { clsx } from 'clsx'
import type { Note } from '@music-learner/shared'
type Status='pending'|'active'|'hit'|'miss'
export default function NoteSequence({ notes, activeIdx, states }: { notes:Note[]; activeIdx:number; states:{status:Status}[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1">
      {notes.map((n,i)=>{
        const s=states[i]?.status||'pending'
        return <div key={i} className="flex flex-col items-center gap-1 min-w-[52px]">
          <span className="text-xs text-slate-500 font-medium">{n.beat}</span>
          <div className={clsx('w-11 h-11 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-150',
            n.isRest&&'border-dashed opacity-50',
            s==='pending'&&'border-slate-700 bg-surface text-slate-400',
            s==='active' &&'border-accent-light bg-accent/20 text-accent-light scale-110 shadow-[0_0_16px_#7c3aed]',
            s==='hit'    &&'border-success bg-success/20 text-success',
            s==='miss'   &&'border-danger bg-danger/10 text-danger',
          )}>{n.isRest?'—':n.label}</div>
          <div className={clsx('w-1.5 h-1.5 rounded-full',s==='active'?'bg-accent-light':'bg-slate-700')}/>
        </div>
      })}
    </div>
  )
}
EOF

write_file "apps/web/src/components/practice/PianoRoll/index.tsx" << 'EOF'
import { clsx } from 'clsx'
const IB=(n:number)=>[1,3,6,8,10].includes(n%12)
export default function PianoRoll({ activeNotes, expectedNote, startMidi=48, endMidi=84 }: { activeNotes:Set<number>; expectedNote?:number; startMidi?:number; endMidi?:number }) {
  const whites=[]
  const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  for(let m=startMidi;m<=endMidi;m++) {
    if(!IB(m)) whites.push(
      <div key={m} className={clsx('piano-key-white',activeNotes.has(m)&&'active',m===expectedNote&&'expected')}>
        {names[m%12]}{Math.floor(m/12)-1}
      </div>
    )
  }
  return <div className="flex overflow-x-auto p-4 justify-center"><div className="flex">{whites}</div></div>
}
EOF

write_file "apps/web/src/components/practice/DrumPad/index.tsx" << 'EOF'
import { clsx }             from 'clsx'
import { DRUM_COLORS, DRUM_NAMES } from '@/constants/drumMap'
const PADS=[36,38,42,46,50,47,45,49]
export default function DrumPad({ activeNotes, expectedNote }: { activeNotes:Set<number>; expectedNote?:number }) {
  return (
    <div className="grid grid-cols-4 gap-3 p-4 max-w-lg mx-auto">
      {PADS.map(m=>{
        const a=activeNotes.has(m),e=m===expectedNote,c=DRUM_COLORS[m]||'#7c3aed'
        return <div key={m} className={clsx('h-16 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all select-none',a&&'scale-95',e&&'scale-105')}
          style={{background:a?c:`${c}22`,borderColor:a||e?c:`${c}66`,color:c,boxShadow:a?`0 0 20px ${c}`:'none'}}>
          {DRUM_NAMES[m]}
        </div>
      })}
    </div>
  )
}
EOF

write_file "apps/web/src/components/lessons/LessonCard/index.tsx" << 'EOF'
import { clsx }          from 'clsx'
import { motion }        from 'framer-motion'
import DifficultyBadge   from '@/components/ui/Badge'

export default function LessonCard({ lesson, index, onClick }: { lesson:any; index:number; onClick:()=>void }) {
  const { progress } = lesson
  const locked=!progress?.unlocked, completed=!!progress?.bestScore
  return (
    <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:index*.05}}
      onClick={()=>!locked&&onClick()}
      className={clsx('card flex items-center gap-5 transition-all',
        !locked&&'hover:border-accent/50 hover:translate-x-1 cursor-pointer',
        locked&&'opacity-40 cursor-not-allowed',
        completed&&'border-success/40'
      )}>
      <div className={clsx('w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0',completed?'bg-success text-black':'bg-surface2 text-slate-300')}>
        {completed?'✓':index+1}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{lesson.name}{locked?' 🔒':''}</h3>
        <p className="text-sm text-slate-500 truncate mt-0.5">{lesson.description}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <DifficultyBadge difficulty={lesson.difficulty}/>
        <span className="text-xs text-slate-500">♩ {lesson.bpm} BPM</span>
        {progress?.bestScore&&<span className="text-xs font-bold text-warning">Best: {progress.bestScore}%</span>}
      </div>
    </motion.div>
  )
}
EOF

write_file "apps/web/src/components/score/ScoreBoard/index.tsx" << 'EOF'
import { motion }  from 'framer-motion'
import Button      from '@/components/ui/Button'
import type { ScoreResult } from '@music-learner/shared'
const GC: Record<string,string> = { S:'#a855f7','A+':'#f59e0b',A:'#f59e0b','B+':'#3b82f6',B:'#3b82f6',C:'#10b981',D:'#6b7280',F:'#ef4444' }
export default function ScoreBoard({ result, lessonName, feedback, unlocked, onRetry, onNext, onHome }: { result:ScoreResult; lessonName:string; feedback:string; unlocked:boolean; onRetry:()=>void; onNext:()=>void; onHome:()=>void }) {
  const gc=GC[result.grade]||'#7c3aed'
  const bars=[
    {label:'Notes Hit',          value:result.noteAccuracy,   color:'#a855f7'},
    {label:'Timing Accuracy',    value:result.timingAccuracy, color:'#3b82f6'},
    {label:'Rhythm Consistency', value:result.rhythmScore,    color:'#10b981'},
    {label:'Overall Score',      value:result.overall,        color:'#f59e0b'},
  ]
  return (
    <div className="flex flex-col items-center gap-8 py-12 px-6 max-w-lg mx-auto">
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200}}
        className="text-8xl font-black" style={{color:gc,textShadow:`0 0 40px ${gc}`}}>
        {result.grade}
      </motion.div>
      <div className="text-center">
        <h2 className="text-2xl font-bold">{lessonName}</h2>
        <p className="text-slate-400 mt-1">{feedback}</p>
      </div>
      <div className="w-full space-y-4">
        {bars.map((b,i)=>(
          <div key={b.label} className="flex items-center gap-3">
            <span className="w-44 text-sm text-slate-400 text-right">{b.label}</span>
            <div className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{background:b.color}} initial={{width:0}} animate={{width:`${b.value}%`}} transition={{duration:.8,delay:i*.1}}/>
            </div>
            <span className="w-10 text-sm font-bold text-right">{b.value}%</span>
          </div>
        ))}
      </div>
      <div className="flex gap-6 text-center">
        <div><p className="text-2xl font-bold text-success">{result.hits}</p><p className="text-xs text-slate-500">Hits</p></div>
        <div><p className="text-2xl font-bold text-danger">{result.misses}</p><p className="text-xs text-slate-500">Misses</p></div>
        <div><p className="text-2xl font-bold text-slate-300">{result.totalNotes}</p><p className="text-xs text-slate-500">Total</p></div>
      </div>
      {unlocked&&<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full py-3 px-5 bg-success/10 border border-success rounded-xl text-success font-bold text-center">🏆 Next lesson unlocked!</motion.div>}
      <div className="flex gap-3 flex-wrap justify-center">
        <Button variant="secondary" onClick={onRetry}>↺ Retry</Button>
        <Button variant="primary"   onClick={onNext}>Next Lesson →</Button>
        <Button variant="ghost"     onClick={onHome}>🏠 Home</Button>
      </div>
    </div>
  )
}
EOF

# ── Pages ─────────────────────────────────────────────────────
write_file "apps/web/src/pages/Home/index.tsx" << 'EOF'
import { useNavigate }  from 'react-router-dom'
import { motion }       from 'framer-motion'
import Button           from '@/components/ui/Button'
import { ROUTES }       from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const nav=useNavigate(), isAuth=useAuthStore(s=>s.isAuth)
  return (
    <div className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center px-6">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center max-w-2xl">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-accent-light to-blue-400 bg-clip-text text-transparent">Learn Music.<br/>Beat by Beat.</h1>
        <p className="text-xl text-slate-400 mb-10">Practice piano, guitar and drums with real MIDI support, intelligent scoring and progressive lessons.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          {isAuth ? <>
            <Button size="lg" onClick={()=>nav(ROUTES.LESSONS)}>Browse Lessons →</Button>
            <Button size="lg" variant="secondary" onClick={()=>nav(ROUTES.DASHBOARD)}>My Dashboard</Button>
          </> : <>
            <Button size="lg" onClick={()=>nav(ROUTES.REGISTER)}>Get Started Free →</Button>
            <Button size="lg" variant="secondary" onClick={()=>nav(ROUTES.LOGIN)}>Sign In</Button>
          </>}
        </div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
        {[{icon:'🎹',title:'MIDI Support',desc:'Connect any MIDI instrument or use keyboard fallback'},{icon:'📊',title:'Smart Scoring',desc:'Graded on notes, timing accuracy and rhythm'},{icon:'🏆',title:'Progression',desc:'Score 60%+ to unlock next lesson with higher tempo'}].map((f,i)=>(
          <motion.div key={f.title} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.2+i*.1}} className="card text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
EOF

write_file "apps/web/src/pages/Auth/Login/index.tsx" << 'EOF'
import { useState }  from 'react'
import { Link }      from 'react-router-dom'
import { useAuth }   from '@/hooks/useAuth'
import Button        from '@/components/ui/Button'
import { ROUTES }    from '@/constants/routes'

export default function Login() {
  const [form,setForm]=useState({email:'',password:''})
  const { login, isLoading } = useAuth()
  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back 🎵</h2>
        <form onSubmit={e=>{e.preventDefault();login(form)}} className="space-y-4">
          <div><label className="text-sm text-slate-400 block mb-1.5">Email</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
          <div><label className="text-sm text-slate-400 block mb-1.5">Password</label><input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required/></div>
          <Button type="submit" loading={isLoading} className="w-full mt-2">Sign In</Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-5">No account? <Link to={ROUTES.REGISTER} className="text-accent-light hover:underline">Sign up free</Link></p>
      </div>
    </div>
  )
}
EOF

write_file "apps/web/src/pages/Auth/Register/index.tsx" << 'EOF'
import { useState }  from 'react'
import { Link }      from 'react-router-dom'
import { useAuth }   from '@/hooks/useAuth'
import Button        from '@/components/ui/Button'
import { ROUTES }    from '@/constants/routes'

export default function Register() {
  const [form,setForm]=useState({email:'',username:'',password:''})
  const { register, isLoading } = useAuth()
  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account 🎶</h2>
        <form onSubmit={e=>{e.preventDefault();register(form)}} className="space-y-4">
          {[{k:'email',l:'Email',t:'email',p:'you@example.com'},{k:'username',l:'Username',t:'text',p:'rockstar99'},{k:'password',l:'Password',t:'password',p:'••••••••'}].map(f=>(
            <div key={f.k}><label className="text-sm text-slate-400 block mb-1.5">{f.l}</label><input className="input" type={f.t} placeholder={f.p} value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} required/></div>
          ))}
          <Button type="submit" loading={isLoading} className="w-full mt-2">Create Account</Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-5">Have an account? <Link to={ROUTES.LOGIN} className="text-accent-light hover:underline">Sign in</Link></p>
      </div>
    </div>
  )
}
EOF

write_file "apps/web/src/pages/Lessons/index.tsx" << 'EOF'
import { useState }         from 'react'
import { useNavigate }      from 'react-router-dom'
import { useLessons }       from '@/hooks/useLesson'
import LessonCard           from '@/components/lessons/LessonCard'
import LoadingSpinner       from '@/components/ui/LoadingSpinner'
import { ROUTES }           from '@/constants/routes'

const INSTS=[{id:'piano',icon:'🎹'},{id:'guitar',icon:'🎸'},{id:'drums',icon:'🥁'}]

export default function Lessons() {
  const [sel,setSel]=useState('piano')
  const nav=useNavigate()
  const { data:lessons, isLoading } = useLessons(sel)
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-6">Lessons</h1>
      <div className="flex gap-3 mb-8">
        {INSTS.map(i=>(
          <button key={i.id} onClick={()=>setSel(i.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold border-2 transition-all text-sm capitalize ${sel===i.id?'border-accent-light bg-accent/20 text-accent-light':'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
            <span className="text-xl">{i.icon}</span>{i.id}
          </button>
        ))}
      </div>
      {isLoading ? <div className="flex justify-center py-20"><LoadingSpinner size="lg"/></div> :
        <div className="space-y-3">
          {lessons?.map((l:any,i:number)=>(
            <LessonCard key={l.id} lesson={l} index={i} onClick={()=>nav(ROUTES.PRACTICE(l.id))}/>
          ))}
        </div>
      }
    </div>
  )
}
EOF

write_file "apps/web/src/pages/Practice/index.tsx" << 'EOF'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate }  from 'react-router-dom'
import { useMutation }             from '@tanstack/react-query'
import toast                       from 'react-hot-toast'
import { useLesson }               from '@/hooks/useLesson'
import { useMidi }                 from '@/hooks/useMidi'
import { useMetronome }            from '@/hooks/useMetronome'
import { usePracticeSession }      from '@/hooks/usePracticeSession'
import { usePracticeStore }        from '@/store/practiceStore'
import NoteSequence                from '@/components/practice/NoteSequence'
import PianoRoll                   from '@/components/practice/PianoRoll'
import DrumPad                     from '@/components/practice/DrumPad'
import FeedbackFlash               from '@/components/practice/FeedbackFlash'
import Countdown                   from '@/components/practice/Countdown'
import ScoreBoard                  from '@/components/score/ScoreBoard'
import Button                      from '@/components/ui/Button'
import LoadingSpinner              from '@/components/ui/LoadingSpinner'
import { scoreService }            from '@/services/score.service'
import { ROUTES }                  from '@/constants/routes'

type NS = 'pending'|'active'|'hit'|'miss'

export default function Practice() {
  const { lessonId }  = useParams<{lessonId:string}>()
  const nav           = useNavigate()
  const { data:lesson, isLoading } = useLesson(lessonId!)
  const { sessionState, noteIndex, setLesson, bpm } = usePracticeStore()
  const { bpm:currentBPM, adjustBPM, metronomeOn, toggleMetronome, setBPM } = useMetronome()
  const { startSession, handleNoteOn, restartSession, getScore, getFeedback } = usePracticeSession()

  const [activeNotes,  setActive]    = useState<Set<number>>(new Set())
  const [expectedNote, setExpected]  = useState<number|undefined>()
  const [noteStates,   setNStates]   = useState<NS[]>([])
  const [fbText,       setFbText]    = useState('')
  const [fbColor,      setFbColor]   = useState('')
  const [showFb,       setShowFb]    = useState(false)
  const [scoreResult,  setScore]     = useState<any>(null)
  const [unlocked,     setUnlocked]  = useState(false)
  const fbTimer = useRef<number>()

  const submitMut = useMutation({ mutationFn: scoreService.submit, onSuccess:({data})=>{ setUnlocked(data.data.unlocked); toast.success(`+${data.data.xpGained} XP!`) } })

  useEffect(()=>{ if(lesson){ setLesson(lesson); setBPM(lesson.bpm); setNStates(lesson.notes.map(()=>'pending')); setExpected(lesson.notes[0]?.note) } },[lesson])
  useEffect(()=>{ if(sessionState==='playing'&&lesson){ setExpected(lesson.notes[noteIndex]?.note); setNStates(p=>{ const n=[...p]; n[noteIndex]='active'; return n }) } },[noteIndex,sessionState])
  useEffect(()=>{ if(sessionState==='finished'){ const r=getScore(); setScore(r); if(lessonId) submitMut.mutate({lessonId,bpmPlayed:currentBPM,...r}) } },[sessionState])

  const flash=(t:string,c:string)=>{ setFbText(t); setFbColor(c); setShowFb(true); clearTimeout(fbTimer.current); fbTimer.current=window.setTimeout(()=>setShowFb(false),500) }

  const onNoteOn=useCallback((midi:number)=>{
    setActive(p=>new Set(p).add(midi))
    if(sessionState!=='playing') return
    const r=handleNoteOn(midi)
    if(r==='hit') {
      setNStates(p=>{ const n=[...p]; n[noteIndex]='hit'; return n })
      flash('PERFECT!','#a855f7')
    } else if(r==='wrong') { flash('✗','#ef4444') }
  },[sessionState,noteIndex,handleNoteOn])

  const onNoteOff=useCallback((midi:number)=>setActive(p=>{ const n=new Set(p); n.delete(midi); return n }),[])
  const { connected, deviceName } = useMidi({ onNoteOn, onNoteOff })

  if(isLoading) return <LoadingSpinner fullScreen/>
  if(!lesson)   return <div className="text-center py-20">Lesson not found</div>

  if(sessionState==='finished'&&scoreResult) return (
    <ScoreBoard result={scoreResult} lessonName={lesson.name} feedback={getFeedback(scoreResult)} unlocked={unlocked}
      onRetry={()=>{ restartSession(); setNStates(lesson.notes.map(()=>'pending')) }}
      onNext={()=>nav(ROUTES.LESSONS)} onHome={()=>nav(ROUTES.HOME)}/>
  )

  return (
    <div className="flex flex-col min-h-[calc(100vh-57px)]">
      {sessionState==='countdown'&&<Countdown bpm={currentBPM} onComplete={()=>{}}/>}
      <FeedbackFlash text={fbText} color={fbColor} show={showFb}/>
      <div className="flex items-center gap-4 px-5 py-3 bg-surface border-b border-slate-800">
        <Button variant="ghost" size="sm" onClick={()=>nav(ROUTES.LESSONS)}>← Lessons</Button>
        <h2 className="font-bold text-lg">{lesson.name}</h2>
        <div className="ml-auto flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full border ${connected?'border-success text-success':'border-slate-700 text-slate-500'}`}>
            <span className={`w-2 h-2 rounded-full ${connected?'bg-success animate-pulse':'bg-slate-600'}`}/>
            {connected?deviceName||'MIDI Connected':'Keyboard Mode'}
          </div>
          <span className="text-accent-light font-bold text-sm">♩ {currentBPM} BPM</span>
        </div>
      </div>
      <div className="grid grid-cols-4 border-b border-slate-800">
        {[{l:'Lesson',v:lesson.name},{l:'Difficulty',v:lesson.difficulty},{l:'Note',v:`${noteIndex+1}/${lesson.notes.length}`},{l:'Keys',v:'A-K = Notes'}].map(i=>(
          <div key={i.l} className="py-3 px-4 border-r border-slate-800 last:border-0 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{i.l}</p>
            <p className="font-semibold text-sm mt-0.5 capitalize">{i.v}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 p-5 bg-surface2 overflow-x-auto">
        <NoteSequence notes={lesson.notes} activeIdx={noteIndex} states={noteStates.map(s=>({status:s}))}/>
      </div>
      <div className="border-t border-slate-800">
        {lesson.instrument==='drums'?<DrumPad activeNotes={activeNotes} expectedNote={expectedNote}/>:<PianoRoll activeNotes={activeNotes} expectedNote={expectedNote}/>}
      </div>
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-surface border-t border-slate-800 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={toggleMetronome} className={`btn-secondary text-sm ${metronomeOn?'border-success text-success':''}`}>🎵 Metro: {metronomeOn?'ON':'OFF'}</button>
          <div className="flex items-center gap-2">
            <button className="btn-secondary w-8 h-8 p-0 flex items-center justify-center text-lg" onClick={()=>adjustBPM(-5)}>−</button>
            <input type="range" min={40} max={200} value={currentBPM} onChange={e=>setBPM(Number(e.target.value))} className="w-28 accent-accent-light"/>
            <button className="btn-secondary w-8 h-8 p-0 flex items-center justify-center text-lg" onClick={()=>adjustBPM(5)}>+</button>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={()=>{ restartSession(); setNStates(lesson.notes.map(()=>'pending')) }}>↺ Restart</Button>
          <Button onClick={startSession} disabled={sessionState!=='idle'}>▶ Start (3-2-1)</Button>
        </div>
      </div>
    </div>
  )
}
EOF

write_file "apps/web/src/pages/Dashboard/index.tsx" << 'EOF'
import { useQuery }        from '@tanstack/react-query'
import { useNavigate }     from 'react-router-dom'
import { motion }          from 'framer-motion'
import { progressService } from '@/services/progress.service'
import { useAuthStore }    from '@/store/authStore'
import LoadingSpinner      from '@/components/ui/LoadingSpinner'
import Button              from '@/components/ui/Button'
import { ROUTES }          from '@/constants/routes'

export default function Dashboard() {
  const user=useAuthStore(s=>s.user), nav=useNavigate()
  const { data, isLoading } = useQuery({ queryKey:['progress'], queryFn:async()=>{ const {data}=await progressService.getAll(); return data.data } })
  if(isLoading) return <LoadingSpinner fullScreen/>
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-black">Welcome back, {user?.username}! 🎵</h1><p className="text-slate-400 mt-1">Keep up the practice streak!</p></div>
        <Button onClick={()=>nav(ROUTES.LESSONS)}>Continue →</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[{l:'Total XP',v:user?.totalXP||0,c:'#f59e0b',i:'⭐'},{l:'Level',v:user?.level||1,c:'#a855f7',i:'🏆'},{l:'Streak',v:`${user?.streak||0}d`,c:'#10b981',i:'🔥'},{l:'Completed',v:data?.stats?.totalCompleted||0,c:'#3b82f6',i:'✅'}].map((s,i)=>(
          <motion.div key={s.l} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.1}} className="card text-center">
            <div className="text-3xl mb-2">{s.i}</div>
            <p className="text-2xl font-black" style={{color:s.c}}>{s.v}</p>
            <p className="text-xs text-slate-500 mt-1">{s.l}</p>
          </motion.div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-bold text-lg mb-4">Progress by Instrument</h2>
        <div className="space-y-4">
          {[{n:'Piano',i:'🎹',c:data?.stats?.byInstrument?.piano||0,t:10},{n:'Guitar',i:'🎸',c:data?.stats?.byInstrument?.guitar||0,t:8},{n:'Drums',i:'🥁',c:data?.stats?.byInstrument?.drums||0,t:8}].map(x=>(
            <div key={x.n} className="flex items-center gap-4">
              <span className="text-2xl">{x.i}</span>
              <span className="w-16 text-sm font-medium">{x.n}</span>
              <div className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent rounded-full" initial={{width:0}} animate={{width:`${(x.c/x.t)*100}%`}} transition={{duration:.8}}/>
              </div>
              <span className="text-sm text-slate-400 w-12 text-right">{x.c}/{x.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
EOF

write_file "apps/web/src/pages/Leaderboard/index.tsx" << 'EOF'
import { useQuery }   from '@tanstack/react-query'
import { motion }     from 'framer-motion'
import api            from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Leaderboard() {
  const { data, isLoading } = useQuery({ queryKey:['leaderboard'], queryFn:async()=>{ const {data}=await api.get('/leaderboard'); return data.data } })
  if(isLoading) return <LoadingSpinner fullScreen/>
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8">🏆 Leaderboard</h1>
      <div className="space-y-3">
        {data?.map((e:any,i:number)=>(
          <motion.div key={e.userId} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*.05}} className="card flex items-center gap-4">
            <span className={`text-2xl font-black w-10 text-center ${i===0?'text-yellow-400':i===1?'text-slate-300':i===2?'text-amber-600':'text-slate-500'}`}>{i<3?['🥇','🥈','🥉'][i]:e.rank}</span>
            <div className="flex-1"><p className="font-bold">{e.username}</p><p className="text-xs text-slate-500">Level {e.level}</p></div>
            <span className="text-warning font-black text-lg">{e.totalXP} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
EOF

write_file "apps/web/src/pages/Profile/index.tsx" << 'EOF'
import { useAuthStore }     from '@/store/authStore'
import { LEVEL_THRESHOLDS } from '@music-learner/shared'

export default function Profile() {
  const user=useAuthStore(s=>s.user); if(!user) return null
  const xp=user.totalXP, tl=LEVEL_THRESHOLDS[user.level]||0, nl=LEVEL_THRESHOLDS[user.level+1]||xp
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent-light flex items-center justify-center text-3xl mx-auto mb-4">🎵</div>
        <h1 className="text-2xl font-black">{user.username}</h1>
        <p className="text-slate-400 text-sm mt-1">{user.email}</p>
        <p className="text-accent-light font-bold mt-2">Level {user.level}</p>
        <div className="mt-4 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{xp} XP</span><span>{nl} XP</span></div>
          <div className="h-2 bg-surface2 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full" style={{width:`${Math.min(100,((xp-tl)/(nl-tl))*100)}%`}}/></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{i:'🔥',l:'Streak',v:user.streak},{i:'⭐',l:'Total XP',v:user.totalXP},{i:'🏆',l:'Level',v:user.level}].map(s=>(
          <div key={s.l} className="card text-center"><div className="text-2xl mb-1">{s.i}</div><p className="text-xl font-black">{s.v}</p><p className="text-xs text-slate-500">{s.l}</p></div>
        ))}
      </div>
    </div>
  )
}
EOF

write_file "apps/web/src/pages/Settings/index.tsx" << 'EOF'
import { useSettingsStore } from '@/store/settingsStore'
export default function Settings() {
  const { volume, keyboardEnabled, showNoteNames, setVolume, toggleKeyboard, toggleNoteNames } = useSettingsStore()
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8">Settings ⚙️</h1>
      <div className="card space-y-6">
        {[{l:'Keyboard Fallback',d:'Use A-K keys when no MIDI device connected',v:keyboardEnabled,t:toggleKeyboard},{l:'Show Note Names',d:'Display note names on piano roll',v:showNoteNames,t:toggleNoteNames}].map(s=>(
          <div key={s.l} className="flex items-center justify-between">
            <div><p className="font-medium">{s.l}</p><p className="text-sm text-slate-400 mt-0.5">{s.d}</p></div>
            <button onClick={s.t} className={`w-12 h-6 rounded-full transition-colors relative ${s.v?'bg-accent':'bg-slate-700'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${s.v?'left-7':'left-1'}`}/>
            </button>
          </div>
        ))}
        <div>
          <div className="flex justify-between mb-2"><p className="font-medium">Volume</p><span className="text-sm text-slate-400">{Math.round(volume*100)}%</span></div>
          <input type="range" min={0} max={1} step={.05} value={volume} onChange={e=>setVolume(parseFloat(e.target.value))} className="w-full accent-accent-light"/>
        </div>
      </div>
    </div>
  )
}
EOF

write_file "apps/web/src/pages/NotFound/index.tsx" << 'EOF'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
export default function NotFound() {
  const nav=useNavigate()
  return <div className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center gap-6"><p className="text-8xl">🎵</p><h1 className="text-4xl font-black">404 — Off Key!</h1><p className="text-slate-400">This page doesn't exist.</p><Button onClick={()=>nav('/')}>Back Home</Button></div>
}
EOF

write_file "apps/web/src/router/index.tsx" << 'EOF'
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense }      from 'react'
import PageWrapper    from '@/components/layout/PageWrapper'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const w=(C:React.ComponentType)=><Suspense fallback={<LoadingSpinner fullScreen/>}><C/></Suspense>

const Home        = lazy(()=>import('@/pages/Home'))
const Dashboard   = lazy(()=>import('@/pages/Dashboard'))
const Lessons     = lazy(()=>import('@/pages/Lessons'))
const Practice    = lazy(()=>import('@/pages/Practice'))
const Profile     = lazy(()=>import('@/pages/Profile'))
const Leaderboard = lazy(()=>import('@/pages/Leaderboard'))
const Settings    = lazy(()=>import('@/pages/Settings'))
const Login       = lazy(()=>import('@/pages/Auth/Login'))
const Register    = lazy(()=>import('@/pages/Auth/Register'))
const NotFound    = lazy(()=>import('@/pages/NotFound'))

export const router = createBrowserRouter([
  { path:'/', element:<PageWrapper/>, children:[
    { index:true,         element:w(Home) },
    { path:'login',       element:w(Login) },
    { path:'register',    element:w(Register) },
    { path:'leaderboard', element:w(Leaderboard) },
    { element:<ProtectedRoute/>, children:[
      { path:'dashboard',              element:w(Dashboard) },
      { path:'lessons',                element:w(Lessons) },
      { path:'lessons/:instrument',    element:w(Lessons) },
      { path:'practice/:lessonId',     element:w(Practice) },
      { path:'profile',                element:w(Profile) },
      { path:'settings',               element:w(Settings) },
    ]},
  ]},
  { path:'*', element:w(NotFound) }
])
EOF

write_file "apps/web/src/main.tsx" << 'EOF'
import React       from 'react'
import ReactDOM    from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App         from './App'
import './styles/globals.css'

const qc = new QueryClient({ defaultOptions:{ queries:{ retry:1, staleTime:60000, refetchOnWindowFocus:false } } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App/>
      <Toaster position="top-right" toastOptions={{ style:{ background:'#1a1a2e', color:'#e2e8f0', border:'1px solid #2d2d4e' } }}/>
    </QueryClientProvider>
  </React.StrictMode>
)
EOF

write_file "apps/web/src/App.tsx" << 'EOF'
import { RouterProvider } from 'react-router-dom'
import { router }         from './router'
export default function App() { return <RouterProvider router={router}/> }
EOF

# ── GitHub Actions ─────────────────────────────────────────────
write_file ".github/workflows/ci.yml" << 'EOF'
name: CI
on:
  push:    { branches: [main, develop] }
  pull_request: { branches: [main] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm install
      - run: npm run build
      - run: npm run lint
EOF

# ══════════════════════════════════════════════════════════════
echo ""
echo "✅ All files written!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "  1. Install dependencies:"
echo "     npm install"
echo ""
echo "  2. Copy env file:"
echo "     cp apps/api/.env.example apps/api/.env"
echo "     # then edit apps/api/.env with your values"
echo ""
echo "  3. Start database:"
echo "     docker-compose up -d"
echo ""
echo "  4. Run DB migrations + seed:"
echo "     cd apps/api"
echo "     npx prisma migrate dev --name init"
echo "     npm run db:seed"
echo "     cd ../.."
echo ""
echo "  5. Start everything:"
echo "     npm run dev"
echo ""
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:5000"
echo "  Database → localhost:5432"