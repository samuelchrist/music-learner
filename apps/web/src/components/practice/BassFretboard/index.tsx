import { NotePlayer } from '@/lib/audio/NotePlayer'

// ── Bass guitar string definitions ───────────────────────────
// MIDI numbers for open strings
const BASS4_STRINGS = [
  { name: 'G',  midi: 43, color: '#e2e8f0', thickness: 2   },  // G2
  { name: 'D',  midi: 38, color: '#cbd5e1', thickness: 2.5 },  // D2
  { name: 'A',  midi: 33, color: '#94a3b8', thickness: 3   },  // A1
  { name: 'E',  midi: 28, color: '#64748b', thickness: 3.5 },  // E1 (low)
]

const BASS5_STRINGS = [
  { name: 'G',  midi: 43, color: '#e2e8f0', thickness: 2   },  // G2
  { name: 'D',  midi: 38, color: '#cbd5e1', thickness: 2.5 },  // D2
  { name: 'A',  midi: 33, color: '#94a3b8', thickness: 3   },  // A1
  { name: 'E',  midi: 28, color: '#64748b', thickness: 3.5 },  // E1
  { name: 'B',  midi: 23, color: '#475569', thickness: 4   },  // B0 (low B)
]

const FRETS        = 24
const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
const DOUBLE_DOTS  = [12, 24]

const midiName = (m: number) => {
  if (m === 0) return '—'
  const n = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return `${n[m % 12]}${Math.floor(m / 12) - 1}`
}

interface Props {
  variant:       '4string' | '5string'
  activeNotes:   Set<number>
  expectedNote?: number
  scaleNotes?:   Set<number>
  onFretPress?:  (midi: number) => void
}

