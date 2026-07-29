import { useEffect, useRef, useCallback } from 'react'
import type { Note } from '@music-learner/shared'

interface Props {
  notes:        Note[]
  currentIdx:   number
  hitIdx?:      number
  waitBeat?:    number
  bpm:          number
  isPlaying:    boolean
  isDemoMode?:  boolean
  activeNotes?: Set<number>
  states?:      { status: 'pending' | 'active' | 'hit' | 'miss' }[]
}
const MIN_MIDI = 21
const MAX_MIDI = 108
const IS_BLACK = [false,true,false,true,false,false,true,false,true,false,true,false]

function isBlack(midi: number) { return IS_BLACK[midi % 12] }
function getNoteLabel(midi: number) {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`
}

let layoutCache: Map<number, { x: number; w: number }> | null = null
let cacheW = 0

function buildLayout(W: number) {
  if (layoutCache && cacheW === W) return layoutCache
  layoutCache = new Map(); cacheW = W
  let totalWhites = 0
  for (let m = MIN_MIDI; m <= MAX_MIDI; m++) if (!isBlack(m)) totalWhites++
  const ww = W / totalWhites
  const bw = ww * 0.58
  let wi = 0
  for (let m = MIN_MIDI; m <= MAX_MIDI; m++) {
    if (!isBlack(m)) { layoutCache.set(m, { x: wi * ww, w: ww - 1 }); wi++ }
    else {
      let pw = 0
      for (let k = MIN_MIDI; k < m; k++) if (!isBlack(k)) pw++
      layoutCache.set(m, { x: pw * ww - bw / 2, w: bw })
    }
  }
  return layoutCache
}

const LOOKAHEAD = 6
const KEY_H     = 100
const ROLL_H    = 360
const CANVAS_H  = ROLL_H + KEY_H
const HIT_Y     = ROLL_H

function getSongEnd(notes: Note[]) {
  let max = 0
  notes.forEach(n => { const e = (n.beat-1)+n.duration; if(e>max) max=e })
  return max
}

// Fancy color palettes per note family
function getNoteColors(midi: number, status: string, isCurrent: boolean, isDemoMode: boolean) {
  const chroma = midi % 12
  // 12 color families — rainbow mapped to chromatic scale
  const palettes = [
    { top: '#c084fc', bot: '#7c3aed', glow: '#a855f7' }, // C  — purple
    { top: '#e879f9', bot: '#a21caf', glow: '#d946ef' }, // C# — fuchsia
    { top: '#f472b6', bot: '#be185d', glow: '#ec4899' }, // D  — pink
    { top: '#fb7185', bot: '#be123c', glow: '#f43f5e' }, // D# — rose
    { top: '#f97316', bot: '#c2410c', glow: '#fb923c' }, // E  — orange
    { top: '#fbbf24', bot: '#b45309', glow: '#f59e0b' }, // F  — amber
    { top: '#a3e635', bot: '#4d7c0f', glow: '#84cc16' }, // F# — lime
    { top: '#34d399', bot: '#065f46', glow: '#10b981' }, // G  — emerald
    { top: '#22d3ee', bot: '#0e7490', glow: '#06b6d4' }, // G# — cyan
    { top: '#60a5fa', bot: '#1d4ed8', glow: '#3b82f6' }, // A  — blue
    { top: '#818cf8', bot: '#3730a3', glow: '#6366f1' }, // A# — indigo
    { top: '#a78bfa', bot: '#5b21b6', glow: '#8b5cf6' }, // B  — violet
  ]

  const base = palettes[chroma]

  if (isCurrent) {
    return { top: '#ffffff', bot: base.glow, glow: base.glow, alpha: 1 }
  }
  if (!isDemoMode) {
    if (status === 'hit')  return { top: '#6ee7b7', bot: '#065f46', glow: '#10b981', alpha: 0.9 }
    if (status === 'miss') return { top: '#fca5a5', bot: '#7f1d1d', glow: '#ef4444', alpha: 0.9 }
  }
  return { ...base, alpha: 0.75 }
}

export default function SynthesiaRoll({
  notes, currentIdx, hitIdx, bpm, isPlaying,
  isDemoMode = false, activeNotes = new Set(), states = [], waitBeat
}: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const animRef      = useRef<number>()
  const startRef     = useRef<number>(0)
  const startBeatRef = useRef<number>(0)
  const curBeatRef   = useRef<number>(-LOOKAHEAD)
  const stoppedRef   = useRef<boolean>(false)
  const waitAnimStartRef = useRef<number>(0)
  const waitTargetRef    = useRef<number>(0)

  const songEnd = getSongEnd(notes)
  const colorIdx = hitIdx !== undefined ? hitIdx : currentIdx

  useEffect(() => {
    if (isPlaying) {
      startRef.current     = performance.now()
      startBeatRef.current = -LOOKAHEAD
      stoppedRef.current   = false
    } else if (waitBeat !== undefined) {
      startRef.current     = performance.now()
      startBeatRef.current = waitBeat - LOOKAHEAD  // note starts at TOP
      waitTargetRef.current = waitBeat
      stoppedRef.current   = false
    } else {
      stoppedRef.current   = false
      curBeatRef.current   = -LOOKAHEAD
    }
  }, [isPlaying, waitBeat])
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx    = canvas.getContext('2d')!
    const W      = canvas.width
    const layout = buildLayout(W)
    const pxPerBeat = HIT_Y / LOOKAHEAD

    ctx.clearRect(0, 0, W, CANVAS_H)

    if (isPlaying && !stoppedRef.current) {
      const elapsed = (performance.now() - startRef.current) / 1000
      curBeatRef.current = startBeatRef.current + elapsed * (bpm / 60)
      if (curBeatRef.current >= songEnd + 1) {
        stoppedRef.current = true
        curBeatRef.current = songEnd + 1
      }
    } else if (!isPlaying && waitBeat !== undefined) {
      const elapsed = (performance.now() - startRef.current) / 1000
      const animBeat = startBeatRef.current + elapsed * (bpm / 60)
      curBeatRef.current = Math.min(animBeat, waitTargetRef.current)
    }
    const cb = curBeatRef.current

    // ── Background gradient ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, HIT_Y)
    bgGrad.addColorStop(0, '#060b14')
    bgGrad.addColorStop(1, '#0d1b2e')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, HIT_Y)

    // ── Lane lines ──
    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi++) {
      if (isBlack(midi)) continue
      const l = layout.get(midi)!
      if (midi % 12 === 0) {
        ctx.strokeStyle = 'rgba(148,163,184,0.08)'
        ctx.lineWidth = 1
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.02)'
        ctx.lineWidth = 0.5
      }
      ctx.beginPath(); ctx.moveTo(l.x+l.w,0); ctx.lineTo(l.x+l.w,HIT_Y); ctx.stroke()
    }

    // ── Beat grid ──
    for (let b = Math.floor(cb); b < cb + LOOKAHEAD + 2; b++) {
      const y = HIT_Y - (b - cb) * pxPerBeat
      if (y < 0 || y > HIT_Y) continue
      ctx.strokeStyle = b % 4 === 0 ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.02)'
      ctx.lineWidth = b % 4 === 0 ? 1 : 0.5
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke()
    }

    // ── Falling notes ──
    const pressedKeys = new Set<number>()

    notes.forEach((note, idx) => {
      if (note.isRest || !note.note) return
      const l = layout.get(note.note); if (!l) return
      const noteBeat = note.beat - 1
      const noteEnd  = noteBeat + note.duration
      if (noteBeat > cb + LOOKAHEAD + 1) return
      if (noteEnd  < cb - 0.5)           return

      const status    = states[idx]?.status || 'pending'
      const isCurrent = idx === colorIdx
      const colors    = getNoteColors(note.note, status, isCurrent, isDemoMode)

      if (noteBeat <= cb && noteEnd >= cb) pressedKeys.add(note.note)

      const topY    = HIT_Y - (noteBeat - cb) * pxPerBeat
      const botY    = HIT_Y - (noteEnd  - cb) * pxPerBeat
      const drawTop = Math.max(0, Math.min(topY, HIT_Y))
      const drawBot = Math.max(0, Math.min(botY, HIT_Y))
      const drawH   = Math.abs(drawTop - drawBot)
      if (drawH < 1) return

      const yPos   = Math.min(drawTop, drawBot)
      const radius = Math.min(6, l.w / 3)

      // Gradient fill
      const grad = ctx.createLinearGradient(l.x, yPos, l.x, yPos + drawH)
      grad.addColorStop(0, colors.top)
      grad.addColorStop(1, colors.bot)

      // Outer glow
      ctx.shadowColor = colors.glow
      ctx.shadowBlur  = isCurrent ? 24 : 10
      ctx.globalAlpha = colors.alpha

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(l.x + 1, yPos, l.w - 2, drawH, [radius, radius, 0, 0])
      ctx.fill()

      // Inner shine highlight
      ctx.shadowBlur  = 0
      ctx.globalAlpha = 0.25
      const shine = ctx.createLinearGradient(l.x, yPos, l.x + l.w, yPos)
      shine.addColorStop(0, 'rgba(255,255,255,0.6)')
      shine.addColorStop(0.4, 'rgba(255,255,255,0)')
      ctx.fillStyle = shine
      ctx.beginPath()
      ctx.roundRect(l.x + 1, yPos, l.w * 0.4, drawH, [radius, radius, 0, 0])
      ctx.fill()

      ctx.globalAlpha = 1
      ctx.shadowBlur  = 0

      // Note label
      if (drawH > 14 && l.w > 14) {
        ctx.fillStyle    = 'rgba(255,255,255,0.95)'
        ctx.font         = `bold ${Math.min(10, l.w * 0.4)}px Arial`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(getNoteLabel(note.note), l.x + l.w/2, yPos + Math.min(drawH/2, 10))
      }
    })

    // ── Hit line glow ──
    const hitGrad = ctx.createLinearGradient(0, HIT_Y-4, 0, HIT_Y+4)
    hitGrad.addColorStop(0, 'rgba(168,85,247,0.8)')
    hitGrad.addColorStop(1, 'rgba(168,85,247,0)')
    ctx.fillStyle = hitGrad
    ctx.fillRect(0, HIT_Y-4, W, 8)
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur  = 20
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth   = 1.5
    ctx.beginPath(); ctx.moveTo(0,HIT_Y); ctx.lineTo(W,HIT_Y); ctx.stroke()
    ctx.shadowBlur  = 0

    // ── Keyboard background ──
    const kbGrad = ctx.createLinearGradient(0, HIT_Y, 0, CANVAS_H)
    kbGrad.addColorStop(0, '#0d1b2e')
    kbGrad.addColorStop(1, '#060b14')
    ctx.fillStyle = kbGrad
    ctx.fillRect(0, HIT_Y, W, KEY_H)

    const blackH = KEY_H * 0.62

    // White keys
    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi++) {
      if (isBlack(midi)) continue
      const l       = layout.get(midi)!
      const pressed = pressedKeys.has(midi) || activeNotes.has(midi)

      if (pressed) {
        const pc = getNoteColors(midi, 'active', true, isDemoMode)
        const kg = ctx.createLinearGradient(l.x, HIT_Y, l.x, HIT_Y + KEY_H)
        kg.addColorStop(0, pc.top)
        kg.addColorStop(1, pc.bot)
        ctx.shadowColor = pc.glow; ctx.shadowBlur = 16
        ctx.fillStyle   = kg
      } else {
        ctx.fillStyle   = 'rgba(241,245,249,0.92)'
        ctx.shadowBlur  = 0
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'
      ctx.lineWidth   = 0.5
      ctx.beginPath()
      ctx.roundRect(l.x, HIT_Y+1, l.w-0.5, KEY_H-2, [0,0,4,4])
      ctx.fill(); ctx.stroke()
      ctx.shadowBlur = 0

      if (midi % 12 === 0) {
        ctx.fillStyle    = pressed ? '#fff' : 'rgba(100,116,139,0.7)'
        ctx.font         = `${Math.min(9, l.w*0.5)}px Arial`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(getNoteLabel(midi), l.x+l.w/2, HIT_Y+KEY_H-3)
      }
    }

    // Black keys
    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi++) {
      if (!isBlack(midi)) continue
      const l       = layout.get(midi)!
      const pressed = pressedKeys.has(midi) || activeNotes.has(midi)
      if (pressed) {
        const pc = getNoteColors(midi, 'active', true, isDemoMode)
        const kg = ctx.createLinearGradient(l.x, HIT_Y, l.x, HIT_Y+blackH)
        kg.addColorStop(0, pc.top); kg.addColorStop(1, pc.bot)
        ctx.shadowColor = pc.glow; ctx.shadowBlur = 14
        ctx.fillStyle = kg
      } else {
        ctx.fillStyle  = 'rgba(15,23,42,0.95)'
        ctx.shadowBlur = 0
      }
      ctx.beginPath()
      ctx.roundRect(l.x, HIT_Y+1, l.w, blackH, [0,0,3,3])
      ctx.fill(); ctx.shadowBlur = 0
    }

    // ── Progress bar ──
    const prog = songEnd > 0 ? Math.min(cb / songEnd, 1) : 0
    const pGrad = ctx.createLinearGradient(0,0,W,0)
    pGrad.addColorStop(0, '#7c3aed'); pGrad.addColorStop(1, '#06b6d4')
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.fillRect(0,0,W,3)
    ctx.fillStyle = pGrad
    ctx.fillRect(0,0,W*prog,3)

    // Beat counter
    ctx.fillStyle = 'rgba(148,163,184,0.35)'
    ctx.font      = '10px monospace'
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText(`♩ ${Math.max(0,cb).toFixed(1)} / ${songEnd.toFixed(0)}`, 6, 6)

    animRef.current = requestAnimationFrame(draw)
  }, [notes, currentIdx, colorIdx, bpm, isPlaying, isDemoMode, activeNotes, states, songEnd, waitBeat])


  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [draw])
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth || 800; canvas.height = CANVAS_H; layoutCache = null
    })
    ro.observe(canvas)
    setTimeout(() => { if (canvas) { canvas.width = canvas.offsetWidth || 800; canvas.height = CANVAS_H } }, 50)
    return () => ro.disconnect()
  }, [])

  return (
    <div style={{ width: '100%', background: '#060b14', position: 'relative', minHeight: `${CANVAS_H}px` }}>
      <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, fontSize: 10 }}>
        {[
          { color: '#8b5cf6', label: 'Upcoming' },
          { color: '#ffffff', label: 'Current'  },
          { color: '#10b981', label: 'Hit'       },
          { color: '#ef4444', label: 'Miss'      },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#475569' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
