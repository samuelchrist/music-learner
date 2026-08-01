import { useEffect, useRef } from 'react'

interface Props {
  velocity:     number   // 0-127
  noteCount?:   number
  avgVelocity?: number
  minVelocity?: number
  maxVelocity?: number
  vertical?:    boolean
}

// Velocity zones
function getVelocityZone(v: number): { label: string; color: string; bg: string } {
  if (v === 0)   return { label: 'Silent',    color: '#475569', bg: 'rgba(71,85,105,.2)'   }
  if (v <= 20)   return { label: 'ppp',       color: '#93c5fd', bg: 'rgba(147,197,253,.2)' }
  if (v <= 40)   return { label: 'pp',        color: '#60a5fa', bg: 'rgba(96,165,250,.2)'  }
  if (v <= 55)   return { label: 'p',         color: '#3b82f6', bg: 'rgba(59,130,246,.2)'  }
  if (v <= 70)   return { label: 'mp',        color: '#10b981', bg: 'rgba(16,185,129,.2)'  }
  if (v <= 85)   return { label: 'mf',        color: '#f59e0b', bg: 'rgba(245,158,11,.2)'  }
  if (v <= 100)  return { label: 'f',         color: '#f97316', bg: 'rgba(249,115,22,.2)'  }
  if (v <= 115)  return { label: 'ff',        color: '#ef4444', bg: 'rgba(239,68,68,.2)'   }
  return                 { label: 'fff',       color: '#dc2626', bg: 'rgba(220,38,38,.2)'   }
}

