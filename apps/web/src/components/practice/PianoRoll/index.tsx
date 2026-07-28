import { useCallback, useEffect, useRef } from 'react'
import { NotePlayer } from '@/lib/audio/NotePlayer'

interface Props {
  activeNotes:    Set<number>   // currently pressed (purple glow)
  expectedNote?:  number        // next note to play (medium highlight)
  scaleNotes?:    Set<number>   // all notes in this lesson (light highlight)
  startMidi?:     number
  endMidi?:       number
  onKeyPress?:    (midi: number, velocity: number) => void
  onKeyRelease?:  (midi: number) => void
}

export default function PianoRoll({
  activeNotes,
  expectedNote,
  scaleNotes    = new Set(),
  startMidi     = 21,
  endMidi       = 108,
  onKeyPress,
  onKeyRelease,
}: Props) {
  const pressedKeys = useRef<Set<number>>(new Set())
  const scrollRef   = useRef<HTMLDivElement>(null)
  const noteNames   = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  const isBlackFn   = (m: number) => [1,3,6,8,10].includes(m % 12)

  // ── Build key lists ──────────────────────────────────────────
  const whiteKeys: { midi: number; note: string; label: string }[] = []
  const blackKeys: { midi: number; note: string; whitesBefore: number }[] = []
  let whiteCount = 0

  for (let m = startMidi; m <= endMidi; m++) {
    const name = noteNames[m % 12]
    const oct  = Math.floor(m / 12) - 1
    if (!isBlackFn(m)) {
      whiteKeys.push({ midi: m, note: `${name}${oct}`, label: name === 'C' ? `${name}${oct}` : '' })
      whiteCount++
    } else {
      blackKeys.push({ midi: m, note: `${name}${oct}`, whitesBefore: whiteCount })
    }
  }

  const WHITE_W = 28
  const WHITE_H = 130
  const BLACK_W = 18
  const BLACK_H = 82
  const totalW  = whiteKeys.length * WHITE_W

  // ── Scroll to middle C on load ───────────────────────────────
  useEffect(() => {
    if (!scrollRef.current) return
    const idx = whiteKeys.findIndex(k => k.midi === 60)
    if (idx >= 0) {
      scrollRef.current.scrollLeft = idx * WHITE_W - scrollRef.current.clientWidth / 2
    }
  }, [])

  // ── Scroll to follow expected note ───────────────────────────
  useEffect(() => {
    if (!expectedNote || !scrollRef.current) return
    const idx = whiteKeys.findIndex(k => k.midi === expectedNote)
    const targetIdx = idx >= 0 ? idx : whiteKeys.findIndex(k => k.midi >= (expectedNote || 0))
    if (targetIdx >= 0) {
      scrollRef.current.scrollTo({
        left: targetIdx * WHITE_W - scrollRef.current.clientWidth / 2,
        behavior: 'smooth',
      })
    }
  }, [expectedNote])

  // ── Press / Release ──────────────────────────────────────────
  const handlePress = useCallback((midi: number, velocity = 80) => {
    if (pressedKeys.current.has(midi)) return
    pressedKeys.current.add(midi)
    NotePlayer.attack(midi, velocity / 127)
    onKeyPress?.(midi, velocity)
  }, [onKeyPress])

  const handleRelease = useCallback((midi: number) => {
    if (!pressedKeys.current.has(midi)) return
    pressedKeys.current.delete(midi)
    NotePlayer.stop(midi)
    onKeyRelease?.(midi)
  }, [onKeyRelease])

  const handleMouseLeave = useCallback((midi: number) => {
    if (pressedKeys.current.has(midi)) handleRelease(midi)
  }, [handleRelease])

  useEffect(() => {
    const onUp = () => {
      pressedKeys.current.forEach(midi => { NotePlayer.stop(midi); onKeyRelease?.(midi) })
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

  // ── Key state classification ─────────────────────────────────
  // Priority: active > expected > scaleNote > normal
  type KeyState = 'active' | 'expected' | 'scale' | 'normal'

  function getKeyState(midi: number): KeyState {
    if (activeNotes.has(midi)) return 'active'
    if (midi === expectedNote)  return 'expected'
    if (scaleNotes.has(midi))  return 'scale'
    return 'normal'
  }

  // ── White key styles ─────────────────────────────────────────
  function whiteStyle(midi: number): React.CSSProperties {
    const state = getKeyState(midi)

    const configs = {
      active: {
        background: 'linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)',
        border:     '1px solid #7c3aed',
        color:      '#fff',
        boxShadow:  'inset 0 -2px 4px rgba(124,58,237,.5), 0 0 16px rgba(168,85,247,.7)',
        transform:  'scaleY(.97)',
      },
      expected: {
        background: 'linear-gradient(180deg, #ddd6fe 0%, #c4b5fd 60%, #a78bfa 100%)',
        border:     '1px solid #7c3aed',
        color:      '#4c1d95',
        boxShadow:  'inset 0 -3px 6px rgba(124,58,237,.3), 0 0 12px rgba(124,58,237,.5)',
        transform:  'scaleY(1)',
      },
      scale: {
        background: 'linear-gradient(180deg, #f0e6ff 0%, #e8d5ff 60%, #ddc4ff 100%)',
        border:     '1px solid #c4b5fd',
        color:      '#6d28d9',
        boxShadow:  'inset 0 -2px 4px rgba(124,58,237,.1)',
        transform:  'scaleY(1)',
      },
      normal: {
        background: 'linear-gradient(180deg, #f8f8ff 0%, #e8e8f0 60%, #d8d8e8 100%)',
        border:     '1px solid #bbb',
        color:      '#888',
        boxShadow:  'inset 0 -3px 6px rgba(0,0,0,.1), 1px 3px 4px rgba(0,0,0,.15)',
        transform:  'scaleY(1)',
      },
    }

    const cfg = configs[state]

    return {
      width:          WHITE_W,
      height:         WHITE_H,
      marginRight:    1,
      ...cfg,
      borderTop:      'none',
      borderRadius:   '0 0 5px 5px',
      cursor:         'pointer',
      display:        'flex',
      alignItems:     'flex-end',
      justifyContent: 'center',
      paddingBottom:  4,
      fontSize:       8,
      fontWeight:     700,
      transformOrigin:'top',
      transition:     'all .05s ease',
      zIndex:         1,
      position:       'relative',
      userSelect:     'none',
      flexShrink:     0,
    }
  }

  // ── Black key styles ─────────────────────────────────────────
  function blackStyle(midi: number, leftPos: number): React.CSSProperties {
    const state = getKeyState(midi)

    const configs = {
      active: {
        background: 'linear-gradient(180deg, #c084fc 0%, #7c3aed 100%)',
        border:     '1px solid #a855f7',
        boxShadow:  '0 0 16px rgba(168,85,247,.9), inset 0 -2px 3px rgba(0,0,0,.3)',
        transform:  'scaleY(.97)',
      },
      expected: {
        background: 'linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)',
        border:     '1px solid #a855f7',
        boxShadow:  '0 0 14px rgba(124,58,237,.8), inset 0 -2px 3px rgba(0,0,0,.3)',
        transform:  'scaleY(1)',
      },
      scale: {
        background: 'linear-gradient(180deg, #4c1d95 0%, #3b0764 100%)',
        border:     '1px solid #6d28d9',
        boxShadow:  '0 0 6px rgba(109,40,217,.5)',
        transform:  'scaleY(1)',
      },
      normal: {
        background: 'linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 60%, #0f0f1a 100%)',
        border:     '1px solid #111',
        boxShadow:  '1px 3px 6px rgba(0,0,0,.9), inset 0 -2px 3px rgba(0,0,0,.5)',
        transform:  'scaleY(1)',
      },
    }

    const cfg = configs[state]

    return {
      position:       'absolute',
      top:            12,
      left:           leftPos,
      width:          BLACK_W,
      height:         BLACK_H,
      ...cfg,
      borderTop:      'none',
      borderRadius:   '0 0 3px 3px',
      cursor:         'pointer',
      zIndex:         10,
      display:        'flex',
      alignItems:     'flex-end',
      justifyContent: 'center',
      paddingBottom:  3,
      transformOrigin:'top',
      transition:     'all .05s ease',
      userSelect:     'none',
    }
  }

  // ── Legend ───────────────────────────────────────────────────
  const legend = [
    { color: '#a855f7', bg: 'linear-gradient(180deg,#a855f7,#7c3aed)', label: 'Playing now',  border: '#7c3aed' },
    { color: '#4c1d95', bg: 'linear-gradient(180deg,#ddd6fe,#a78bfa)',  label: 'Play next',   border: '#7c3aed' },
    { color: '#6d28d9', bg: 'linear-gradient(180deg,#f0e6ff,#ddc4ff)',  label: 'Scale notes', border: '#c4b5fd' },
    { color: '#888',    bg: 'linear-gradient(180deg,#f8f8ff,#d8d8e8)',  label: 'Other keys',  border: '#bbb'    },
  ]

  return (
    <div
      style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '8px 16px',
        flexWrap:       'wrap',
        gap:            8,
      }}>
        <span style={{
          fontSize:      11,
          color:         'var(--text-sub)',
          fontWeight:    600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          🎹 88-Key Grand Piano
        </span>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {legend.map(l => (
            <div key={l.label} style={{
              display:    'flex',
              alignItems: 'center',
              gap:        5,
            }}>
              <div style={{
                width:        14,
                height:       20,
                borderRadius: 3,
                background:   l.bg,
                border:       `1px solid ${l.border}`,
                flexShrink:   0,
              }} />
              <span style={{ fontSize: 10, color: 'var(--text-sub)' }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable keyboard */}
      <div
        ref={scrollRef}
        style={{
          overflowX:     'auto',
          overflowY:     'hidden',
          padding:       '0 16px 8px',
          scrollbarWidth:'thin',
        }}
      >
        <div style={{
          position:  'relative',
          width:     totalW,
          height:    WHITE_H + 28,
          flexShrink: 0,
        }}>

          {/* Top rim */}
          <div style={{
            position:     'absolute',
            top:          0, left: -4, right: -4, height: 12,
            background:   'linear-gradient(180deg,#1a1a2e 0%,#2d2d4e 100%)',
            borderRadius: '6px 6px 0 0',
            zIndex:       20,
            boxShadow:    '0 2px 4px rgba(0,0,0,.6)',
          }} />

          {/* White keys */}
          <div style={{ position: 'absolute', top: 12, left: 0, display: 'flex' }}>
            {whiteKeys.map(key => {
              const state = getKeyState(key.midi)
              return (
                <div
                  key={key.midi}
                  style={whiteStyle(key.midi)}
                  onMouseDown={e => { e.preventDefault(); handlePress(key.midi, 80) }}
                  onMouseUp={() => handleRelease(key.midi)}
                  onMouseLeave={() => handleMouseLeave(key.midi)}
                  onTouchStart={e => { e.preventDefault(); handlePress(key.midi, 80) }}
                  onTouchEnd={() => handleRelease(key.midi)}
                >
                  {/* Note label — show for C notes and scale notes */}
                  {(key.label || state === 'scale' || state === 'expected') && (
                    <span style={{
                      fontSize:     7,
                      fontWeight:   700,
                      color:        state === 'active'   ? '#fff'
                                  : state === 'expected' ? '#4c1d95'
                                  : state === 'scale'    ? '#6d28d9'
                                  : '#999',
                      pointerEvents: 'none',
                      textAlign:    'center',
                    }}>
                      {key.label || (state !== 'normal' ? key.note : '')}
                    </span>
                  )}

                  {/* Pulsing dot on expected note */}
                  {state === 'expected' && (
                    <div style={{
                      position:     'absolute',
                      bottom:       22,
                      left:         '50%',
                      transform:    'translateX(-50%)',
                      width:        10,
                      height:       10,
                      borderRadius: '50%',
                      background:   '#7c3aed',
                      boxShadow:    '0 0 10px #a855f7',
                      animation:    'keyPulse 0.8s infinite',
                      pointerEvents:'none',
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Black keys */}
          {blackKeys.map(key => {
            const state   = getKeyState(key.midi)
            const leftPos = key.whitesBefore * (WHITE_W + 1) - BLACK_W / 2 + 1
            return (
              <div
                key={key.midi}
                style={blackStyle(key.midi, leftPos)}
                onMouseDown={e => { e.preventDefault(); handlePress(key.midi, 80) }}
                onMouseUp={() => handleRelease(key.midi)}
                onMouseLeave={() => handleMouseLeave(key.midi)}
                onTouchStart={e => { e.preventDefault(); handlePress(key.midi, 80) }}
                onTouchEnd={() => handleRelease(key.midi)}
              >
                {/* Pulsing dot on expected black key */}
                {state === 'expected' && (
                  <div style={{
                    width:        7,
                    height:       7,
                    borderRadius: '50%',
                    background:   '#e9d5ff',
                    boxShadow:    '0 0 8px #a855f7',
                    marginBottom: 3,
                    animation:    'keyPulse 0.8s infinite',
                    pointerEvents:'none',
                  }} />
                )}

                {/* Scale dot on black scale keys */}
                {state === 'scale' && (
                  <div style={{
                    width:        5,
                    height:       5,
                    borderRadius: '50%',
                    background:   '#a78bfa',
                    marginBottom: 3,
                    pointerEvents:'none',
                    opacity:      0.8,
                  }} />
                )}
              </div>
            )
          })}

          {/* Bottom rim */}
          <div style={{
            position:     'absolute',
            bottom:       0, left: -4, right: -4, height: 14,
            background:   'linear-gradient(180deg,#2d2d4e 0%,#1a1a2e 100%)',
            borderRadius: '0 0 6px 6px',
            zIndex:       20,
            boxShadow:    '0 3px 6px rgba(0,0,0,.5)',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes keyPulse {
          0%,100% { opacity:1; transform:translateX(-50%) scale(1); }
          50%     { opacity:.4; transform:translateX(-50%) scale(1.5); }
        }
      `}</style>
    </div>
  )
}
