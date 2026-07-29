import { useState, useRef, useCallback } from 'react'
import { NotePlayer } from '@/lib/audio/NotePlayer'

export function useWaitMode() {
  const [isActive,    setIsActive]    = useState(false)
  const [noteIndex,   setNoteIndex]   = useState(0)
  const [hits,        setHits]        = useState(0)
  const [misses,      setMisses]      = useState(0)
  const [isFinished,  setIsFinished]  = useState(false)
  const notesRef = useRef<any[]>([])

  const start = useCallback((notes: any[]) => {
    notesRef.current = notes
    setIsActive(true)
    setIsFinished(false)
    setNoteIndex(0)
    setHits(0)
    setMisses(0)
  }, [])

  const stop = useCallback(() => {
    setIsActive(false)
    setIsFinished(false)
    setNoteIndex(0)
    setHits(0)
    setMisses(0)
  }, [])

  // Returns 'hit' | 'wrong' | 'idle'
  const handleNoteOn = useCallback((midi: number, instrument: string): 'hit' | 'wrong' | 'idle' => {
    if (!isActive) return 'idle'
    const notes   = notesRef.current
    const current = notes[noteIndex]
    if (!current) return 'idle'

    // Skip rests automatically
    let idx = noteIndex
    while (idx < notes.length && notes[idx].isRest) idx++
    if (idx >= notes.length) return 'idle'

    const expected = notes[idx]
    const correct  = instrument === 'drums'
      ? Math.abs(midi - expected.note) <= 2
      : midi === expected.note

    if (correct) {
      NotePlayer.play(midi, expected.duration * 0.5, 0.8)
      setHits(h => h + 1)

      // Advance to next non-rest note
      let next = idx + 1
      while (next < notes.length && notes[next].isRest) next++
      setNoteIndex(next)

      if (next >= notes.length) {
        setTimeout(() => {
          setIsActive(false)
          setIsFinished(true)
        }, 400)
      }
      return 'hit'
    } else {
      setMisses(m => m + 1)
      return 'wrong'
    }
  }, [isActive, noteIndex])

  const totalNonRests = notesRef.current.filter(n => !n.isRest).length
  const accuracy      = totalNonRests > 0
    ? Math.round((hits / totalNonRests) * 100)
    : 0

  return {
    isActive, noteIndex, hits, misses,
    isFinished, accuracy, totalNonRests,
    start, stop, handleNoteOn,
  }
}
