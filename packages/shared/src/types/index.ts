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
