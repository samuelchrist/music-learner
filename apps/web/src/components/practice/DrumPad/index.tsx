import { useState, useCallback, useEffect } from 'react'
import { NotePlayer } from '@/lib/audio/NotePlayer'

const DRUM_KIT = [
  // Cymbals
  { midi: 49, name: 'Crash',   key: '8', color: '#f59e0b', type: 'cymbal' },
  { midi: 42, name: 'Hi-Hat',  key: '3', color: '#3b82f6', type: 'cymbal' },
  { midi: 46, name: 'Open HH', key: '4', color: '#60a5fa', type: 'cymbal' },
  { midi: 51, name: 'Ride',    key: '9', color: '#f59e0b', type: 'cymbal' },
  // Toms
  { midi: 50, name: 'Hi Tom',  key: '5', color: '#10b981', type: 'tom'    },
  { midi: 47, name: 'Mid Tom', key: '6', color: '#34d399', type: 'tom'    },
  { midi: 45, name: 'Lo Tom',  key: '7', color: '#6ee7b7', type: 'tom'    },
  // Bottom row
  { midi: 36, name: 'Kick',    key: '1', color: '#ef4444', type: 'kick'   },
  { midi: 38, name: 'Snare',   key: '2', color: '#f97316', type: 'snare'  },
  { midi: 37, name: 'Rim',     key: '0', color: '#fb923c', type: 'rim'    },
]

// How long pad stays lit after hit (ms)
const RELEASE_MS = 120

interface Props {
  activeNotes:   Set<number>
  expectedNote?: number
  onPadPress?:   (midi: number) => void
  onPadRelease?: (midi: number) => void
}