export default function VelocityMeter({
  velocity,
  noteCount   = 0,
  avgVelocity = 0,
  minVelocity = 0,
  maxVelocity = 0,
  vertical    = false,
}: Props) {
  const barRef     = useRef<HTMLDivElement>(null)
  const zone       = getVelocityZone(velocity)
  const pct        = Math.round((velocity / 127) * 100)
  const avgZone    = getVelocityZone(avgVelocity)

  // Animate bar
  useEffect(() => {
    if (!barRef.current) return
    if (vertical) {
      barRef.current.style.height = `${pct}%`
      barRef.current.style.background = `linear-gradient(0deg, ${zone.color}88, ${zone.color})`
    } else {
      barRef.current.style.width = `${pct}%`
      barRef.current.style.background = `linear-gradient(90deg, ${zone.color}88, ${zone.color})`
    }
    barRef.current.style.boxShadow = velocity > 0 ? `0 0 8px ${zone.color}66` : 'none'
  }, [velocity, pct, zone.color, vertical])

  if (vertical) {
    return (
      <div style={{
        width:          76,
        height:         '100%',
        padding:        '10px 8px',
        background:     'var(--surface)',
        border:         '1px solid var(--border)',
        borderRadius:   10,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            6,
        flexShrink:     0,
        boxSizing:      'border-box',
      }}>
        <span style={{
          fontSize:      9,
          fontWeight:    700,
          color:         'var(--text-sub)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Velocity
        </span>

        <span style={{ fontSize: 15, fontWeight: 800, color: zone.color }}>
          {velocity}
        </span>
        <span style={{
          fontSize:     9,
          fontWeight:   700,
          color:        zone.color,
          background:   zone.bg,
          padding:      '1px 6px',
          borderRadius: 999,
          border:       `1px solid ${zone.color}44`,
        }}>
          {zone.label}
        </span>

        {/* Vertical bar track */}
        <div style={{
          width:        14,
          flex:         1,
          minHeight:    60,
          background:   '#1e293b',
          borderRadius: 7,
          overflow:     'hidden',
          position:     'relative',
          display:      'flex',
          alignItems:   'flex-end',
        }}>
          {[20, 40, 55, 70, 85, 100, 115].map(v => (
            <div key={v} style={{
              position:   'absolute',
              left:       0,
              right:      0,
              bottom:     `${(v / 127) * 100}%`,
              height:     1,
              background: 'rgba(255,255,255,0.1)',
            }} />
          ))}
          <div
            ref={barRef}
            style={{
              width:        '100%',
              height:       0,
              borderRadius: 7,
              transition:   'height 0.08s ease, background 0.1s ease',
            }}
          />
        </div>

        {noteCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', marginTop: 2 }}>
            {[
              { label: 'Avg', value: avgVelocity },
              { label: 'Min', value: minVelocity },
              { label: 'Max', value: maxVelocity },
            ].map(s => (
              <div key={s.label} style={{ fontSize: 9, color: 'var(--text-sub)' }}>
                {s.label} <strong style={{ color: getVelocityZone(s.value).color }}>{s.value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      padding:    '10px 20px',
      background: 'var(--surface)',
      borderTop:  '1px solid var(--border)',
      display:    'flex',
      alignItems: 'center',
      gap:        20,
      flexWrap:   'wrap',
    }}>

      {/* Label */}
      <span style={{
        fontSize:      11,
        fontWeight:    700,
        color:         'var(--text-sub)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        flexShrink:    0,
      }}>
        Velocity
      </span>

      {/* Main velocity bar */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   4,
        }}>
          <span style={{
            fontSize:   13,
            fontWeight: 800,
            color:      zone.color,
            minWidth:   30,
          }}>
            {velocity}
          </span>
          <span style={{
            fontSize:     11,
            fontWeight:   700,
            color:        zone.color,
            background:   zone.bg,
            padding:      '1px 8px',
            borderRadius: 999,
            border:       `1px solid ${zone.color}44`,
          }}>
            {zone.label}
          </span>
        </div>

        {/* Bar track */}
        <div style={{
          height:       10,
          background:   '#1e293b',
          borderRadius: 5,
          overflow:     'hidden',
          position:     'relative',
        }}>
          {/* Zone markers */}
          {[20, 40, 55, 70, 85, 100, 115].map(v => (
            <div key={v} style={{
              position:   'absolute',
              left:       `${(v / 127) * 100}%`,
              top:        0,
              width:      1,
              height:     '100%',
              background: 'rgba(255,255,255,0.1)',
            }} />
          ))}
          {/* Velocity bar */}
          <div
            ref={barRef}
            style={{
              height:     '100%',
              width:      0,
              borderRadius: 5,
              transition: 'width 0.08s ease, background 0.1s ease',
            }}
          />
        </div>

        {/* Scale labels */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          marginTop:      2,
          fontSize:       8,
          color:          '#334155',
          fontStyle:      'italic',
        }}>
          <span>ppp</span>
          <span>pp</span>
          <span>p</span>
          <span>mp</span>
          <span>mf</span>
          <span>f</span>
          <span>ff</span>
          <span>fff</span>
        </div>
      </div>

      {/* Stats */}
      {noteCount > 0 && (
        <div style={{
          display:  'flex',
          gap:      16,
          flexShrink: 0,
        }}>
          {[
            { label: 'Avg',  value: avgVelocity, zone: getVelocityZone(avgVelocity) },
            { label: 'Min',  value: minVelocity, zone: getVelocityZone(minVelocity) },
            { label: 'Max',  value: maxVelocity, zone: getVelocityZone(maxVelocity) },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize:   14,
                fontWeight: 700,
                color:      s.zone.color,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 9, color: '#475569' }}>{s.label}</div>
              <div style={{
                fontSize:   9,
                color:      s.zone.color,
                fontStyle:  'italic',
                fontWeight: 600,
              }}>
                {s.zone.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      <div style={{
        fontSize:     10,
        color:        '#334155',
        borderLeft:   '1px solid var(--border)',
        paddingLeft:  12,
        flexShrink:   0,
        lineHeight:   1.5,
        maxWidth:     120,
      }}>
        🎯 Aim for<br/>
        <strong style={{ color: '#10b981' }}>mp–mf</strong><br/>
        (64–85)
      </div>
    </div>
  )
}
