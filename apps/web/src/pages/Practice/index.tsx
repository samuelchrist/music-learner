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
