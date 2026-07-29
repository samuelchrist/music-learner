import { useState, useRef } from 'react'
import { NotePlayer }       from '@/lib/audio/NotePlayer'

export function useLessonPlayer() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  function stop() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setPlayingId(null)
  }

  function play(lesson: any) {
    // If already playing this lesson — stop it
    if (playingId === lesson.id) {
      stop()
      return
    }

    // Stop any current playback
    stop()
    setPlayingId(lesson.id)

    const bps      = lesson.bpm / 60          // beats per second
    const notes    = lesson.notes ?? []

    notes.forEach((note: any) => {
      if (note.isRest) return

      const startSec    = (note.beat - 1) / bps
      const durationSec = note.duration  / bps

      const t = setTimeout(() => {
        NotePlayer.play(note.note, durationSec, 0.7)
      }, startSec * 1000)

      timeoutsRef.current.push(t)
    })

    // Auto-stop when done
    if (notes.length > 0) {
      const last      = notes[notes.length - 1]
      const endSec    = ((last.beat - 1) + last.duration) / bps
      const endTimer  = setTimeout(() => {
        setPlayingId(null)
        timeoutsRef.current = []
      }, endSec * 1000 + 200)

      timeoutsRef.current.push(endTimer)
    }
  }

  return { playingId, play, stop }
}
