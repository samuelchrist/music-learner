import { useEffect, useRef } from 'react'
import { clsx } from 'clsx'

// ── Note definitions ──────────────────────────────────────────
interface KeyDef {
  midi:    number
  note:    string
  type:    'white' | 'black'
  whiteIndex?: number  // position among white keys
}

function buildKeys(startMidi = 48, endMidi = 84): KeyDef[] {
  const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  const isBlack   = (m: number) => [1,3,6,8,10].includes(m % 12)

  const keys: KeyDef[] = []
  let whiteIndex = 0

  for (let m = startMidi; m <= endMidi; m++) {
    const name = noteNames[m % 12]
    const oct  = Math.floor(m / 12) - 1
    if (!isBlack(m)) {
      keys.push({ midi: m, note: `${name}${oct}`, type: 'white', whiteIndex })
      whiteIndex++
    } else {
      keys.push({ midi: m, note: `${name}${oct}`, type: 'black' })
    }
  }
  return keys
}

// Black key offsets relative to previous white key (in % of white key width)
// Pattern repeats every octave: C C# D D# E F F# G G# A A# B
const BLACK_OFFSET: Record<string, number> = {
  'C#': 0.65,
  'D#': 1.65,
  'F#': 3.65,
  'G#': 4.65,
  'A#': 5.65,
}

interface Props {
  activeNotes:   Set<number>
  expectedNote?: number
  startMidi?:    number
  endMidi?:      number
  onKeyPress?:   (midi: number) => void
}

