export type Instrument   = 'piano' | 'guitar' | 'bass4' | 'bass5' | 'drums'
export type Difficulty   = 'easy' | 'medium' | 'hard' | 'expert'
export type Grade        = 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F'
export type PlanTier     = 'FREE' | 'BASIC' | 'PRO'

export type LessonCategory =
  | 'abrsm'
  | 'classical'
  | 'jazz'
  | 'pop'
  | 'exercises'
  | 'custom'

export type LessonSubcategory =
  | 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5'
  | 'baroque' | 'classical_period' | 'romantic' | 'modern'
  | 'jazz_basics' | 'blues' | 'jazz_standards' | 'improvisation'
  | 'pop_beginner' | 'pop_chords' | 'pop_songs'
  | 'hanon' | 'czerny' | 'scales_arpeggios' | 'sight_reading'
  | 'theory_builder' | 'ear_training' | 'fun_challenges'

export interface Note {
  note: number
  beat: number
  duration: number
  label: string
  isRest: boolean
}

export interface Lesson {
  id: string
  name: string
  description: string
  instrument: Instrument
  difficulty: Difficulty
  bpm: number
  notes: Note[]
  order: number
  xpReward: number
  category: LessonCategory
  subcategory?: LessonSubcategory
  composer?: string
  songTitle?: string
  requiredPlan: PlanTier
  keySignature?: string  // "C" | "G" | "D" | "A" | "E" | "B" | "F" | "Bb" | "Eb" | "Ab" | "Db" | "Am" | "Em" etc
}

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: string
  updatedAt: string
  streak: number
  totalXP: number
  level: number
  plan: PlanTier
}

export interface ScoreResult {
  noteAccuracy: number
  timingAccuracy: number
  rhythmScore: number
  overall: number
  grade: Grade
  hits: number
  misses: number
  totalNotes: number
}

export interface LessonProgress {
  lessonId: string
  userId: string
  unlocked: boolean
  completed: boolean
  bestScore: number | null
  attempts: number
  lastPlayed: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthTokens      { accessToken: string; refreshToken: string }
export interface LoginPayload    { email: string; password: string }
export interface RegisterPayload { email: string; username: string; password: string }

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  totalScore: number
  level: number
}
