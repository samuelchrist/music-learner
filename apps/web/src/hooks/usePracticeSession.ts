import { useCallback, useEffect, useRef } from 'react'
import { usePracticeStore }  from '@/store/practiceStore'
import { ScoringEngine }     from '@/lib/scoring/ScoringEngine'
import { Metronome }         from '@/lib/audio/Metronome'

// ✅ FIX: Define locally — was imported from shared but never existed there
const TIMING_WINDOWS = {
  MAX:     500,   // ms — total window to register a hit
  PERFECT:  50,   // ms — perfect timing
  GOOD:    150,   // ms — good timing
} as const

interface Win {
  idx:       number
  note:      number
  openTime:  number
  closeTime: number
  hit:       boolean
}

export function usePracticeSession() {
  const {
    lesson, bpm, metronomeOn,
    sessionState, setSessionState,
    setNoteIndex, incrementHits, reset
  } = usePracticeStore()

  const scoring = useRef(new ScoringEngine())
  const windows = useRef<Win[]>([])
  const timers  = useRef<number[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  // ✅ FIX: play logic moved into a ref-based callback so startSession
  //         always gets the latest version without stale closure
  const playRef = useRef<() => void>(() => {})

  playRef.current = () => {
    if (!lesson) return
    setSessionState('playing')
    reset()
    scoring.current.reset(lesson.notes.filter(n => !n.isRest).length)

    const now = performance.now()
    const ms  = (60 / bpm) * 1000   // ms per beat

    if (metronomeOn) Metronome.start(bpm)

    // Set up timing windows for each note
    windows.current = lesson.notes.map((n, i) => ({
      idx:       i,
      note:      n.note,
      openTime:  now + (n.beat - 1) * ms,
      closeTime: now + (n.beat - 1) * ms + TIMING_WINDOWS.MAX,
      hit:       false,
    }))

    // Schedule note activation + miss detection
    lesson.notes.forEach((n, i) => {
      const w = windows.current[i]

      // Activate note (highlight it)
      timers.current.push(
          window.setTimeout(() => setNoteIndex(i), w.openTime - now)
      )

      // Close window — mark as miss if not hit
      timers.current.push(
          window.setTimeout(() => {
            if (!w.hit && !n.isRest) {
              scoring.current.recordMiss(w.note, w.openTime)
            }
            // Last note — finish session
            if (i === windows.current.length - 1) {
              setTimeout(() => {
                Metronome.stop()
                setSessionState('finished')
              }, 400)
            }
          }, w.closeTime - now)
      )
    })
  }

  const startSession = useCallback(async () => {
    if (!lesson || sessionState !== 'idle') return
    setSessionState('countdown')
    await Metronome.countdown(3, bpm)
    playRef.current()   // ✅ always calls latest version
  }, [lesson, bpm, sessionState])

  const handleNoteOn = useCallback((midi: number): string | undefined => {
    if (usePracticeStore.getState().sessionState !== 'playing') return
    const now = performance.now()

    // Find an open window that matches timing
    const w = windows.current.find(x =>
        !x.hit &&
        x.openTime - TIMING_WINDOWS.MAX / 2 <= now &&
        now <= x.closeTime
    )
    if (!w) return

    const exp = lesson?.notes[w.idx]
    if (!exp || exp.isRest) return

    const correct = lesson?.instrument === 'drums'
        ? Math.abs(midi - w.note) <= 2
        : midi === w.note

    if (correct) {
      w.hit = true
      scoring.current.recordHit(w.note, w.openTime, midi, now)
      incrementHits()
      return 'hit'
    }
    return 'wrong'
  }, [lesson])

  const restartSession = useCallback(() => {
    Metronome.stop()
    clear()
    reset()
    setSessionState('idle')
  }, [])

  const getScore    = useCallback(() => scoring.current.calculate(), [])
  const getFeedback = useCallback((r: any) => scoring.current.getFeedback(r), [])

  useEffect(() => () => { Metronome.stop(); clear() }, [])

  return { startSession, handleNoteOn, restartSession, getScore, getFeedback }
}