export default function PianoRoll({
  activeNotes,
  expectedNote,
  startMidi = 48,
  endMidi   = 84,
  onKeyPress,
}: Props) {
  const noteNames  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  const isBlackFn  = (m: number) => [1,3,6,8,10].includes(m % 12)

  // Build white and black key lists
  const whiteKeys: { midi: number; note: string; label: string }[] = []
  const blackKeys: { midi: number; note: string; whitesBefore: number }[] = []

  let whiteCount = 0
  for (let m = startMidi; m <= endMidi; m++) {
    const name = noteNames[m % 12]
    const oct  = Math.floor(m / 12) - 1
    const full = `${name}${oct}`

    if (!isBlackFn(m)) {
      whiteKeys.push({ midi: m, note: full, label: name === 'C' ? full : '' })
      whiteCount++
    } else {
      blackKeys.push({ midi: m, note: full, whitesBefore: whiteCount })
    }
  }

  const WHITE_W  = 36   // px
  const WHITE_H  = 140  // px
  const BLACK_W  = 22   // px
  const BLACK_H  = 88   // px
  const totalW   = whiteKeys.length * WHITE_W

  return (
    <div className="overflow-x-auto py-4 px-6 bg-surface2 border-t border-slate-800">
      {/* Keyboard label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Piano Keyboard
        </span>
        <span className="text-xs text-slate-600">
          Keys: A-K play notes • W E T Y U = sharps
        </span>
      </div>

      {/* Piano body */}
      <div className="flex justify-center">
        <div
          className="relative select-none"
          style={{ width: totalW, height: WHITE_H + 20 }}
        >
          {/* Piano top rim */}
          <div
            className="absolute top-0 left-0 right-0 rounded-t-md z-20"
            style={{
              height:     12,
              background: 'linear-gradient(180deg, #1a1a2e 0%, #2d2d4e 100%)',
              boxShadow:  '0 2px 4px rgba(0,0,0,0.5)',
            }}
          />

          {/* White keys */}
          <div
            className="absolute flex"
            style={{ top: 12, left: 0 }}
          >
            {whiteKeys.map((key, i) => {
              const isActive   = activeNotes.has(key.midi)
              const isExpected = key.midi === expectedNote

              return (
                <div
                  key={key.midi}
                  onMouseDown={() => onKeyPress?.(key.midi)}
                  style={{
                    width:        WHITE_W,
                    height:       WHITE_H,
                    marginRight:  1,
                    background:   isActive
                      ? 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)'
                      : isExpected
                      ? 'linear-gradient(180deg, rgba(168,85,247,0.4) 0%, rgba(124,58,237,0.2) 100%)'
                      : 'linear-gradient(180deg, #f8f8ff 0%, #e8e8f0 60%, #d8d8e8 100%)',
                    border:       isActive
                      ? '1px solid #7c3aed'
                      : isExpected
                      ? '1px solid #a855f7'
                      : '1px solid #aaa',
                    borderTop:    'none',
                    borderRadius: '0 0 6px 6px',
                    cursor:       'pointer',
                    display:      'flex',
                    alignItems:   'flex-end',
                    justifyContent: 'center',
                    paddingBottom: 6,
                    fontSize:     10,
                    fontWeight:   700,
                    color:        isActive ? '#fff' : isExpected ? '#a855f7' : '#666',
                    boxShadow:    isActive
                      ? 'inset 0 -4px 8px rgba(124,58,237,0.4), 0 0 12px rgba(168,85,247,0.6)'
                      : isExpected
                      ? 'inset 0 -2px 4px rgba(124,58,237,0.2)'
                      : 'inset 0 -4px 8px rgba(0,0,0,0.1), 2px 4px 6px rgba(0,0,0,0.2)',
                    transition:   'all 0.05s ease',
                    transform:    isActive ? 'scaleY(0.98)' : 'scaleY(1)',
                    transformOrigin: 'top',
                    zIndex: 1,
                    position:    'relative',
                  }}
                >
                  {/* C note label */}
                  {key.label && (
                    <span style={{
                      fontSize:   9,
                      fontWeight: 700,
                      color:      isActive ? '#fff' : '#888',
                      marginBottom: 2,
                    }}>
                      {key.label}
                    </span>
                  )}

                  {/* Expected glow ring */}
                  {isExpected && !isActive && (
                    <div style={{
                      position:     'absolute',
                      bottom:       4,
                      left:         '50%',
                      transform:    'translateX(-50%)',
                      width:        14,
                      height:       14,
                      borderRadius: '50%',
                      background:   'rgba(168,85,247,0.4)',
                      boxShadow:    '0 0 8px #a855f7',
                      animation:    'pulse 1s infinite',
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Black keys */}
          {blackKeys.map(key => {
            const isActive   = activeNotes.has(key.midi)
            const isExpected = key.midi === expectedNote
            const leftPos    = key.whitesBefore * (WHITE_W + 1) - (BLACK_W / 2) + 2

            return (
              <div
                key={key.midi}
                onMouseDown={() => onKeyPress?.(key.midi)}
                style={{
                  position:     'absolute',
                  top:          12,
                  left:         leftPos,
                  width:        BLACK_W,
                  height:       BLACK_H,
                  background:   isActive
                    ? 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)'
                    : isExpected
                    ? 'linear-gradient(180deg, #4c1d95 0%, #3b0764 100%)'
                    : 'linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 60%, #111122 100%)',
                  border:       isActive
                    ? '1px solid #a855f7'
                    : isExpected
                    ? '1px solid #7c3aed'
                    : '1px solid #000',
                  borderTop:    'none',
                  borderRadius: '0 0 4px 4px',
                  cursor:       'pointer',
                  zIndex:       10,
                  display:      'flex',
                  alignItems:   'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 4,
                  fontSize:     8,
                  color:        isActive ? '#fff' : isExpected ? '#a855f7' : '#666',
                  boxShadow:    isActive
                    ? '0 0 12px rgba(168,85,247,0.8), inset 0 -2px 4px rgba(0,0,0,0.3)'
                    : isExpected
                    ? '0 0 8px rgba(124,58,237,0.6)'
                    : '2px 4px 8px rgba(0,0,0,0.8), inset 0 -2px 3px rgba(0,0,0,0.4)',
                  transition:   'all 0.05s ease',
                  transform:    isActive ? 'scaleY(0.97)' : 'scaleY(1)',
                  transformOrigin: 'top',
                }}
              >
                {isExpected && !isActive && (
                  <div style={{
                    width:        8,
                    height:       8,
                    borderRadius: '50%',
                    background:   '#a855f7',
                    boxShadow:    '0 0 6px #a855f7',
                    marginBottom: 2,
                  }} />
                )}
              </div>
            )
          })}

          {/* Piano bottom rim */}
          <div
            style={{
              position:   'absolute',
              bottom:     0,
              left:       -4,
              right:      -4,
              height:     16,
              background: 'linear-gradient(180deg, #2d2d4e 0%, #1a1a2e 100%)',
              borderRadius: '0 0 8px 8px',
              boxShadow:  '0 4px 8px rgba(0,0,0,0.4)',
              zIndex:     20,
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {[
          { color: '#a855f7', label: 'Playing',  bg: 'rgba(168,85,247,0.2)' },
          { color: '#a855f7', label: 'Expected', bg: 'rgba(124,58,237,0.1)', border: true },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div style={{
              width:        16,
              height:       16,
              borderRadius: 3,
              background:   item.bg,
              border:       `2px solid ${item.color}`,
              boxShadow:    item.border ? 'none' : `0 0 6px ${item.color}`,
            }} />
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div style={{
            width: 16, height: 16, borderRadius: 3,
            background: 'linear-gradient(180deg, #f8f8ff 0%, #d8d8e8 100%)',
            border: '1px solid #aaa',
          }} />
          <span className="text-xs text-slate-500">White key</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{
            width: 12, height: 16, borderRadius: 3,
            background: 'linear-gradient(180deg, #2a2a3e 0%, #111122 100%)',
            border: '1px solid #000',
          }} />
          <span className="text-xs text-slate-500">Black key</span>
        </div>
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50%       { opacity: 0.5; transform: translateX(-50%) scale(1.3); }
        }
      `}</style>
    </div>
  )
}
