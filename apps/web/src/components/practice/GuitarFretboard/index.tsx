import { useEffect, useRef } from 'react'

const STRINGS = [
  { name: 'E', midi: 64, color: '#e2e8f0' },
  { name: 'B', midi: 59, color: '#cbd5e1' },
  { name: 'G', midi: 55, color: '#94a3b8' },
  { name: 'D', midi: 50, color: '#cbd5e1' },
  { name: 'A', midi: 45, color: '#94a3b8' },
  { name: 'E', midi: 40, color: '#e2e8f0' },
]

const FRETS        = 13
const FRET_MARKERS = [3, 5, 7, 9, 12]
const DOT_FRETS    = [3, 5, 7, 9]
const DOUBLE_DOTS  = [12]

interface Props {
  activeNotes:   Set<number>
  expectedNote?: number
  onFretPress?:  (midi: number) => void
}

export default function GuitarFretboard({ activeNotes, expectedNote, onFretPress }: Props) {
  const STRING_H  = 32
  const FRET_W    = 52
  const NUT_W     = 10
  const HEAD_W    = 60
  const totalW    = HEAD_W + NUT_W + FRETS * FRET_W + 20
  const totalH    = STRINGS.length * STRING_H + 60

  // Which frets are active per string
  function getFretNote(stringMidi: number, fret: number): number {
    return stringMidi + fret
  }

  function isActive(stringMidi: number, fret: number): boolean {
    return activeNotes.has(getFretNote(stringMidi, fret))
  }

  function isExpected(stringMidi: number, fret: number): boolean {
    return getFretNote(stringMidi, fret) === expectedNote
  }

  return (
    <div className="overflow-x-auto py-4 px-6 bg-surface2 border-t border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Guitar Fretboard
        </span>
        <span className="text-xs text-slate-600">
          Purple = playing • Pulsing = expected
        </span>
      </div>

      <div className="flex justify-center">
        <div className="relative" style={{ width: totalW, height: totalH }}>

          {/* Headstock */}
          <div style={{
            position:     'absolute',
            left:         0,
            top:          20,
            width:        HEAD_W,
            height:       STRINGS.length * STRING_H + 8,
            background:   'linear-gradient(135deg, #92400e 0%, #78350f 50%, #451a03 100%)',
            borderRadius: '8px 0 0 8px',
            boxShadow:    '2px 0 8px rgba(0,0,0,0.4)',
            zIndex:       10,
          }}>
            {/* Tuning pegs */}
            {STRINGS.map((_, i) => (
              <div key={i}>
                <div style={{
                  position:     'absolute',
                  left:         8,
                  top:          i * STRING_H + STRING_H / 2 - 5,
                  width:        10,
                  height:       10,
                  borderRadius: '50%',
                  background:   'linear-gradient(135deg, #d4af37, #b8860b)',
                  border:       '1px solid #92400e',
                  boxShadow:    '0 1px 3px rgba(0,0,0,0.5)',
                }} />
                <div style={{
                  position:   'absolute',
                  right:      8,
                  top:        i * STRING_H + STRING_H / 2 - 5,
                  width:      10,
                  height:     10,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                  border:     '1px solid #92400e',
                  boxShadow:  '0 1px 3px rgba(0,0,0,0.5)',
                }} />
              </div>
            ))}

            {/* String labels */}
            {STRINGS.map((s, i) => (
              <div key={i} style={{
                position:   'absolute',
                left:       '50%',
                top:        i * STRING_H + STRING_H / 2 - 7,
                transform:  'translateX(-50%)',
                fontSize:   10,
                fontWeight: 700,
                color:      '#d4af37',
              }}>
                {s.name}
              </div>
            ))}
          </div>

          {/* Nut */}
          <div style={{
            position:   'absolute',
            left:       HEAD_W,
            top:        20,
            width:      NUT_W,
            height:     STRINGS.length * STRING_H + 8,
            background: 'linear-gradient(90deg, #f1f5f9, #e2e8f0)',
            boxShadow:  '1px 0 4px rgba(0,0,0,0.3), -1px 0 2px rgba(0,0,0,0.1)',
            zIndex:     9,
          }} />

          {/* Fretboard body */}
          <div style={{
            position:     'absolute',
            left:         HEAD_W + NUT_W,
            top:          20,
            width:        FRETS * FRET_W + 20,
            height:       STRINGS.length * STRING_H + 8,
            background:   'linear-gradient(180deg, #92400e 0%, #78350f 40%, #5c2a0a 100%)',
            borderRadius: '0 8px 8px 0',
          }}>

            {/* Fret lines */}
            {Array.from({ length: FRETS + 1 }).map((_, f) => (
              <div key={f} style={{
                position:   'absolute',
                left:       f * FRET_W,
                top:        0,
                width:      f === 0 ? 3 : 2,
                height:     '100%',
                background: f === 0
                  ? 'linear-gradient(180deg, #d4af37, #b8860b)'
                  : 'linear-gradient(180deg, rgba(200,180,140,0.8), rgba(180,160,120,0.6))',
                boxShadow:  f === 0 ? '0 0 4px rgba(212,175,55,0.5)' : 'none',
              }} />
            ))}

            {/* Fret position dots */}
            {DOT_FRETS.map(fret => (
              <div key={fret} style={{
                position:     'absolute',
                left:         (fret - 0.5) * FRET_W - 7,
                top:          '50%',
                transform:    'translateY(-50%)',
                width:        14,
                height:       14,
                borderRadius: '50%',
                background:   'rgba(255,255,255,0.15)',
                border:       '1px solid rgba(255,255,255,0.1)',
              }} />
            ))}
            {DOUBLE_DOTS.map(fret => (
              <>
                <div key={`${fret}a`} style={{
                  position:     'absolute',
                  left:         (fret - 0.5) * FRET_W - 7,
                  top:          '30%',
                  width:        14,
                  height:       14,
                  borderRadius: '50%',
                  background:   'rgba(255,255,255,0.15)',
                  border:       '1px solid rgba(255,255,255,0.1)',
                }} />
                <div key={`${fret}b`} style={{
                  position:     'absolute',
                  left:         (fret - 0.5) * FRET_W - 7,
                  top:          '62%',
                  width:        14,
                  height:       14,
                  borderRadius: '50%',
                  background:   'rgba(255,255,255,0.15)',
                  border:       '1px solid rgba(255,255,255,0.1)',
                }} />
              </>
            ))}

            {/* Strings */}
            {STRINGS.map((s, si) => (
              <div key={si} style={{
                position:  'absolute',
                left:      0,
                top:       si * STRING_H + STRING_H / 2,
                width:     '100%',
                height:    si < 2 ? 2 : si < 4 ? 2.5 : 3,
                background: `linear-gradient(90deg, ${s.color}cc, ${s.color}, ${s.color}99)`,
                boxShadow: `0 1px 2px rgba(0,0,0,0.5), 0 -0.5px 1px rgba(255,255,255,0.2)`,
                zIndex:    5,
              }} />
            ))}

            {/* Fret notes — clickable dots */}
            {STRINGS.map((s, si) =>
              Array.from({ length: FRETS }).map((_, fi) => {
                const fret      = fi + 1
                const noteMidi  = s.midi + fret
                const active    = activeNotes.has(noteMidi)
                const expected  = noteMidi === expectedNote

                if (!active && !expected) return null

                return (
                  <div
                    key={`${si}-${fi}`}
                    onClick={() => onFretPress?.(noteMidi)}
                    style={{
                      position:     'absolute',
                      left:         fi * FRET_W + FRET_W / 2 - 11,
                      top:          si * STRING_H + STRING_H / 2 - 11,
                      width:        22,
                      height:       22,
                      borderRadius: '50%',
                      background:   active
                        ? 'linear-gradient(135deg, #c084fc, #7c3aed)'
                        : 'rgba(168,85,247,0.3)',
                      border:       active
                        ? '2px solid #e9d5ff'
                        : '2px solid #a855f7',
                      boxShadow:    active
                        ? '0 0 16px rgba(168,85,247,0.9), inset 0 1px 2px rgba(255,255,255,0.3)'
                        : '0 0 8px rgba(168,85,247,0.5)',
                      zIndex:       10,
                      cursor:       'pointer',
                      display:      'flex',
                      alignItems:   'center',
                      justifyContent: 'center',
                      fontSize:     8,
                      fontWeight:   700,
                      color:        '#fff',
                      animation:    expected && !active ? 'pulse 1s infinite' : 'none',
                    }}
                  />
                )
              })
            )}

            {/* Open string dots */}
            {STRINGS.map((s, si) => {
              const active   = activeNotes.has(s.midi)
              const expected = s.midi === expectedNote
              if (!active && !expected) return null

              return (
                <div key={`open-${si}`} style={{
                  position:     'absolute',
                  left:         -30,
                  top:          si * STRING_H + STRING_H / 2 - 9,
                  width:        18,
                  height:       18,
                  borderRadius: '50%',
                  background:   active ? 'linear-gradient(135deg, #c084fc, #7c3aed)' : 'transparent',
                  border:       `2px solid ${active ? '#e9d5ff' : '#a855f7'}`,
                  boxShadow:    active ? '0 0 12px rgba(168,85,247,0.8)' : '0 0 6px rgba(168,85,247,0.4)',
                  zIndex:       10,
                }} />
              )
            })}
          </div>

          {/* Fret numbers */}
          <div style={{
            position: 'absolute',
            left:     HEAD_W + NUT_W,
            top:      STRINGS.length * STRING_H + 30,
            display:  'flex',
          }}>
            {Array.from({ length: FRETS }).map((_, f) => (
              <div key={f} style={{
                width:     FRET_W,
                textAlign: 'center',
                fontSize:  10,
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
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
