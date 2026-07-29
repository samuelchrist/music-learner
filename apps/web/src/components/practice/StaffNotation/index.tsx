import { useEffect, useRef } from 'react'
import type { Note } from '@music-learner/shared'

interface Props {
  notes:          Note[]
  currentIdx:     number
  instrument?:    string
  bpm?:           number
  timeSignature?: [number, number]
  keySignature?:  string
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

const STAFF_COLOR  = '#94a3b8'
const CLEF_COLOR   = '#334155'
const BARS_VISIBLE = 2

export default function StaffNotation({
  notes,
  currentIdx,
  instrument    = 'piano',
  bpm           = 120,
  timeSignature = [4, 4],
  keySignature  = 'C',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isPiano      = instrument === 'piano'
  const [beatsPerBar, beatValue] = timeSignature
  const vexKey = KEY_MAP[keySignature] || 'C'

  useEffect(() => {
    const el = containerRef.current
    if (!el || !notes.length) return

    import('vexflow').then((VF) => {
      const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VF

      el.innerHTML = ''

      const W        = el.clientWidth || 760
      const height   = isPiano ? 270 : 170
      const TREBLE_Y = 36
      const BASS_Y   = 150
      const LEFT_PAD = 20

      const renderer = new Renderer(el, Renderer.Backends.SVG)
      renderer.resize(W, height)
      const ctx = renderer.getContext()

      const svg = el.querySelector('svg')
      if (svg) svg.style.background = 'transparent'

      const allBars = groupIntoBars(notes, beatsPerBar)

      // Find current bar
      let noteCount  = 0
      let currentBar = 0
      for (let b = 0; b < allBars.length; b++) {
        noteCount += allBars[b].length
        if (noteCount > currentIdx) { currentBar = b; break }
      }

      const startBar = Math.max(0, Math.min(currentBar, allBars.length - BARS_VISIBLE))
      const visiBars = allBars.slice(startBar, startBar + BARS_VISIBLE)
      const barW     = (W - LEFT_PAD - 30) / BARS_VISIBLE

      let absOffset = 0
      for (let b = 0; b < startBar; b++) absOffset += allBars[b].length

      visiBars.forEach((barNotes, barIdx) => {
        const x          = LEFT_PAD + barIdx * barW
        const isFirstBar = barIdx === 0

        // ── Treble stave ──
        const treble = new Stave(x, TREBLE_Y, barW)
        if (isFirstBar) {
          treble.addClef('treble')
          treble.addKeySignature(vexKey)
          treble.addTimeSignature(`${beatsPerBar}/${beatValue}`)
        }
        treble.setStyle({ fillStyle: CLEF_COLOR, strokeStyle: STAFF_COLOR })
        treble.setContext(ctx).draw()

        // ── Bass stave ──
        let bass: any = null
        if (isPiano) {
          bass = new Stave(x, BASS_Y, barW)
          if (isFirstBar) {
            bass.addClef('bass')
            bass.addKeySignature(vexKey)
            bass.addTimeSignature(`${beatsPerBar}/${beatValue}`)
          }
          bass.setStyle({ fillStyle: CLEF_COLOR, strokeStyle: STAFF_COLOR })
          bass.setContext(ctx).draw()
        }

        // ── Brace + connector ──
        if (isFirstBar && isPiano) {
          try {
            const { StaveConnector } = VF as any
            if (StaveConnector) {
              const brace = new StaveConnector(treble, bass)
              brace.setType(3)
              brace.setStyle({ fillStyle: CLEF_COLOR, strokeStyle: CLEF_COLOR })
              brace.setContext(ctx).draw()
              const bar = new StaveConnector(treble, bass)
              bar.setType(1)
              bar.setStyle({ fillStyle: STAFF_COLOR, strokeStyle: STAFF_COLOR })
              bar.setContext(ctx).draw()
            }
          } catch (_) {}
        }

        // ── Tempo + key label ──
        if (isFirstBar) {
          ctx.save()
          ctx.setFont('Arial', 14, 'bold')
          ctx.setFillStyle('#1e293b')
          ctx.fillText(`♩ = ${bpm}`, x + (isPiano ? 90 : 65), TREBLE_Y - 14)
          ctx.restore()
        }

        // ── Bar number ──
        ctx.save()
        ctx.setFont('Arial', 9, 'normal')
        ctx.setFillStyle('#94a3b8')
        ctx.fillText(`${startBar + barIdx + 1}`, x + 4, TREBLE_Y - 4)
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
          const formatW = barW - (isFirstBar ? 100 : 20)

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

  return (
    <div style={{
      background:   '#ffffff',
      borderRadius: 10,
      padding:      '8px 4px 4px',
      border:       '2px solid #e2e8f0',
      minHeight:    isPiano ? 280 : 180,
    }}>
      <div ref={containerRef} style={{ width: '100%' }} />
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
