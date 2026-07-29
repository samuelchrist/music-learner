import { useState, useRef, useCallback } from 'react'
import { NotePlayer } from '@/lib/audio/NotePlayer'

const LOOKAHEAD_BEATS = 6

export function useDemoPlayer() {
  const [isPlaying,   setIsPlaying]   = useState(false)
  const [demoNoteIdx, setDemoNoteIdx] = useState(-1)
  const [demoHitIdx,  setDemoHitIdx]  = useState(-1)
  const [demoActive,  setDemoActive]  = useState<Set<number>>(new Set())
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const stopDemo = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setIsPlaying(false)
    setDemoNoteIdx(-1)
    setDemoHitIdx(-1)
    setDemoActive(new Set())
  }, [])

  const startDemo = useCallback((notes: any[], bpm: number, useLookahead = false) => {
    stopDemo()
    setIsPlaying(true)

    const bps          = bpm / 60
    // Only delay audio for Synthesia view (falling notes need travel time)
    const lookaheadSec = useLookahead ? LOOKAHEAD_BEATS / bps : 0

    notes.forEach((note: any, idx: number) => {
      const visualSec   = (note.beat - 1) / bps
      const audioSec    = visualSec + lookaheadSec
      const durationSec = note.duration / bps

      // Visual scroll/staff position
      const tVisual = setTimeout(() => {
        setDemoNoteIdx(idx)
      }, visualSec * 1000)

      // Audio + key highlight
      const tAudio = setTimeout(() => {
        setDemoHitIdx(idx)
        if (!note.isRest) {
          setDemoActive(new Set([note.note]))
          NotePlayer.play(note.note, durationSec, 0.75)
        } else {
          setDemoActive(new Set())
        }
      }, audioSec * 1000)

      const tEnd = setTimeout(() => {
        setDemoActive(new Set())
      }, (audioSec + durationSec * 0.9) * 1000)

      timersRef.current.push(tVisual, tAudio, tEnd)
    })

    if (notes.length > 0) {
      const last   = notes[notes.length - 1]
      const endSec = ((last.beat - 1) + last.duration) / bps + lookaheadSec
      const tDone  = setTimeout(() => {
        setIsPlaying(false)
        setDemoNoteIdx(-1)
        setDemoHitIdx(-1)
        setDemoActive(new Set())
        timersRef.current = []
      }, endSec * 1000 + 500)
      timersRef.current.push(tDone)
    }
  }, [stopDemo])

  return { isPlaying, demoNoteIdx, demoHitIdx, demoActive, startDemo, stopDemo }
}
