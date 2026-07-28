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
