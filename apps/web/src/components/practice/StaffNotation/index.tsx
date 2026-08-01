import { useEffect, useRef } from 'react'
import type { Note } from '@music-learner/shared'

interface Props {
  notes:          Note[]
  currentIdx:     number
  instrument?:    string
  bpm?:           number
  timeSignature?: [number, number]
  keySignature?:  string
  isPlaying?:     boolean   // Play Along / Listen — advances on a real tempo clock
  waitBeat?:      number    // Wait mode — current note's beat; clock glides to it, then holds
}

const VEX_NAMES = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b']
const HAS_SHARP = [false,true,false,true,false,false,true,false,true,false,true,false]

// Map our key names to VexFlow key signatures
const KEY_MAP: Record<string, string> = {
  'C':  'C',  'G':  'G',  'D':  'D',  'A':  'A',
  'E':  'E',  'B':  'B',  'F#': 'F#', 'C#': 'C#',
  'F':  'F',  'Bb': 'Bb', 'Eb': 'Eb', 'Ab': 'Ab',
  'Db': 'Db', 'Gb': 'Gb', 'Cb': 'Cb',
  // Minor keys
  'Am': 'Am', 'Em': 'Em', 'Bm': 'Bm', 'F#m':'F#m',
  'C#m':'C#m','G#m':'G#m','D#m':'D#m','A#m':'A#m',
  'Dm': 'Dm', 'Gm': 'Gm', 'Cm': 'Cm', 'Fm': 'Fm',
  'Bbm':'Bbm','Ebm':'Ebm','Abm':'Abm',
}

function midiToVexKey(midi: number) {
  const oct = Math.floor(midi / 12) - 1
  const chr = midi % 12
  return { key: `${VEX_NAMES[chr]}/${oct}`, sharp: HAS_SHARP[chr] }
}

function beatsToVexDur(beats: number): string {
  if (beats >= 3.75) return 'w'
  if (beats >= 2.75) return 'hd'
  if (beats >= 1.75) return 'h'
  if (beats >= 1.25) return 'qd'
  if (beats >= 0.75) return 'q'
  if (beats >= 0.6)  return '8d'
  if (beats >= 0.4)  return '8'
  if (beats >= 0.2)  return '16'
  return '8'
}

function groupIntoBars(notes: Note[], beatsPerBar: number): Note[][] {
  if (!notes.length) return []
  const bars: Note[][] = []
  let bar: Note[]      = []
  let barBeats         = 0
  notes.forEach(note => {
    bar.push(note)
    barBeats += note.duration
    if (barBeats >= beatsPerBar - 0.01) {
      bars.push(bar)
      bar = []
      barBeats = 0
    }
  })
  if (bar.length) bars.push(bar)
  return bars
}

const STAFF_COLOR = '#94a3b8'
const CLEF_COLOR  = '#334155'

// Fixed pixel-per-beat (not viewport-fit) so elapsed-beats-to-pixels stays
// exactly linear — required for the scroll to move at a constant, tempo-
// matched speed instead of stretching bars to fill whatever width is available.
const PX_PER_BEAT       = 90
const LEFT_PAD          = 0     // clef/key/time now live in the fixed panel, so the track's bar 0 starts flush
const BRACE_GUTTER      = 16    // room left of the staves for the grand-staff brace + start barline
const CLEF_PANEL_W      = 140   // fixed left gutter: clef + key sig + time sig + tempo, never scrolls
const PLAYHEAD_X        = CLEF_PANEL_W + 4   // fixed viewport x the "now" line sits at (right after the clef gutter)
const RENDER_WINDOW_BARS = 12   // bars rendered into the SVG at once
const LOOKBACK_BARS      = 2    // bars of history kept visible behind the playhead on a re-center

// Matches SynthesiaRoll's ROLL_H so the two views share the same window
// height and toggling between them doesn't shift the instrument visual below.
const STAFF_H = 323

