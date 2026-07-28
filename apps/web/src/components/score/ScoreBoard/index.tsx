import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence }      from 'framer-motion'
import Button                           from '@/components/ui/Button'
import type { ScoreResult }             from '@music-learner/shared'

// ── Confetti particle ─────────────────────────────────────────
interface Particle {
  id:     number
  x:      number
  y:      number
  vx:     number
  vy:     number
  color:  string
  size:   number
  rotate: number
  vr:     number
  shape:  'rect' | 'circle'
}

const COLORS = ['#a855f7','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4']

function useConfetti(trigger: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animRef   = useRef<number>()

  useEffect(() => {
    if (!trigger) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    // Create particles
    particles.current = Array.from({ length: 120 }, (_, i) => ({
      id:     i,
      x:      Math.random() * canvas.width,
      y:      -20,
      vx:     (Math.random() - 0.5) * 6,
      vy:     Math.random() * 4 + 2,
      color:  COLORS[Math.floor(Math.random() * COLORS.length)],
      size:   Math.random() * 10 + 4,
      rotate: Math.random() * 360,
      vr:     (Math.random() - 0.5) * 8,
      shape:  Math.random() > 0.5 ? 'rect' : 'circle',
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current = particles.current.filter(p => p.y < canvas.height + 20)

      particles.current.forEach(p => {
        p.x      += p.vx
        p.y      += p.vy
        p.vy     += 0.08
        p.rotate += p.vr

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotate * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height)

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })

      if (particles.current.length > 0) {
        animRef.current = requestAnimationFrame(draw)
      }
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [trigger])

  return canvasRef
}

// ── Grade config ──────────────────────────────────────────────
const GRADE_CONFIG: Record<string, { color: string; glow: string; message: string }> = {
  'S':  { color: '#a855f7', glow: '#7c3aed', message: 'PERFECT!' },
  'A+': { color: '#f59e0b', glow: '#d97706', message: 'EXCELLENT!' },
  'A':  { color: '#f59e0b', glow: '#d97706', message: 'GREAT!' },
  'B+': { color: '#3b82f6', glow: '#2563eb', message: 'GOOD JOB!' },
  'B':  { color: '#3b82f6', glow: '#2563eb', message: 'NICE WORK!' },
  'C':  { color: '#10b981', glow: '#059669', message: 'KEEP GOING!' },
  'D':  { color: '#6b7280', glow: '#4b5563', message: 'PRACTICE MORE' },
  'F':  { color: '#ef4444', glow: '#dc2626', message: 'TRY AGAIN!' },
}

interface Props {
  result:     ScoreResult
  lessonName: string
  feedback:   string
  unlocked:   boolean
  onRetry:    () => void
  onNext:     () => void
  onHome:     () => void
}

export default function ScoreBoard({
  result, lessonName, feedback, unlocked, onRetry, onNext, onHome
}: Props) {
  const [showBars, setShowBars] = useState(false)
  const grade     = result.grade
  const gradeConf = GRADE_CONFIG[grade] || GRADE_CONFIG['C']
  const confetti  = grade === 'S' || grade === 'A+' || grade === 'A'
  const canvasRef = useConfetti(confetti)

  useEffect(() => {
    const t = setTimeout(() => setShowBars(true), 600)
    return () => clearTimeout(t)
  }, [])

  const bars = [
    { label: 'Notes Hit',          value: result.noteAccuracy,   color: '#a855f7', icon: '🎵' },
    { label: 'Timing Accuracy',    value: result.timingAccuracy, color: '#3b82f6', icon: '⏱' },
    { label: 'Rhythm Consistency', value: result.rhythmScore,    color: '#10b981', icon: '🎶' },
    { label: 'Overall Score',      value: result.overall,        color: '#f59e0b', icon: '⭐' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}>

      {/* Confetti canvas */}
      {confetti && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-50"
        />
      )}

      {/* Background glow */}
      <div style={{
        position:     'fixed',
        top:          '30%',
        left:         '50%',
        transform:    'translate(-50%, -50%)',
        width:        400,
        height:       400,
        borderRadius: '50%',
        background:   `radial-gradient(circle, ${gradeConf.glow}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div className="relative z-10 flex flex-col items-center gap-6 py-10 px-6 w-full max-w-lg">

        {/* Grade display */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div style={{
            fontSize:   100,
            fontWeight: 900,
            color:      gradeConf.color,
            lineHeight: 1,
            textShadow: `0 0 40px ${gradeConf.glow}, 0 0 80px ${gradeConf.glow}44`,
            filter:     'drop-shadow(0 0 20px ' + gradeConf.glow + ')',
          }}>
            {grade}
          </div>

          {/* Grade message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              textAlign:  'center',
              fontSize:   14,
              fontWeight: 800,
              color:      gradeConf.color,
              letterSpacing: '0.2em',
              marginTop:  -8,
            }}
          >
            {gradeConf.message}
          </motion.div>
        </motion.div>

        {/* Lesson name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-slate-200">{lessonName}</h2>
          <p className="text-slate-400 mt-1 text-sm">{feedback}</p>
        </motion.div>

        {/* Score bars */}
        <div className="w-full space-y-3">
          {bars.map((bar, i) => (
            <motion.div
              key={bar.label}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              style={{
                background:   '#1a1a2e',
                border:       '1px solid #1e293b',
                borderRadius: 10,
                padding:      '12px 16px',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }}>{bar.icon}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                    {bar.label}
                  </span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: bar.color }}>
                  {bar.value}%
                </span>
              </div>
              <div style={{
                height:       8,
                background:   '#0f172a',
                borderRadius: 4,
                overflow:     'hidden',
              }}>
                <motion.div
                  style={{
                    height:       '100%',
                    borderRadius: 4,
                    background:   `linear-gradient(90deg, ${bar.color}88, ${bar.color})`,
                    boxShadow:    `0 0 8px ${bar.color}66`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: showBars ? `${bar.value}%` : 0 }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hits / Misses stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            display:      'flex',
            gap:          24,
            background:   '#1a1a2e',
            border:       '1px solid #1e293b',
            borderRadius: 12,
            padding:      '16px 32px',
          }}
        >
          {[
            { label: 'Hits',   value: result.hits,        color: '#10b981', icon: '✅' },
            { label: 'Misses', value: result.misses,      color: '#ef4444', icon: '❌' },
            { label: 'Total',  value: result.totalNotes,  color: '#64748b', icon: '🎵' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div style={{ fontSize: 24, marginBottom: 2 }}>{s.icon}</div>
              <p style={{ fontSize: 24, fontWeight: 900, color: s.color }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, color: '#64748b' }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Unlock badge */}
        <AnimatePresence>
          {unlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              style={{
                width:        '100%',
                padding:      '14px 20px',
                background:   'rgba(16,185,129,0.1)',
                border:       '1px solid rgba(16,185,129,0.4)',
                borderRadius: 12,
                textAlign:    'center',
                color:        '#10b981',
                fontWeight:   700,
                fontSize:     15,
              }}
            >
              🏆 Next lesson unlocked! Keep going!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex gap-3 flex-wrap justify-center w-full"
        >
          <Button variant="secondary" onClick={onRetry}>
            ↺ Retry
          </Button>
          <Button variant="primary" onClick={onNext}>
            Next Lesson →
          </Button>
          <Button variant="ghost" onClick={onHome}>
            🏠 Home
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
