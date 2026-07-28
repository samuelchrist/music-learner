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
import GuitarFretboard             from '@/components/practice/GuitarFretboard'
import DrumKit                     from '@/components/practice/DrumPad'
import FeedbackFlash               from '@/components/practice/FeedbackFlash'
import Countdown                   from '@/components/practice/Countdown'
import KeyboardGuide               from '@/components/practice/KeyboardGuide'
import VelocityMeter               from '@/components/practice/VelocityMeter'
import ScoreBoard                  from '@/components/score/ScoreBoard'
import Button                      from '@/components/ui/Button'
import LoadingSpinner              from '@/components/ui/LoadingSpinner'
import { scoreService }            from '@/services/score.service'
import { ROUTES }                  from '@/constants/routes'

type NS = 'pending' | 'active' | 'hit' | 'miss'

function midiToScientific(midi: number): string {
  if (!midi || midi === 0) return '—'
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`
}

function getVelocityLabel(v: number): string {
  if (v === 0)  return '—'
  if (v <= 20)  return 'ppp'
  if (v <= 40)  return 'pp'
  if (v <= 55)  return 'p'
  if (v <= 70)  return 'mp'
  if (v <= 85)  return 'mf'
  if (v <= 100) return 'f'
  if (v <= 115) return 'ff'
  return 'fff'
}

export default function Practice() {
  const { lessonId }  = useParams<{ lessonId: string }>()
  const nav           = useNavigate()
  const { data: lesson, isLoading } = useLesson(lessonId!)
  const { sessionState, noteIndex, setLesson } = usePracticeStore()
  const { bpm: currentBPM, adjustBPM, metronomeOn, toggleMetronome, setBPM } = useMetronome()
  const { startSession, handleNoteOn, restartSession, getScore, getFeedback } = usePracticeSession()

  const [activeNotes,  setActive]   = useState<Set<number>>(new Set())
  const [expectedNote, setExpected] = useState<number | undefined>()
  const [noteStates,   setNStates]  = useState<NS[]>([])
  const [fbText,       setFbText]   = useState('')
  const [fbColor,      setFbColor]  = useState('')
  const [showFb,       setShowFb]   = useState(false)
  const [scoreResult,  setScore]    = useState<any>(null)
  const [unlocked,     setUnlocked] = useState(false)
  const [hits,         setHits]     = useState(0)

  // ── Velocity tracking ────────────────────────────────────────
  const [currentVelocity, setCurrentVelocity] = useState(0)
  const [velocityHistory, setVelocityHistory] = useState<number[]>([])
  const velocityTimer = useRef<number>()
  const fbTimer       = useRef<number>()

  const avgVelocity = velocityHistory.length > 0
    ? Math.round(velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length)
    : 0
  const minVelocity = velocityHistory.length > 0 ? Math.min(...velocityHistory) : 0
  const maxVelocity = velocityHistory.length > 0 ? Math.max(...velocityHistory) : 0

  // ── All unique notes in this lesson (for scale highlighting) ─
  const scaleNoteSet = new Set<number>(
    lesson
      ? lesson.notes.filter(n => !n.isRest).map(n => n.note)
      : []
  )

  const submitMut = useMutation({
    mutationFn: scoreService.submit,
    onSuccess: ({ data }) => {
      setUnlocked(data.data.unlocked)
      toast.success(`+${data.data.xpGained} XP!`)
    }
  })

  useEffect(() => {
    if (lesson) {
      setLesson(lesson)
      setBPM(lesson.bpm)
      setNStates(lesson.notes.map(() => 'pending'))
      setExpected(lesson.notes[0]?.note)
      setHits(0)
      setVelocityHistory([])
      setCurrentVelocity(0)
    }
  }, [lesson])

  useEffect(() => {
    if (sessionState === 'playing' && lesson) {
      setExpected(lesson.notes[noteIndex]?.note)
      setNStates(p => {
        const n = [...p]
        n[noteIndex] = 'active'
        return n
      })
    }
  }, [noteIndex, sessionState])

  useEffect(() => {
    if (sessionState === 'finished') {
      const r = getScore()
      setScore(r)
      if (lessonId) submitMut.mutate({ lessonId, bpmPlayed: currentBPM, ...r })
    }
  }, [sessionState])

  const flash = (t: string, c: string) => {
    setFbText(t); setFbColor(c); setShowFb(true)
    clearTimeout(fbTimer.current)
    fbTimer.current = window.setTimeout(() => setShowFb(false), 500)
  }

  const onNoteOn = useCallback((midi: number, velocity: number) => {
    setActive(p => new Set(p).add(midi))

    // Track velocity
    setCurrentVelocity(velocity)
    setVelocityHistory(prev => [...prev.slice(-49), velocity])
    clearTimeout(velocityTimer.current)
    velocityTimer.current = window.setTimeout(() => setCurrentVelocity(0), 1000)

    if (sessionState !== 'playing') return
    const r = handleNoteOn(midi)
    if (r === 'hit') {
      setNStates(p => { const n = [...p]; n[noteIndex] = 'hit'; return n })
      setHits(h => h + 1)
      if (velocity >= 64 && velocity <= 100)    flash('PERFECT!', '#a855f7')
      else if (velocity < 40)                   flash('TOO SOFT', '#3b82f6')
      else if (velocity > 110)                  flash('TOO HARD', '#ef4444')
      else                                      flash('GOOD', '#10b981')
    } else if (r === 'wrong') {
      flash('✗', '#ef4444')
    }
  }, [sessionState, noteIndex, handleNoteOn])

  const onNoteOff = useCallback((midi: number) => {
    setActive(p => { const n = new Set(p); n.delete(midi); return n })
  }, [])

  const { connected, deviceName } = useMidi({ onNoteOn, onNoteOff })

  if (isLoading) return <LoadingSpinner fullScreen />
  if (!lesson)   return <div className="text-center py-20">Lesson not found</div>

  if (sessionState === 'finished' && scoreResult) {
    return (
      <ScoreBoard
        result={scoreResult}
        lessonName={lesson.name}
        feedback={getFeedback(scoreResult)}
        unlocked={unlocked}
        onRetry={() => {
          restartSession()
          setNStates(lesson.notes.map(() => 'pending'))
          setHits(0)
          setVelocityHistory([])
        }}
        onNext={() => nav(ROUTES.LESSONS)}
        onHome={() => nav(ROUTES.HOME)}
      />
    )
  }

  // ── Render correct instrument ─────────────────────────────────
  // scaleNoteSet is defined ABOVE this function ✅
  function renderInstrument() {
    switch (lesson!.instrument) {
      case 'guitar':
        return (
          <GuitarFretboard
            activeNotes={activeNotes}
            expectedNote={expectedNote}
            onFretPress={midi => onNoteOn(midi, 80)}
          />
        )
      case 'drums':
        return (
          <DrumKit
            activeNotes={activeNotes}
            expectedNote={expectedNote}
            onPadPress={midi => onNoteOn(midi, 80)}
            onPadRelease={midi => onNoteOff(midi)}
          />
        )
      case 'piano':
      default:
        return (
          <PianoRoll
            activeNotes={activeNotes}
            expectedNote={expectedNote}
            scaleNotes={scaleNoteSet}
            startMidi={21}
            endMidi={108}
            onKeyPress={(midi, vel) => onNoteOn(midi, vel)}
            onKeyRelease={midi => onNoteOff(midi)}
          />
        )
    }
  }

  // ── Stats bar data ────────────────────────────────────────────
  const currentNote   = lesson.notes[noteIndex]
  const totalNonRests = lesson.notes.filter(n => !n.isRest).length
  const accuracy      = totalNonRests > 0
    ? Math.round((hits / totalNonRests) * 100)
    : 0

  const statItems = [
    {
      label: 'Instrument',
      value: lesson.instrument.charAt(0).toUpperCase() + lesson.instrument.slice(1),
      icon:  lesson.instrument === 'piano' ? '🎹'
           : lesson.instrument === 'guitar' ? '🎸' : '🥁',
      color: '#a855f7',
    },
    {
      label: 'Grade / Difficulty',
      value: `Grade ${(lesson as any).grade || 1} · ${lesson.difficulty}`,
      icon:  '📚',
      color: '#3b82f6',
    },
    {
      label: 'Current Note',
      value: currentNote
        ? currentNote.isRest
          ? 'Rest'
          : midiToScientific(currentNote.note)
        : '—',
      icon:  '🎵',
      color: '#10b981',
    },
    {
      label: sessionState === 'idle' ? 'Total Notes' : 'Progress',
      value: sessionState === 'idle'
        ? `${lesson.notes.length} notes · ${lesson.bpm} BPM`
        : `${noteIndex + 1} / ${lesson.notes.length} · ${accuracy}%`,
      icon:  '📊',
      color: '#f59e0b',
    },
    {
      label: 'Velocity',
      value: currentVelocity > 0
        ? `${currentVelocity} · ${getVelocityLabel(currentVelocity)}`
        : avgVelocity > 0
        ? `avg ${avgVelocity} · ${getVelocityLabel(avgVelocity)}`
        : '—',
      icon:  '💪',
      color: currentVelocity > 110 ? '#ef4444'
           : currentVelocity > 85  ? '#f97316'
           : currentVelocity > 55  ? '#10b981'
           : currentVelocity > 0   ? '#3b82f6'
           : '#475569',
    },
  ]

  return (
    <div className="flex flex-col min-h-[calc(100vh-57px)]">
      {sessionState === 'countdown' && (
        <Countdown bpm={currentBPM} onComplete={() => {}} />
      )}
      <FeedbackFlash text={fbText} color={fbColor} show={showFb} />

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 20px', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
      }}>
        <Button variant="ghost" size="sm" onClick={() => nav(ROUTES.LESSONS)}>
          ← Lessons
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>
            {lesson.instrument === 'piano'  ? '🎹'
           : lesson.instrument === 'guitar' ? '🎸' : '🥁'}
          </span>
          <h2 style={{ fontWeight: 700, fontSize: 16 }}>{lesson.name}</h2>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
          background: 'rgba(168,85,247,.15)', color: '#a855f7',
          border: '1px solid rgba(168,85,247,.3)',
        }}>
          Grade {(lesson as any).grade || 1}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, padding: '4px 12px', borderRadius: 999,
            border: `1px solid ${connected ? '#10b981' : 'var(--border)'}`,
            color: connected ? '#10b981' : 'var(--text-sub)',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#10b981' : '#475569',
              boxShadow: connected ? '0 0 6px #10b981' : 'none',
            }} />
            {connected ? deviceName || 'MIDI Connected' : 'Keyboard Mode'}
          </div>
          <span style={{
            color: '#a855f7', fontWeight: 700, fontSize: 14,
            background: 'rgba(168,85,247,.1)',
            padding: '4px 12px', borderRadius: 8,
            border: '1px solid rgba(168,85,247,.2)',
          }}>
            ♩ {currentBPM} BPM
          </span>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface2)',
      }}>
        {statItems.map((item, i) => (
          <div key={item.label} style={{
            padding: '10px 12px',
            borderRight: i < statItems.length - 1
              ? '1px solid var(--border)' : 'none',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
          }}>
            <p style={{
              fontSize: 10, color: 'var(--text-sub)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em', fontWeight: 600,
            }}>
              {item.label}
            </p>
            <p style={{ fontWeight: 700, fontSize: 12, color: item.color }}>
              {item.icon} {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Note sequence ─────────────────────────────────────── */}
      <div style={{
        flex: 1, padding: 20,
        background: 'var(--surface2)',
        overflowX: 'auto', minHeight: 120,
      }}>
        <NoteSequence
          notes={lesson.notes}
          activeIdx={noteIndex}
          states={noteStates.map(s => ({ status: s }))}
        />
      </div>

      {/* ── Instrument visual ─────────────────────────────────── */}
      {renderInstrument()}

      {/* ── Velocity meter (piano only) ───────────────────────── */}
      {lesson.instrument === 'piano' && (
        <VelocityMeter
          velocity={currentVelocity}
          noteCount={velocityHistory.length}
          avgVelocity={avgVelocity}
          minVelocity={minVelocity}
          maxVelocity={maxVelocity}
        />
      )}

      {/* ── Keyboard guide ────────────────────────────────────── */}
      <KeyboardGuide instrument={lesson.instrument as any} />

      {/* ── Controls ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px', background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleMetronome}
            style={{
              padding: '8px 14px', borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              border: `1px solid ${metronomeOn ? '#10b981' : 'var(--border)'}`,
              background: metronomeOn
                ? 'rgba(16,185,129,.1)' : 'var(--surface2)',
              color: metronomeOn ? '#10b981' : 'var(--text-dim)',
              cursor: 'pointer', transition: 'all .2s',
            }}
          >
            🎵 Metronome: {metronomeOn ? 'ON' : 'OFF'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => adjustBPM(-5)} style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface2)', color: 'var(--text)',
              cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
            <input
              type="range" min={40} max={200} value={currentBPM}
              onChange={e => setBPM(Number(e.target.value))}
              style={{ width: 100, accentColor: '#a855f7' }}
            />
            <button onClick={() => adjustBPM(5)} style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface2)', color: 'var(--text)',
              cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
            <span style={{
              fontSize: 13, color: 'var(--text-sub)', minWidth: 60,
            }}>
              {currentBPM} BPM
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => {
              restartSession()
              setNStates(lesson.notes.map(() => 'pending'))
              setHits(0)
              setVelocityHistory([])
            }}
          >
            ↺ Restart
          </Button>
          <Button
            onClick={startSession}
            disabled={sessionState !== 'idle'}
          >
            ▶ Start (3-2-1)
          </Button>
        </div>
      </div>
    </div>
  )
}
