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
