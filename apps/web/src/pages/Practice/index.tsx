import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate }  from 'react-router-dom'
import { useMutation }             from '@tanstack/react-query'
import toast                       from 'react-hot-toast'
import { useLesson }               from '@/hooks/useLesson'
import { useMidi }                 from '@/hooks/useMidi'
import { MidiManager } from '@/lib/midi/MidiManager'
import { useMetronome }            from '@/hooks/useMetronome'
import { usePracticeSession }      from '@/hooks/usePracticeSession'
import { usePracticeStore }        from '@/store/practiceStore'
import { useDemoPlayer }           from '@/hooks/useDemoPlayer'
import { useWaitMode }             from '@/hooks/useWaitMode'
import NoteSequence    from '@/components/practice/NoteSequence'
import StaffNotation  from '@/components/practice/StaffNotation'
import SynthesiaRoll  from '@/components/practice/SynthesiaRoll'
import PianoRoll                   from '@/components/practice/PianoRoll'
import BassFretboard               from '@/components/practice/BassFretboard'
import GuitarFretboard             from '@/components/practice/GuitarFretboard'
import DrumKit                     from '@/components/practice/DrumPad'
import FeedbackFlash               from '@/components/practice/FeedbackFlash'
import Countdown                   from '@/components/practice/Countdown'
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
  const { bpm: currentBPM, adjustBPM, metronomeOn, toggleMetronome, setMetronomeOn, setBPM } = useMetronome()
  const { startSession, handleNoteOn, restartSession, getScore, getFeedback } = usePracticeSession()
  const { isPlaying: demoPlaying, demoNoteIdx, demoHitIdx, demoActive, startDemo, stopDemo } = useDemoPlayer()
  const waitMode = useWaitMode()

  const [activeNotes,  setActive]   = useState<Set<number>>(new Set())
  const [expectedNote, setExpected] = useState<number | undefined>()
  const [noteStates,   setNStates]  = useState<NS[]>([])
  const [fbText,       setFbText]   = useState('')
  const [fbColor,      setFbColor]  = useState('')
  const [showFb,       setShowFb]   = useState(false)
  const [scoreResult,  setScore]    = useState<any>(null)
  const [unlocked,     setUnlocked] = useState(false)
  const [hits,         setHits]     = useState(0)
  const [view,         setView]     = useState<'staff' | 'synthesia'>('staff')
  const [rollScrollLeft, setRollScrollLeft] = useState(0)
  const [mode, setMode] = useState<'listen' | 'wait' | 'playalong'>('listen')
  const [preCountdown, setPreCountdown] = useState<{ message: string; color: string; onDone: () => void } | null>(null)

  const [currentVelocity, setCurrentVelocity] = useState(0)
  const [velocityHistory, setVelocityHistory] = useState<number[]>([])
  const velocityTimer = useRef<number>()
  const fbTimer       = useRef<number>()

  const avgVelocity = velocityHistory.length > 0
    ? Math.round(velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length)
    : 0
  const minVelocity = velocityHistory.length > 0 ? Math.min(...velocityHistory) : 0
  const maxVelocity = velocityHistory.length > 0 ? Math.max(...velocityHistory) : 0

  const scaleNoteSet = new Set<number>(
    lesson ? lesson.notes.filter((n: any) => !n.isRest).map((n: any) => n.note) : []
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
        const n = [...p]; n[noteIndex] = 'active'; return n
      })
    }
  }, [noteIndex, sessionState])

  useEffect(() => {
    if (sessionState === 'finished' && mode === 'playalong') {
      const r = getScore()
      setScore(r)
      if (lessonId) submitMut.mutate({ lessonId, bpmPlayed: currentBPM, ...r })
    } else if (sessionState === 'finished') {
      restartSession()
    }
  }, [sessionState, mode])
  const flash = (t: string, c: string) => {
    setFbText(t); setFbColor(c); setShowFb(true)
    clearTimeout(fbTimer.current)
    fbTimer.current = window.setTimeout(() => setShowFb(false), 500)
  }

  const onNoteOn = useCallback((midi: number, velocity: number) => {
    console.log(`MIDI received: ${midi} expected: ${expectedNote}`)
    if (demoPlaying) return

    setActive(p => new Set(p).add(midi))
    setCurrentVelocity(velocity)
    setVelocityHistory(prev => [...prev.slice(-49), velocity])
    clearTimeout(velocityTimer.current)
    velocityTimer.current = window.setTimeout(() => setCurrentVelocity(0), 1000)

    // ── Wait mode ──
    if (mode === 'wait' && waitMode.isActive) {
      const r = waitMode.handleNoteOn(midi, lesson?.instrument || 'piano')
      if (r === 'hit') {
        setNStates(p => { const n = [...p]; n[waitMode.noteIndex] = 'hit'; return n })
        flash('GOOD', '#10b981')
      } else if (r === 'wrong') {
        flash('MISS', '#ef4444')
      }
      return
    }

    // ── Play Along mode ──
    if (mode === 'playalong' && sessionState === 'playing') {
      const r = handleNoteOn(midi)
      if (r === 'hit') {
        setNStates(p => { const n = [...p]; n[noteIndex] = 'hit'; return n })
        setHits(h => h + 1)
        if (velocity >= 64 && velocity <= 100) flash('PERFECT!', '#a855f7')
        else if (velocity < 40)               flash('TOO SOFT', '#3b82f6')
        else if (velocity > 110)              flash('TOO HARD', '#ef4444')
        else                                  flash('GOOD', '#10b981')
      } else if (r === 'wrong') {
        flash('MISS', '#ef4444')
      }
    }
  }, [sessionState, noteIndex, handleNoteOn, demoPlaying, mode, waitMode, lesson])
  const onNoteOff = useCallback((midi: number) => {
    if (demoPlaying) return
    setActive(p => { const n = new Set(p); n.delete(midi); return n })
  }, [demoPlaying])

  const { connected, deviceName, allDevices } = useMidi({ onNoteOn, onNoteOff })

  function handleToggleDemo() {
    if (demoPlaying) {
      stopDemo()
    } else {
      // Stop any active practice session first
      restartSession()
      setNStates(lesson!.notes.map(() => 'pending'))
      setHits(0)
      startDemo(lesson!.notes, currentBPM, view === 'synthesia')
    }
  }

  if (isLoading) return <LoadingSpinner fullScreen />
  if (!lesson)   return <div className="text-center py-20">Lesson not found</div>

  if (sessionState === 'finished' && scoreResult && mode === 'playalong') {
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

  // In demo mode — use demoActive for highlights, demoNoteIdx for scroll
  const displayActive   = demoPlaying ? demoActive : activeNotes
  const displayExpected = demoPlaying
    ? (lesson.notes[demoHitIdx]?.isRest ? undefined : lesson.notes[demoHitIdx]?.note)
    : mode === 'wait'
    ? (lesson.notes[waitMode.noteIndex]?.isRest ? undefined : lesson.notes[waitMode.noteIndex]?.note)
    : expectedNote
  const displayNoteIdx  = demoPlaying ? demoNoteIdx : mode === 'wait' ? waitMode.noteIndex : noteIndex
  const displayHitIdx   = demoPlaying ? demoHitIdx  : displayNoteIdx

  function renderInstrument() {
    switch (lesson!.instrument) {
      case 'bass4':
        return (
          <BassFretboard
            variant="4string"
            activeNotes={displayActive}
            expectedNote={displayExpected}
            scaleNotes={scaleNoteSet}
            onFretPress={midi => onNoteOn(midi, 80)}
          />
        )
      case 'bass5':
        return (
          <BassFretboard
            variant="5string"
            activeNotes={displayActive}
            expectedNote={displayExpected}
            scaleNotes={scaleNoteSet}
            onFretPress={midi => onNoteOn(midi, 80)}
          />
        )
      case 'guitar':
        return (
          <GuitarFretboard
            activeNotes={displayActive}
            expectedNote={displayExpected}
            onFretPress={midi => onNoteOn(midi, 80)}
          />
        )
      case 'drums':
        return (
          <DrumKit
            activeNotes={displayActive}
            expectedNote={displayExpected}
            onPadPress={midi => onNoteOn(midi, 80)}
            onPadRelease={midi => onNoteOff(midi)}
          />
        )
      case 'piano':
      default:
        return (
          <PianoRoll
            activeNotes={displayActive}
            expectedNote={displayExpected}
            scaleNotes={scaleNoteSet}
            startMidi={21}
            endMidi={108}
            onKeyPress={(midi, vel) => onNoteOn(midi, vel)}
            onKeyRelease={midi => onNoteOff(midi)}
            scrollLeft={rollScrollLeft}
            onScrollChange={setRollScrollLeft}
          />
        )
    }
  }

  const currentNote   = lesson.notes[displayHitIdx] ?? lesson.notes[noteIndex]
  const totalNonRests = lesson.notes.filter((n: any) => !n.isRest).length
  const accuracy      = totalNonRests > 0
    ? Math.round((hits / totalNonRests) * 100)
    : 0

  // Demo note states — highlight current demo note in purple
  const displayNoteStates = demoPlaying
    ? lesson.notes.map((_: any, i: number) =>
        i === demoHitIdx ? { status: 'active' as NS }
        : i < demoHitIdx  ? { status: 'hit'    as NS }
        : { status: 'pending' as NS }
      )
    : mode === 'wait' && waitMode.isActive
    ? lesson.notes.map((_: any, i: number) =>
        i === waitMode.noteIndex ? { status: 'active' as NS }
        : i < waitMode.noteIndex  ? { status: 'hit'    as NS }
        : { status: 'pending' as NS }
      )
    : noteStates.map(s => ({ status: s }))
  const statItems = [
    {
      label: 'Instrument',
      value: lesson.instrument.charAt(0).toUpperCase() + lesson.instrument.slice(1),
      color: '#a855f7',
    },
    {
      label: 'Grade / Difficulty',
      value: `Grade ${(lesson as any).grade || 1} · ${lesson.difficulty}`,
      color: '#3b82f6',
    },
    {
      label: demoPlaying ? 'Demo Note' : 'Current Note',
      value: currentNote
        ? currentNote.isRest ? 'Rest' : midiToScientific(currentNote.note)
        : '—',
      color: demoPlaying ? '#f59e0b' : '#10b981',
    },
    {
      label: demoPlaying ? 'Demo Progress' : (sessionState === 'idle' ? 'Total Notes' : 'Progress'),
      value: demoPlaying
        ? `${demoNoteIdx + 1} / ${lesson.notes.length}`
        : sessionState === 'idle'
        ? `${lesson.notes.length} notes · ${lesson.bpm} BPM`
        : `${noteIndex + 1} / ${lesson.notes.length} · ${accuracy}%`,
      color: '#f59e0b',
    },
    {
      label: 'Velocity',
      value: currentVelocity > 0
        ? `${currentVelocity} · ${getVelocityLabel(currentVelocity)}`
        : avgVelocity > 0
        ? `avg ${avgVelocity} · ${getVelocityLabel(avgVelocity)}`
        : '—',
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
      {preCountdown && (
        <Countdown
          bpm={currentBPM}
          message={preCountdown.message}
          color={preCountdown.color}
          onComplete={preCountdown.onDone}
        />
      )}
      <FeedbackFlash text={fbText} color={fbColor} show={showFb} />

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 20px', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
      }}>
        <Button variant="ghost" size="sm" onClick={() => { stopDemo(); nav(ROUTES.LESSONS) }}>
          ← Lessons
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16 }}>{lesson.name}</h2>
          {lesson.composer && (
            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>
              — {lesson.composer}
            </span>
          )}
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
          background: 'rgba(168,85,247,.15)', color: '#a855f7',
          border: '1px solid rgba(168,85,247,.3)',
        }}>
          Grade {(lesson as any).grade || 1}
        </span>

        {/* Demo mode banner */}
        {demoPlaying && (
          <span style={{
            padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: 'rgba(245,158,11,.15)', color: '#f59e0b',
            border: '1px solid rgba(245,158,11,.3)',
            animation: 'pulse 1.5s infinite',
          }}>
            Listen Mode
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {(mode === 'playalong' || mode === 'wait') && (
            <button
              onClick={toggleMetronome}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: `1px solid ${metronomeOn ? '#10b981' : 'var(--border)'}`,
                background: metronomeOn ? 'rgba(16,185,129,.1)' : 'var(--surface2)',
                color: metronomeOn ? '#10b981' : 'var(--text-dim)',
                cursor: 'pointer', transition: 'all .2s',
              }}
            >
              {metronomeOn ? 'Metro ON' : 'Metro OFF'}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => adjustBPM(-1)} style={{
              width: 26, height: 26, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface2)', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
            <input
              type="range" min={20} max={300} value={currentBPM}
              onChange={e => setBPM(Number(e.target.value))}
              style={{ width: 80, accentColor: '#a855f7' }}
            />
            <button onClick={() => adjustBPM(1)} style={{
              width: 26, height: 26, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface2)', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
            <input
              type="number" min={20} max={300} value={currentBPM}
              onChange={e => { const v = Number(e.target.value); if (v >= 20 && v <= 300) setBPM(v) }}
              style={{
                width: 48, background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: 6,
                padding: '3px 6px', fontSize: 13, color: 'var(--text)',
                textAlign: 'center', outline: 'none',
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>BPM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#10b981' : '#475569',
              boxShadow: connected ? '0 0 6px #10b981' : 'none',
              flexShrink: 0,
            }} />
            {allDevices.length > 0 ? (
              <select
                onChange={e => MidiManager.selectDevice(e.target.value)}
                defaultValue={deviceName || ''}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid #10b981',
                  borderRadius: 6, padding: '3px 8px',
                  fontSize: 11, color: '#10b981',
                  cursor: 'pointer', outline: 'none',
                  maxWidth: 180,
                }}
              >
                {allDevices.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>Keyboard Mode</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        borderBottom: '1px solid var(--border)',
        background: demoPlaying ? 'rgba(245,158,11,0.05)' : 'var(--surface2)',
        transition: 'background .3s',
      }}>
        {statItems.map((item, i) => (
          <div key={item.label} style={{
            padding: '10px 12px',
            borderRight: i < statItems.length - 1 ? '1px solid var(--border)' : 'none',
            textAlign: 'center', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <p style={{
              fontSize: 10, color: 'var(--text-sub)',
              textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
            }}>
              {item.label}
            </p>
            <p style={{ fontWeight: 700, fontSize: 12, color: item.color }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
      {/* ── View toggle ── */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        padding: '6px 16px 0',
        background: demoPlaying ? 'rgba(245,158,11,0.03)' : 'var(--surface2)',
        gap: 6,
      }}>
        {(['staff', 'synthesia'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            border: `1px solid ${view === v ? '#a855f7' : 'var(--border)'}`,
            background: view === v ? 'rgba(168,85,247,0.15)' : 'transparent',
            color: view === v ? '#a855f7' : 'var(--text-sub)',
            cursor: 'pointer',
          }}>
            {v === 'staff' ? '𝄞 Staff' : '🎹 Synthesia'}
          </button>
        ))}
      </div>
      {/* ── Note display + velocity meter ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch', gap: 12,
        padding: '12px 16px',
        background: demoPlaying ? 'rgba(245,158,11,0.03)' : 'var(--surface2)',
        transition: 'background .3s',
      }}>
        <div style={{ flex: 1, overflowX: 'auto', minHeight: 120 }}>
          {view === 'staff' ? (
            <StaffNotation
              notes={lesson.notes}
              currentIdx={displayHitIdx}
              instrument={lesson.instrument}
              bpm={currentBPM}
              timeSignature={[4, 4]}
              keySignature={(lesson as any).keySignature || 'C'}
              isPlaying={demoPlaying || sessionState === 'playing'}
              waitBeat={mode === 'wait' && waitMode.isActive ? (lesson.notes[waitMode.noteIndex]?.beat ?? 1) - 1 : undefined}
            />
          ) : (
            <SynthesiaRoll
              notes={lesson.notes}
              currentIdx={displayNoteIdx}
              hitIdx={demoPlaying ? demoHitIdx : displayNoteIdx}
              bpm={currentBPM}
              isPlaying={demoPlaying || sessionState === 'playing'}
              states={displayNoteStates}
              isDemoMode={demoPlaying}
              waitBeat={mode === 'wait' && waitMode.isActive ? (lesson.notes[waitMode.noteIndex]?.beat ?? 1) - 1 : undefined}
              scrollLeft={rollScrollLeft}
              onScrollChange={setRollScrollLeft}
            />
          )}
        </div>

        {lesson.instrument === 'piano' && !demoPlaying && (
          <VelocityMeter
            vertical
            velocity={currentVelocity}
            noteCount={velocityHistory.length}
            avgVelocity={avgVelocity}
            minVelocity={minVelocity}
            maxVelocity={maxVelocity}
          />
        )}
      </div>

      {/* ── Instrument visual ── */}
      {renderInstrument()}

      {/* ── Mode Selector + Start/Stop ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {([
            { id: 'listen',   icon: '👂', label: 'Listen',    color: '#f59e0b' },
            { id: 'wait',     icon: '⏳', label: 'Wait',      color: '#10b981' },
            { id: 'playalong',icon: '🎵', label: 'Play Along', color: '#a855f7' },
          ] as const).map(m => (
            <button
              key={m.id}
              onClick={() => {
                stopDemo()
                waitMode.stop()
                restartSession()
                setNStates(lesson.notes.map(() => 'pending'))
                setHits(0)
                setMode(m.id)
                if (m.id === 'wait' || m.id === 'playalong') setMetronomeOn(true)
                const messages = {
                  listen:    { message: '👂 Listen Mode — Watch the notes play',    color: '#f59e0b' },
                  wait:      { message: '⏳ Wait Mode — Play each note when ready', color: '#10b981' },
                  playalong: { message: '🎵 Play Along — Follow the rhythm!',       color: '#a855f7' },
                }
                const { message, color } = messages[m.id]
                setPreCountdown({
                  message,
                  color,
                  onDone: () => {
                    setPreCountdown(null)
                    if (m.id === 'listen')    handleToggleDemo()
                    if (m.id === 'wait')      waitMode.start(lesson.notes)
                    if (m.id === 'playalong') startSession(view === 'synthesia')
                  }
                })
              }}
              style={{
                padding: '7px 18px', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                border: `2px solid ${mode === m.id ? m.color : 'var(--border)'}`,
                background: mode === m.id ? `${m.color}22` : 'var(--surface2)',
                color: mode === m.id ? m.color : 'var(--text-sub)',
                cursor: 'pointer', transition: 'all .2s',
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Listen mode */}
          {mode === 'listen' && (
            <button
              onClick={handleToggleDemo}
              style={{
                padding: '9px 20px', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                border: `2px solid ${demoPlaying ? '#f59e0b' : '#f59e0b'}`,
                background: demoPlaying ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.1)',
                color: '#f59e0b', cursor: 'pointer', transition: 'all .2s',
              }}
            >
              {demoPlaying ? '⏹ Stop' : '👂 Play Demo'}
            </button>
          )}

          {/* Wait mode */}
          {mode === 'wait' && (
            <button
              onClick={() => {
                if (waitMode.isActive) {
                  waitMode.stop()
                  setNStates(lesson.notes.map(() => 'pending'))
                } else {
                  setNStates(lesson.notes.map(() => 'pending'))
                  setHits(0)
                  waitMode.start(lesson.notes)
                }
              }}
              style={{
                padding: '9px 20px', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                border: '2px solid #10b981',
                background: waitMode.isActive ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.1)',
                color: '#10b981', cursor: 'pointer', transition: 'all .2s',
              }}
            >
              {waitMode.isActive ? '⏹ Stop' : '⏳ Start (Wait)'}
            </button>
          )}

          {/* Play Along mode */}
          {mode === 'playalong' && (
            <Button
              onClick={() => startSession(view === 'synthesia')}
              disabled={sessionState !== 'idle'}
            >
              ▶ Start (3-2-1)
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              stopDemo()
              waitMode.stop()
              restartSession()
              setNStates(lesson.notes.map(() => 'pending'))
              setHits(0)
              setVelocityHistory([])
            }}
          >
            ↺ Restart
          </Button>
        </div>
      </div>
    </div>
  )
}