export default function StaffNotation({
  notes,
  currentIdx,
  instrument    = 'piano',
  bpm           = 120,
  timeSignature = [4, 4],
  keySignature  = 'C',
  isPlaying     = false,
  waitBeat,
}: Props) {
  const trackRef  = useRef<HTMLDivElement>(null)
  const clefRef   = useRef<HTMLDivElement>(null)
  const isPiano   = instrument === 'piano'
  const [beatsPerBar, beatValue] = timeSignature
  const vexKey = KEY_MAP[keySignature] || 'C'

  // ── Rendered-window bookkeeping ──────────────────────────────
  const windowStartRef      = useRef(0)   // first bar index currently rendered into the SVG
  const windowBeatOffsetRef = useRef(0)   // beats at the start of that window (= windowStart * beatsPerBar)

  // ── Playback clock (mirrors SynthesiaRoll's, leadInBeats = 0 — a note
  //     is current exactly when due, no falling-note pre-roll here) ────
  const startRef      = useRef<number>(0)
  const startBeatRef  = useRef<number>(0)
  const curBeatRef    = useRef<number>(0)
  const waitTargetRef = useRef<number>(0)

  useEffect(() => {
    if (isPlaying) {
      startRef.current     = performance.now()
      startBeatRef.current = 0
    } else if (waitBeat !== undefined) {
      // Continue from wherever the track currently sits — rebasing to the
      // new note's beat would make the track jump instead of glide.
      startRef.current     = performance.now()
      startBeatRef.current = curBeatRef.current
      waitTargetRef.current = waitBeat
    } else {
      curBeatRef.current = 0
    }
  }, [isPlaying, waitBeat])

  // ── VexFlow render — only re-runs on layout/coloring changes, never per-frame ──
  useEffect(() => {
    const el = trackRef.current
    if (!el || !notes.length) return

    import('vexflow').then(async (VF) => {
      // VexFlow's Bravura music font loads async via the FontFace API and its
      // module resolves before the font is ready, so drawing immediately can
      // paint noteheads with a fallback glyph (misaligned stems) until the
      // next redraw. Wait for it once so the first paint is already correct.
      if (typeof document !== 'undefined' && document.fonts) {
        try { await document.fonts.ready } catch { /* unsupported, draw anyway */ }
      }
      if (trackRef.current !== el) return

      const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VF

      el.innerHTML = ''

      const height   = STAFF_H
      const yOffset  = Math.round((STAFF_H - (isPiano ? 270 : 170)) / 2)
      const TREBLE_Y = 36 + yOffset
      const BASS_Y   = 150 + yOffset
      const barW     = beatsPerBar * PX_PER_BEAT

      const allBars = groupIntoBars(notes, beatsPerBar)

      // Find current bar
      let noteCount  = 0
      let currentBar = 0
      for (let b = 0; b < allBars.length; b++) {
        noteCount += allBars[b].length
        if (noteCount > currentIdx) { currentBar = b; break }
      }

      // Re-center the rendered window only when the current bar has drifted
      // outside it — keeps the same bars (and same on-screen x positions)
      // across most redraws, so the continuous scroll doesn't visibly cut.
      if (currentBar < windowStartRef.current || currentBar > windowStartRef.current + RENDER_WINDOW_BARS - 3) {
        windowStartRef.current = Math.max(0, currentBar - LOOKBACK_BARS)
      }
      const startBar = windowStartRef.current
      windowBeatOffsetRef.current = startBar * beatsPerBar

      const visiBars = allBars.slice(startBar, startBar + RENDER_WINDOW_BARS)
      const totalW   = LEFT_PAD + visiBars.length * barW + 40

      const renderer = new Renderer(el, Renderer.Backends.SVG)
      renderer.resize(totalW, height)
      const ctx = renderer.getContext()

      const svg = el.querySelector('svg')
      if (svg) svg.style.background = 'transparent'

      let absOffset = 0
      for (let b = 0; b < startBar; b++) absOffset += allBars[b].length

      visiBars.forEach((barNotes, barIdx) => {
        const absBarIdx  = startBar + barIdx
        const x          = LEFT_PAD + barIdx * barW

        // ── Treble stave ──
        const treble = new Stave(x, TREBLE_Y, barW)
        treble.setStyle({ fillStyle: CLEF_COLOR, strokeStyle: STAFF_COLOR })
        treble.setContext(ctx).draw()

        // ── Bass stave ──
        let bass: any = null
        if (isPiano) {
          bass = new Stave(x, BASS_Y, barW)
          bass.setStyle({ fillStyle: CLEF_COLOR, strokeStyle: STAFF_COLOR })
          bass.setContext(ctx).draw()
        }

        // ── Bar number ──
        ctx.save()
        ctx.setFont('Arial', 9, 'normal')
        ctx.setFillStyle('#94a3b8')
        ctx.fillText(`${absBarIdx + 1}`, x + 4, TREBLE_Y - 4)
        ctx.restore()

        // ── Build tickables ──
        const trebleTicks: any[] = []
        const bassTicks:   any[] = []

        barNotes.forEach((note, ni) => {
          const absIdx    = absOffset + ni
          const isCurrent = absIdx === currentIdx
          const isPast    = absIdx < currentIdx
          const color     = isCurrent ? '#a855f7' : isPast ? '#10b981' : '#475569'
          const dur       = beatsToVexDur(note.duration)

          if (note.isRest) {
            const tr = new StaveNote({ clef: 'treble', keys: ['b/4'], duration: `${dur}r` })
            tr.setStyle({ fillStyle: '#94a3b8', strokeStyle: '#94a3b8' })
            trebleTicks.push(tr)
            if (isPiano) {
              const br = new StaveNote({ clef: 'bass', keys: ['d/3'], duration: `${dur}r` })
              br.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' })
              bassTicks.push(br)
            }
            return
          }

          if (!note.note) return
          const { key, sharp } = midiToVexKey(note.note)
          const inBass = isPiano && note.note < 60

          if (inBass) {
            const bn = new StaveNote({ clef: 'bass', keys: [key], duration: dur })
            if (sharp) bn.addModifier(new Accidental('#'), 0)
            bn.setStyle({ fillStyle: color, strokeStyle: color })
            bassTicks.push(bn)
            const gr = new StaveNote({ clef: 'treble', keys: ['b/4'], duration: `${dur}r` })
            gr.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' })
            trebleTicks.push(gr)
          } else {
            const tn = new StaveNote({ clef: 'treble', keys: [key], duration: dur })
            if (sharp) tn.addModifier(new Accidental('#'), 0)
            tn.setStyle({ fillStyle: color, strokeStyle: color })
            trebleTicks.push(tn)
            if (isPiano) {
              const gr = new StaveNote({ clef: 'bass', keys: ['d/3'], duration: `${dur}r` })
              gr.setStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' })
              bassTicks.push(gr)
            }
          }
        })

        absOffset += barNotes.length

        // ── Format & draw ──
        try {
          if (trebleTicks.length === 0) return
          const formatW = barW - 20

          const tv = new Voice({ numBeats: beatsPerBar, beatValue }).setStrict(false)
          tv.addTickables(trebleTicks)

          if (isPiano && bassTicks.length > 0) {
            const bv = new Voice({ numBeats: beatsPerBar, beatValue }).setStrict(false)
            bv.addTickables(bassTicks)
            new Formatter().joinVoices([tv]).joinVoices([bv]).format([tv, bv], formatW)
            tv.draw(ctx, treble)
            bv.draw(ctx, bass)
          } else {
            new Formatter().joinVoices([tv]).format([tv], formatW)
            tv.draw(ctx, treble)
          }
        } catch (e) {
          console.warn('VexFlow bar render error:', e)
        }
      })
    })
  }, [notes, currentIdx, instrument, bpm, timeSignature, keySignature])

  // ── Fixed clef/key/time-signature gutter — drawn once, never scrolls, so it
  //     stays visible the whole time instead of vanishing once the track
  //     scrolls the actual first bar off-screen. ──
  useEffect(() => {
    const el = clefRef.current
    if (!el) return

    import('vexflow').then(async (VF) => {
      if (typeof document !== 'undefined' && document.fonts) {
        try { await document.fonts.ready } catch { /* unsupported, draw anyway */ }
      }
      if (clefRef.current !== el) return

      const { Renderer, Stave, StaveConnector, Barline } = VF as any

      el.innerHTML = ''

      const height    = STAFF_H
      const yOffset   = Math.round((STAFF_H - (isPiano ? 270 : 170)) / 2)
      const TREBLE_Y  = 36 + yOffset
      const BASS_Y    = 150 + yOffset
      const staveX    = BRACE_GUTTER
      const staveW    = CLEF_PANEL_W - BRACE_GUTTER
      const NONE_BAR  = Barline?.type?.NONE ?? 7

      const renderer = new Renderer(el, Renderer.Backends.SVG)
      renderer.resize(CLEF_PANEL_W + 10, height)
      const ctx = renderer.getContext()

      const svg = el.querySelector('svg')
      if (svg) svg.style.background = 'transparent'

      const treble = new Stave(staveX, TREBLE_Y, staveW)
      treble.addClef('treble')
      treble.addKeySignature(vexKey)
      treble.addTimeSignature(`${beatsPerBar}/${beatValue}`)
      treble.setBegBarType(NONE_BAR)
      treble.setEndBarType(NONE_BAR)
      treble.setStyle({ fillStyle: CLEF_COLOR, strokeStyle: STAFF_COLOR })
      treble.setContext(ctx).draw()

      let bass: any = null
      if (isPiano) {
        bass = new Stave(staveX, BASS_Y, staveW)
        bass.addClef('bass')
        bass.addKeySignature(vexKey)
        bass.addTimeSignature(`${beatsPerBar}/${beatValue}`)
        bass.setBegBarType(NONE_BAR)
        bass.setEndBarType(NONE_BAR)
        bass.setStyle({ fillStyle: CLEF_COLOR, strokeStyle: STAFF_COLOR })
        bass.setContext(ctx).draw()

        try {
          if (StaveConnector) {
            const BRACE            = StaveConnector.type?.BRACE ?? 3
            const BOLD_DOUBLE_LEFT = StaveConnector.type?.BOLD_DOUBLE_LEFT ?? 5
            const brace = new StaveConnector(treble, bass)
            brace.setType(BRACE)
            brace.setStyle({ fillStyle: CLEF_COLOR, strokeStyle: CLEF_COLOR })
            brace.setContext(ctx).draw()
            const bar = new StaveConnector(treble, bass)
            bar.setType(BOLD_DOUBLE_LEFT)
            bar.setStyle({ fillStyle: STAFF_COLOR, strokeStyle: STAFF_COLOR })
            bar.setContext(ctx).draw()
          }
        } catch (_) {}
      }

      ctx.save()
      ctx.setFont('Arial', 14, 'bold')
      ctx.setFillStyle('#1e293b')
      ctx.fillText(`♩ = ${bpm}`, 4, TREBLE_Y - 14)
      ctx.restore()
    })
  }, [instrument, isPiano, vexKey, beatsPerBar, beatValue, bpm])

  // ── Continuous scroll — cheap CSS transform, no VexFlow work per frame ──
  useEffect(() => {
    let raf = 0
    const tick = () => {
      let cb = curBeatRef.current
      if (isPlaying) {
        const elapsed = (performance.now() - startRef.current) / 1000
        cb = startBeatRef.current + elapsed * (bpm / 60)
      } else if (waitBeat !== undefined) {
        const elapsed  = (performance.now() - startRef.current) / 1000
        const animBeat = startBeatRef.current + elapsed * (bpm / 60)
        cb = Math.min(animBeat, waitTargetRef.current)
      }
      curBeatRef.current = cb

      if (trackRef.current) {
        const localBeat = cb - windowBeatOffsetRef.current
        const x = PLAYHEAD_X - (LEFT_PAD + localBeat * PX_PER_BEAT)
        trackRef.current.style.transform = `translateX(${x}px)`
      }

      if (isPlaying || waitBeat !== undefined) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [isPlaying, waitBeat, bpm])

  const height = STAFF_H

  return (
    <div style={{
      background:   '#ffffff',
      borderRadius: 10,
      padding:      '8px 4px 4px',
      border:       '2px solid #e2e8f0',
      minHeight:    STAFF_H + 10,
      display:      'flex',
      flexDirection: 'column',
    }}>
      <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
        <div ref={trackRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
        <div
          ref={clefRef}
          aria-hidden
          style={{
            position:   'absolute',
            top: 0, left: 0, bottom: 0,
            width:      CLEF_PANEL_W,
            background: '#ffffff',
            zIndex:     2,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position:   'absolute',
            top: 0, bottom: 0, left: PLAYHEAD_X,
            width:      2,
            background: 'rgba(168,85,247,.55)',
            zIndex:     3,
            pointerEvents: 'none',
          }}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'center',
        gap: 16, paddingTop: 2, paddingBottom: 4,
        fontSize: 10, color: '#64748b',
      }}>
        {[
          { color: '#a855f7', label: 'Current'  },
          { color: '#10b981', label: 'Played'   },
          { color: '#475569', label: 'Upcoming' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: color, display: 'inline-block',
            }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