export default function BassFretboard({
  variant,
  activeNotes,
  expectedNote,
  scaleNotes = new Set(),
  onFretPress,
}: Props) {
  const strings = variant === '5string' ? BASS5_STRINGS : BASS4_STRINGS
  const STRING_H = 36
  const FRET_W   = 48
  const NUT_W    = 10
  const HEAD_W   = 70
  const totalW   = HEAD_W + NUT_W + FRETS * FRET_W + 20
  const totalH   = strings.length * STRING_H + 60

  function getFretMidi(stringMidi: number, fret: number): number {
    return stringMidi + fret
  }

  function getNoteState(midi: number): 'active' | 'expected' | 'scale' | 'none' {
    if (activeNotes.has(midi))  return 'active'
    if (midi === expectedNote)  return 'expected'
    if (scaleNotes.has(midi))   return 'scale'
    return 'none'
  }

  function handlePress(midi: number) {
    NotePlayer.play(midi, 1.5, 0.8)
    onFretPress?.(midi)
  }

  // Fret dot color based on state
  function getDotStyle(state: string, color: string) {
    switch (state) {
      case 'active':
        return {
          background:   `linear-gradient(135deg, #c084fc, #7c3aed)`,
          border:       '2px solid #e9d5ff',
          boxShadow:    `0 0 16px rgba(168,85,247,.9)`,
          width:        26, height: 26,
        }
      case 'expected':
        return {
          background:   `linear-gradient(135deg, #a78bfa, #5b21b6)`,
          border:       '2px solid #ddd6fe',
          boxShadow:    `0 0 12px rgba(124,58,237,.8)`,
          width:        24, height: 24,
          animation:    'bassPulse 0.8s infinite',
        }
      case 'scale':
        return {
          background:   `rgba(124,58,237,.35)`,
          border:       '1px solid rgba(168,85,247,.6)',
          boxShadow:    `0 0 6px rgba(124,58,237,.4)`,
          width:        20, height: 20,
        }
      default:
        return null
    }
  }

  return (
    <div style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px', flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: 'var(--text-sub)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          🎸 {variant === '5string' ? '5-String Bass (B E A D G)' : '4-String Bass (E A D G)'}
        </span>
        <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-sub)' }}>
          <span>🟣 Playing</span>
          <span>💜 Next</span>
          <span>🔵 Scale</span>
        </div>
      </div>

      {/* Scrollable fretboard */}
      <div style={{ overflowX: 'auto', padding: '0 16px 12px' }}>
        <div style={{ position: 'relative', width: totalW, height: totalH }}>

          {/* ── Headstock ─────────────────────────────────────── */}
          <div style={{
            position: 'absolute', left: 0, top: 16,
            width: HEAD_W, height: strings.length * STRING_H + 8,
            background: 'linear-gradient(135deg, #92400e, #451a03)',
            borderRadius: '8px 0 0 8px',
            boxShadow: '2px 0 8px rgba(0,0,0,.5)',
            zIndex: 10,
          }}>
            {/* Tuning pegs */}
            {strings.map((s, i) => (
              <div key={i}>
                {/* Left peg */}
                <div style={{
                  position: 'absolute', left: 8,
                  top: i * STRING_H + STRING_H / 2 - 5,
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                  border: '1px solid #92400e',
                  boxShadow: '0 1px 3px rgba(0,0,0,.5)',
                }} />
                {/* Right peg */}
                <div style={{
                  position: 'absolute', right: 8,
                  top: i * STRING_H + STRING_H / 2 - 5,
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                  border: '1px solid #92400e',
                  boxShadow: '0 1px 3px rgba(0,0,0,.5)',
                }} />
                {/* String name */}
                <div style={{
                  position: 'absolute', left: '50%',
                  top: i * STRING_H + STRING_H / 2 - 7,
                  transform: 'translateX(-50%)',
                  fontSize: 11, fontWeight: 800,
                  color: '#fbbf24',
                }}>
                  {s.name}
                </div>
              </div>
            ))}
          </div>

          {/* ── Nut ───────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', left: HEAD_W, top: 16,
            width: NUT_W, height: strings.length * STRING_H + 8,
            background: 'linear-gradient(90deg, #f1f5f9, #e2e8f0)',
            boxShadow: '1px 0 4px rgba(0,0,0,.3)',
            zIndex: 9,
          }} />

          {/* ── Fretboard body ────────────────────────────────── */}
          <div style={{
            position: 'absolute',
            left: HEAD_W + NUT_W, top: 16,
            width: FRETS * FRET_W + 20,
            height: strings.length * STRING_H + 8,
            background: 'linear-gradient(180deg, #92400e 0%, #78350f 40%, #5c2a0a 100%)',
            borderRadius: '0 8px 8px 0',
          }}>

            {/* Fret lines */}
            {Array.from({ length: FRETS + 1 }).map((_, f) => (
              <div key={f} style={{
                position: 'absolute', left: f * FRET_W, top: 0,
                width: f === 0 ? 3 : 2,
                height: '100%',
                background: f === 0
                  ? 'linear-gradient(180deg, #fbbf24, #d97706)'
                  : 'linear-gradient(180deg, rgba(200,180,140,.8), rgba(180,160,120,.6))',
                boxShadow: f === 0 ? '0 0 4px rgba(251,191,36,.5)' : 'none',
              }} />
            ))}

            {/* Position markers */}
            {FRET_MARKERS.filter(f => !DOUBLE_DOTS.includes(f)).map(fret => (
              <div key={fret} style={{
                position: 'absolute',
                left: (fret - 0.5) * FRET_W - 7,
                top: '50%', transform: 'translateY(-50%)',
                width: 14, height: 14, borderRadius: '50%',
                background: 'rgba(255,255,255,.15)',
                border: '1px solid rgba(255,255,255,.1)',
              }} />
            ))}

            {/* Double dots at 12 and 24 */}
            {DOUBLE_DOTS.map(fret => (
              <div key={fret}>
                <div style={{
                  position: 'absolute',
                  left: (fret - 0.5) * FRET_W - 7,
                  top: '28%',
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'rgba(255,255,255,.2)',
                  border: '1px solid rgba(255,255,255,.15)',
                }} />
                <div style={{
                  position: 'absolute',
                  left: (fret - 0.5) * FRET_W - 7,
                  top: '64%',
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'rgba(255,255,255,.2)',
                  border: '1px solid rgba(255,255,255,.15)',
                }} />
              </div>
            ))}

            {/* Strings */}
            {strings.map((s, si) => (
              <div key={si} style={{
                position: 'absolute', left: 0,
                top: si * STRING_H + STRING_H / 2,
                width: '100%',
                height: s.thickness,
                background: `linear-gradient(90deg, ${s.color}cc, ${s.color}, ${s.color}99)`,
                boxShadow: `0 1px 2px rgba(0,0,0,.5), 0 -0.5px 1px rgba(255,255,255,.2)`,
                zIndex: 5,
              }} />
            ))}

            {/* Fret note dots */}
            {strings.map((s, si) =>
              Array.from({ length: FRETS }).map((_, fi) => {
                const fret    = fi + 1
                const noteMidi = getFretMidi(s.midi, fret)
                const state   = getNoteState(noteMidi)
                const dotStyle = getDotStyle(state, s.color)

                if (!dotStyle) return null

                return (
                  <div
                    key={`${si}-${fi}`}
                    onClick={() => handlePress(noteMidi)}
                    title={`${midiName(noteMidi)} (fret ${fret})`}
                    style={{
                      position:       'absolute',
                      left:           fi * FRET_W + FRET_W / 2 - dotStyle.width / 2,
                      top:            si * STRING_H + STRING_H / 2 - dotStyle.height / 2,
                      width:          dotStyle.width,
                      height:         dotStyle.height,
                      borderRadius:   '50%',
                      ...dotStyle,
                      zIndex:         10,
                      cursor:         'pointer',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       7,
                      fontWeight:     700,
                      color:          '#fff',
                      transition:     'all .1s ease',
                    }}
                  >
                    {state === 'active' && (
                      <span style={{ pointerEvents: 'none', fontSize: 7 }}>
                        {midiName(noteMidi)}
                      </span>
                    )}
                  </div>
                )
              })
            )}

            {/* Open string dots */}
            {strings.map((s, si) => {
              const state    = getNoteState(s.midi)
              const dotStyle = getDotStyle(state, s.color)
              if (!dotStyle) return null

              return (
                <div
                  key={`open-${si}`}
                  onClick={() => handlePress(s.midi)}
                  style={{
                    position:       'absolute',
                    left:           -32,
                    top:            si * STRING_H + STRING_H / 2 - dotStyle.height / 2,
                    width:          dotStyle.width,
                    height:         dotStyle.height,
                    borderRadius:   '50%',
                    ...dotStyle,
                    zIndex:         10,
                    cursor:         'pointer',
                  }}
                />
              )
            })}
          </div>

          {/* Fret numbers */}
          <div style={{
            position: 'absolute',
            left: HEAD_W + NUT_W,
            top: strings.length * STRING_H + 28,
            display: 'flex',
          }}>
            {Array.from({ length: FRETS }).map((_, f) => (
              <div key={f} style={{
                width:     FRET_W,
                textAlign: 'center',
                fontSize:  9,
                color:     FRET_MARKERS.includes(f + 1) ? '#a855f7' : '#64748b',
                fontWeight: FRET_MARKERS.includes(f + 1) ? 700 : 400,
              }}>
                {f + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bassPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%     { transform: scale(1.2); opacity: .6; }
        }
      `}</style>
    </div>
  )
}