export default function DrumKit({
  activeNotes,
  expectedNote,
  onPadPress,
  onPadRelease,
}: Props) {
  // Local flash state — which pads are briefly lit from click
  const [flashPads, setFlashPads] = useState<Set<number>>(new Set())

  const triggerPad = useCallback((midi: number) => {
    // Play drum sound
    NotePlayer.playDrum(midi)

    // Notify parent (for scoring)
    onPadPress?.(midi)

    // Light up pad
    setFlashPads(prev => new Set(prev).add(midi))

    // Auto release after RELEASE_MS
    setTimeout(() => {
      setFlashPads(prev => {
        const next = new Set(prev)
        next.delete(midi)
        return next
      })
      onPadRelease?.(midi)
    }, RELEASE_MS)
  }, [onPadPress, onPadRelease])

  // Keyboard trigger
  useEffect(() => {
    const keyMap: Record<string, number> = {
      '1': 36, '2': 38, '3': 42, '4': 46,
      '5': 50, '6': 47, '7': 45, '8': 49,
      '9': 51, '0': 37,
    }
    const pressed = new Set<string>()

    const onDown = (e: KeyboardEvent) => {
      if (['INPUT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if (e.repeat || pressed.has(e.key)) return
      const midi = keyMap[e.key]
      if (midi !== undefined) {
        pressed.add(e.key)
        triggerPad(midi)
      }
    }
    const onUp = (e: KeyboardEvent) => pressed.delete(e.key)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup',   onUp)
    }
  }, [triggerPad])

  const cymbals = DRUM_KIT.filter(d => d.type === 'cymbal')
  const toms    = DRUM_KIT.filter(d => d.type === 'tom')
  const bottom  = DRUM_KIT.filter(d => ['kick','snare','rim'].includes(d.type))

  function renderCymbal(pad: typeof DRUM_KIT[0]) {
    const lit      = flashPads.has(pad.midi) || activeNotes.has(pad.midi)
    const expected = pad.midi === expectedNote

    return (
      <div
        key={pad.midi}
        onClick={() => triggerPad(pad.midi)}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
      >
        {/* Stand */}
        <div style={{ width: 2, height: 14, background: '#475569', margin: '0 auto' }} />

        {/* Cymbal disc */}
        <div style={{
          width:        lit ? 76 : expected ? 74 : 70,
          height:       lit ? 14 : expected ? 13 : 11,
          borderRadius: '50%',
          background:   lit
            ? `radial-gradient(ellipse, ${pad.color} 0%, ${pad.color}88 70%)`
            : expected
            ? `radial-gradient(ellipse, ${pad.color}55 0%, ${pad.color}22 100%)`
            : 'radial-gradient(ellipse, #c0a060 0%, #a08040 50%, #806030 100%)',
          border:       `2px solid ${lit ? pad.color : expected ? pad.color + '88' : '#d4af37'}`,
          boxShadow:    lit
            ? `0 0 20px ${pad.color}, 0 4px 8px rgba(0,0,0,0.4)`
            : expected
            ? `0 0 10px ${pad.color}55`
            : '0 4px 8px rgba(0,0,0,0.4)',
          transform:    `rotateX(20deg) ${lit ? 'scale(1.05)' : 'scale(1)'}`,
          transition:   'all 0.06s ease',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          userSelect:   'none',
        }}>
          {/* Bell */}
          <div style={{
            width:        14,
            height:       7,
            borderRadius: '50%',
            background:   lit ? 'rgba(255,255,255,0.6)' : 'rgba(212,175,55,0.6)',
            border:       '1px solid rgba(255,255,255,0.3)',
          }} />
        </div>

        {/* Label */}
        <span style={{
          fontSize:   10,
          fontWeight: 700,
          color:      lit ? pad.color : expected ? pad.color : '#64748b',
          transition: 'color 0.1s',
        }}>
          {pad.name}
        </span>

        {/* Key hint */}
        <span style={{
          fontSize:     9,
          background:   lit ? `${pad.color}33` : '#1e293b',
          color:        lit ? pad.color : '#475569',
          padding:      '1px 5px',
          borderRadius: 3,
          border:       `1px solid ${lit ? pad.color + '55' : '#334155'}`,
          transition:   'all 0.1s',
        }}>
          {pad.key}
        </span>
      </div>
    )
  }

  function renderDrum(pad: typeof DRUM_KIT[0]) {
    const lit      = flashPads.has(pad.midi) || activeNotes.has(pad.midi)
    const expected = pad.midi === expectedNote
    const isKick   = pad.type === 'kick'
    const isSnare  = pad.type === 'snare'

    const w = isKick ? 90 : 68
    const h = isKick ? 88 : isSnare ? 54 : 58

    return (
      <div
        key={pad.midi}
        onClick={() => triggerPad(pad.midi)}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
      >
        {/* Drum shell */}
        <div style={{
          width:        lit ? w + 4 : expected ? w + 2 : w,
          height:       lit ? h + 4 : expected ? h + 2 : h,
          borderRadius: isKick ? '50%' : '50% 50% 40% 40% / 40% 40% 50% 50%',
          background:   lit
            ? `radial-gradient(circle at 35% 35%, ${pad.color}ee, ${pad.color}88)`
            : expected
            ? `radial-gradient(circle at 35% 35%, ${pad.color}44, ${pad.color}22)`
            : isKick
            ? 'radial-gradient(circle at 35% 35%, #374151, #1f2937)'
            : 'radial-gradient(circle at 35% 35%, #4b5563, #374151)',
          border:       `3px solid ${lit ? pad.color : expected ? pad.color + '88' : '#6b7280'}`,
          boxShadow:    lit
            ? `0 0 24px ${pad.color}cc, inset 0 2px 4px rgba(255,255,255,0.2), 0 6px 12px rgba(0,0,0,0.5)`
            : expected
            ? `0 0 12px ${pad.color}66`
            : '0 4px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.05)',
          transform:    lit ? 'scale(0.96)' : 'scale(1)',
          transition:   'all 0.06s ease',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          position:     'relative',
          userSelect:   'none',
        }}>
          {/* Drum head */}
          <div style={{
            width:        isKick ? w * 0.75 : w * 0.72,
            height:       isKick ? h * 0.75 : h * 0.72,
            borderRadius: '50%',
            background:   lit
              ? `radial-gradient(circle, ${pad.color}55, transparent)`
              : 'radial-gradient(circle, rgba(255,255,255,0.06), transparent)',
            border:       `1px solid ${lit ? pad.color + '55' : 'rgba(255,255,255,0.1)'}`,
          }} />

          {/* Lug bolts */}
          {[0, 72, 144, 216, 288].map(angle => (
            <div key={angle} style={{
              position:     'absolute',
              width:        5,
              height:       5,
              borderRadius: '50%',
              background:   '#94a3b8',
              border:       '1px solid #64748b',
              top:          '50%',
              left:         '50%',
              transform:    `rotate(${angle}deg) translateY(-${isKick ? 38 : 25}px) translateX(-2.5px)`,
            }} />
          ))}
        </div>

        {/* Snare wires */}
        {isSnare && (
          <div style={{
            width:        w - 4,
            height:       3,
            background:   'repeating-linear-gradient(90deg, #94a3b8 0px, #94a3b8 2px, transparent 2px, transparent 5px)',
            borderRadius: 2,
            marginTop:    -2,
          }} />
        )}

        {/* Label */}
        <span style={{
          fontSize:   10,
          fontWeight: 700,
          color:      lit ? pad.color : expected ? pad.color : '#64748b',
          marginTop:  isSnare ? 2 : 0,
          transition: 'color 0.1s',
        }}>
          {pad.name}
        </span>

        {/* Key hint */}
        <span style={{
          fontSize:     9,
          background:   lit ? `${pad.color}33` : '#1e293b',
          color:        lit ? pad.color : '#475569',
          padding:      '1px 5px',
          borderRadius: 3,
          border:       `1px solid ${lit ? pad.color + '55' : '#334155'}`,
          transition:   'all 0.1s',
        }}>
          {pad.key}
        </span>
      </div>
    )
  }

  return (
    <div
      className="py-5 px-6 border-t border-slate-800"
      style={{ background: 'var(--surface2)' }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Drum Kit — click or use number keys 1-9
        </span>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span>
            <span style={{
              display:      'inline-block',
              width:        10,
              height:       10,
              borderRadius: 2,
              background:   '#ef4444',
              marginRight:  4,
              verticalAlign:'middle',
            }}/>
            Hit
          </span>
          <span>
            <span style={{
              display:      'inline-block',
              width:        10,
              height:       10,
              borderRadius: 2,
              background:   'rgba(239,68,68,0.2)',
              border:       '1px solid #ef4444',
              marginRight:  4,
              verticalAlign:'middle',
            }}/>
            Expected
          </span>
        </div>
      </div>

      {/* Stage */}
      <div style={{
        background:   'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 16,
        padding:      '20px 24px 16px',
        border:       '1px solid #334155',
        boxShadow:    'inset 0 2px 8px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.4)',
      }}>

        {/* Cymbals row */}
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          gap:            32,
          marginBottom:   20,
          alignItems:     'flex-end',
        }}>
          {cymbals.map(renderCymbal)}
        </div>

        {/* Toms row */}
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          gap:            20,
          marginBottom:   16,
          alignItems:     'flex-end',
        }}>
          {toms.map(renderDrum)}
        </div>

        {/* Bottom row */}
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          gap:            24,
          alignItems:     'flex-end',
        }}>
          {bottom.map(renderDrum)}
        </div>

        {/* Floor reflection */}
        <div style={{
          height:     3,
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.08), transparent)',
          borderRadius: 2,
          marginTop:  14,
        }} />
      </div>
    </div>
  )
}
