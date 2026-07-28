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
