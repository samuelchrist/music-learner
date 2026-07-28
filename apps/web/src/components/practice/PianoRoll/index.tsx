import { useCallback, useEffect, useRef } from 'react'
import { NotePlayer } from '@/lib/audio/NotePlayer'

interface Props {
  activeNotes:    Set<number>
  expectedNote?:  number
  startMidi?:     number
  endMidi?:       number
  onKeyPress?:    (midi: number) => void
  onKeyRelease?:  (midi: number) => void
}

export default function PianoRoll({
  activeNotes,
  expectedNote,
  startMidi   = 48,
  endMidi     = 84,
  onKeyPress,
  onKeyRelease,
}: Props) {
  const pressedKeys = useRef<Set<number>>(new Set())
  const noteNames   = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  const isBlackFn   = (m: number) => [1,3,6,8,10].includes(m % 12)

  // ── Build key lists ──────────────────────────────────────────
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

  const WHITE_W = 36
  const WHITE_H = 140
  const BLACK_W = 22
  const BLACK_H = 88
  const totalW  = whiteKeys.length * WHITE_W

  // ── Press / Release ──────────────────────────────────────────
  const handlePress = useCallback((midi: number) => {
    if (pressedKeys.current.has(midi)) return
    pressedKeys.current.add(midi)

    // Use attack for natural sustain while key held
    NotePlayer.attack(midi, 0.8)
    onKeyPress?.(midi)
  }, [onKeyPress])

  const handleRelease = useCallback((midi: number) => {
    if (!pressedKeys.current.has(midi)) return
    pressedKeys.current.delete(midi)

    // Natural release — note fades out
    NotePlayer.stop(midi)
    onKeyRelease?.(midi)
  }, [onKeyRelease])

  const handleMouseLeave = useCallback((midi: number) => {
    if (pressedKeys.current.has(midi)) handleRelease(midi)
  }, [handleRelease])

  // ── Release all on global mouse up ───────────────────────────
  useEffect(() => {
    const onUp = () => {
      pressedKeys.current.forEach(midi => {
        NotePlayer.stop(midi)
        onKeyRelease?.(midi)
      })
      pressedKeys.current.clear()
    }
    window.addEventListener('mouseup',     onUp)
    window.addEventListener('touchend',    onUp)
    window.addEventListener('touchcancel', onUp)
    return () => {
      window.removeEventListener('mouseup',     onUp)
      window.removeEventListener('touchend',    onUp)
      window.removeEventListener('touchcancel', onUp)
    }
  }, [onKeyRelease])

  // ── Styles ───────────────────────────────────────────────────
  const whiteStyle = (midi: number): React.CSSProperties => {
    const active   = activeNotes.has(midi)
    const expected = midi === expectedNote
    return {
      width:          WHITE_W,
      height:         WHITE_H,
      marginRight:    1,
      background:     active
        ? 'linear-gradient(180deg,#a855f7 0%,#7c3aed 100%)'
        : expected
        ? 'linear-gradient(180deg,rgba(168,85,247,.4) 0%,rgba(124,58,237,.15) 100%)'
        : 'linear-gradient(180deg,#f8f8ff 0%,#e8e8f0 60%,#d8d8e8 100%)',
      border:         `1px solid ${active ? '#7c3aed' : expected ? '#a855f7' : '#aaa'}`,
      borderTop:      'none',
      borderRadius:   '0 0 6px 6px',
      cursor:         'pointer',
      display:        'flex',
      alignItems:     'flex-end',
      justifyContent: 'center',
      paddingBottom:  6,
      fontSize:       10,
      fontWeight:     700,
      color:          active ? '#fff' : expected ? '#a855f7' : '#666',
      boxShadow:      active
        ? 'inset 0 -2px 4px rgba(124,58,237,.5),0 0 16px rgba(168,85,247,.6)'
        : expected
        ? 'inset 0 -2px 4px rgba(124,58,237,.2)'
        : 'inset 0 -4px 8px rgba(0,0,0,.1),2px 4px 6px rgba(0,0,0,.2)',
      transform:      active ? 'scaleY(.97)' : 'scaleY(1)',
      transformOrigin:'top',
      transition:     'all .05s ease',
      zIndex:         1,
      position:       'relative',
      userSelect:     'none',
    }
  }

  const blackStyle = (midi: number, leftPos: number): React.CSSProperties => {
    const active   = activeNotes.has(midi)
    const expected = midi === expectedNote
    return {
      position:       'absolute',
      top:            12,
      left:           leftPos,
      width:          BLACK_W,
      height:         BLACK_H,
      background:     active
        ? 'linear-gradient(180deg,#a855f7 0%,#7c3aed 100%)'
        : expected
        ? 'linear-gradient(180deg,#4c1d95 0%,#3b0764 100%)'
        : 'linear-gradient(180deg,#2a2a3e 0%,#1a1a2e 60%,#111122 100%)',
      border:         `1px solid ${active ? '#a855f7' : expected ? '#7c3aed' : '#000'}`,
      borderTop:      'none',
      borderRadius:   '0 0 4px 4px',
      cursor:         'pointer',
      zIndex:         10,
      display:        'flex',
      alignItems:     'flex-end',
      justifyContent: 'center',
      paddingBottom:  4,
      boxShadow:      active
        ? '0 0 16px rgba(168,85,247,.8),inset 0 -2px 4px rgba(0,0,0,.3)'
        : expected
        ? '0 0 8px rgba(124,58,237,.6)'
        : '2px 4px 8px rgba(0,0,0,.8),inset 0 -2px 3px rgba(0,0,0,.4)',
      transform:      active ? 'scaleY(.97)' : 'scaleY(1)',
      transformOrigin:'top',
      transition:     'all .05s ease',
      userSelect:     'none',
    }
  }

  return (
    <div
      className="overflow-x-auto py-4 px-6 border-t border-slate-800"
      style={{ background: 'var(--surface2)' }}
      onContextMenu={e => e.preventDefault()}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Grand Piano — click or use keyboard
        </span>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>🟣 Playing</span>
          <span>⭕ Expected next</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative" style={{ width: totalW, height: WHITE_H + 32 }}>

          {/* Top rim */}
          <div style={{
            position:     'absolute',
            top:          0, left: -4, right: -4, height: 12,
            background:   'linear-gradient(180deg,#1a1a2e 0%,#2d2d4e 100%)',
            borderRadius: '6px 6px 0 0',
            zIndex:       20,
            boxShadow:    '0 2px 4px rgba(0,0,0,.5)',
          }} />

          {/* White keys */}
          <div className="absolute flex" style={{ top: 12, left: 0 }}>
            {whiteKeys.map(key => (
              <div
                key={key.midi}
                style={whiteStyle(key.midi)}
                onMouseDown={e => { e.preventDefault(); handlePress(key.midi) }}
                onMouseUp={() => handleRelease(key.midi)}
                onMouseLeave={() => handleMouseLeave(key.midi)}
                onTouchStart={e => { e.preventDefault(); handlePress(key.midi) }}
                onTouchEnd={() => handleRelease(key.midi)}
              >
                {key.label && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    color: activeNotes.has(key.midi) ? '#fff' : '#888',
                    marginBottom: 2, pointerEvents: 'none',
                  }}>
                    {key.label}
                  </span>
                )}
                {key.midi === expectedNote && !activeNotes.has(key.midi) && (
                  <div style={{
                    position:     'absolute',
                    bottom:       6, left: '50%',
                    transform:    'translateX(-50%)',
                    width:        12, height: 12,
                    borderRadius: '50%',
                    background:   'rgba(168,85,247,.5)',
                    boxShadow:    '0 0 8px #a855f7',
                    animation:    'keyPulse 1s infinite',
                    pointerEvents:'none',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Black keys */}
          {blackKeys.map(key => {
            const left = key.whitesBefore * (WHITE_W + 1) - BLACK_W / 2 + 2
            return (
              <div
                key={key.midi}
                style={blackStyle(key.midi, left)}
                onMouseDown={e => { e.preventDefault(); handlePress(key.midi) }}
                onMouseUp={() => handleRelease(key.midi)}
                onMouseLeave={() => handleMouseLeave(key.midi)}
                onTouchStart={e => { e.preventDefault(); handlePress(key.midi) }}
                onTouchEnd={() => handleRelease(key.midi)}
              >
                {key.midi === expectedNote && !activeNotes.has(key.midi) && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#a855f7', boxShadow: '0 0 6px #a855f7',
                    marginBottom: 3, animation: 'keyPulse 1s infinite',
                    pointerEvents: 'none',
                  }} />
                )}
              </div>
            )
          })}

          {/* Bottom rim */}
          <div style={{
            position:     'absolute',
            bottom:       0, left: -4, right: -4, height: 16,
            background:   'linear-gradient(180deg,#2d2d4e 0%,#1a1a2e 100%)',
            borderRadius: '0 0 8px 8px',
            boxShadow:    '0 4px 8px rgba(0,0,0,.4)',
            zIndex:       20,
          }} />
        </div>
      </div>

      <style>{`
        @keyframes keyPulse {
          0%,100% { opacity:1; transform:translateX(-50%) scale(1); }
          50%     { opacity:.5; transform:translateX(-50%) scale(1.3); }
        }
      `}</style>
    </div>
  )
}
