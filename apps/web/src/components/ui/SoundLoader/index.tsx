import { useEffect, useState } from 'react'
import { NotePlayer }          from '@/lib/audio/NotePlayer'
import { onPianoLoaded, onDrumsLoaded } from '@/lib/audio/SoundEngine'

export default function SoundLoader() {
  const [piano,  setPiano]  = useState(false)
  const [drums,  setDrums]  = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Start preloading both
    NotePlayer.preload()

    onPianoLoaded(() => setPiano(true))
    onDrumsLoaded(() => setDrums(true))

    // Auto hide after both loaded + 2s
    const check = setInterval(() => {
      if (NotePlayer.isPianoReady() && NotePlayer.isDrumsReady()) {
        setTimeout(() => setHidden(true), 2000)
        clearInterval(check)
      }
    }, 500)

    // Force hide after 12 seconds
    const t = setTimeout(() => setHidden(true), 12000)
    return () => { clearInterval(check); clearTimeout(t) }
  }, [])

  if (hidden) return null

  const allReady = piano && drums

  return (
    <div style={{
      position:     'fixed',
      bottom:       20,
      right:        20,
      padding:      '12px 18px',
      background:   'var(--surface)',
      border:       `1px solid ${allReady ? '#10b981' : '#334155'}`,
      borderRadius: 12,
      zIndex:       999,
      boxShadow:    '0 4px 16px rgba(0,0,0,0.4)',
      minWidth:     200,
      transition:   'border-color 0.3s',
    }}>
      <p style={{
        fontSize:   11,
        fontWeight: 700,
        color:      'var(--text-sub)',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        Loading Sounds
      </p>

      {/* Piano row */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        8,
        marginBottom: 5,
      }}>
        {piano ? (
          <span style={{ fontSize: 14 }}>✅</span>
        ) : (
          <div style={{
            width:        14,
            height:       14,
            borderRadius: '50%',
            border:       '2px solid #334155',
            borderTop:    '2px solid #a855f7',
            animation:    'spin 0.8s linear infinite',
            flexShrink:   0,
          }} />
        )}
        <span style={{
          fontSize: 12,
          color:    piano ? '#10b981' : '#94a3b8',
          fontWeight: 600,
        }}>
          🎹 Grand Piano {piano ? '— Ready' : '— Loading...'}
        </span>
      </div>

      {/* Drums row */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        8,
      }}>
        {drums ? (
          <span style={{ fontSize: 14 }}>✅</span>
        ) : (
          <div style={{
            width:        14,
            height:       14,
            borderRadius: '50%',
            border:       '2px solid #334155',
            borderTop:    '2px solid #ef4444',
            animation:    'spin 0.8s linear infinite',
            flexShrink:   0,
          }} />
        )}
        <span style={{
          fontSize: 12,
          color:    drums ? '#10b981' : '#94a3b8',
          fontWeight: 600,
        }}>
          🥁 Acoustic Drums {drums ? '— Ready' : '— Loading...'}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop:    10,
        height:       3,
        background:   '#1e293b',
        borderRadius: 2,
        overflow:     'hidden',
      }}>
        <div style={{
          height:     '100%',
          width:      `${(piano ? 50 : 0) + (drums ? 50 : 0)}%`,
          background: 'linear-gradient(90deg, #a855f7, #10b981)',
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
