interface Props {
  instrument: 'piano' | 'guitar' | 'drums'
}

export default function KeyboardGuide({ instrument }: Props) {

  // ── Piano layout ───────────────────────────────────────────
  if (instrument === 'piano') {
    return (
      <div style={{
        padding:    '10px 20px',
        background: 'var(--surface)',
        borderTop:  '1px solid var(--border)',
      }}>
        <div style={{
          display:     'flex',
          alignItems:  'center',
          gap:         16,
          flexWrap:    'wrap',
          overflowX:   'auto',
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
            Keyboard →
          </span>

          {/* Visual keyboard layout */}
          <div style={{
            fontFamily:  'monospace',
            fontSize:    12,
            lineHeight:  1.8,
            background:  'var(--surface2)',
            padding:     '8px 14px',
            borderRadius: 8,
            border:      '1px solid var(--border)',
          }}>
            {/* Black keys row */}
            <div>
              {[
                { key: 'W',  note: 'C#4', gap: false },
                { key: 'E',  note: 'D#4', gap: false },
                { key: ' ',  note: '',    gap: true  },
                { key: 'T',  note: 'F#4', gap: false },
                { key: 'Y',  note: 'G#4', gap: false },
                { key: 'U',  note: 'A#4', gap: false },
                { key: ' ',  note: '',    gap: true  },
                { key: 'O',  note: 'C#5', gap: false },
                { key: 'P',  note: 'D#5', gap: false },
              ].map((k, i) =>
                k.gap ? (
                  <span key={i} style={{ display: 'inline-block', width: 38, textAlign: 'center', color: 'transparent' }}>__</span>
                ) : (
                  <span key={i} style={{ display: 'inline-block', width: 38, textAlign: 'center' }}>
                    <span style={{
                      display:        'inline-block',
                      padding:        '1px 5px',
                      background:     '#1a1a2e',
                      border:         '1px solid #334155',
                      borderRadius:   4,
                      fontSize:       11,
                      fontWeight:     700,
                      color:          '#a855f7',
                      boxShadow:      '0 2px 0 #0f172a',
                      verticalAlign:  'middle',
                    }}>
                      {k.key}
                    </span>
                    <span style={{ display: 'block', fontSize: 9, color: '#a855f7', marginTop: 1 }}>
                      {k.note}
                    </span>
                  </span>
                )
              )}
            </div>

            {/* White keys row */}
            <div style={{ marginTop: 2 }}>
              {[
                { key: 'A', note: 'C4' },
                { key: 'S', note: 'D4' },
                { key: 'D', note: 'E4' },
                { key: 'F', note: 'F4' },
                { key: 'G', note: 'G4' },
                { key: 'H', note: 'A4' },
                { key: 'J', note: 'B4' },
                { key: 'K', note: 'C5' },
                { key: 'L', note: 'D5' },
              ].map((k, i) => (
                <span key={i} style={{ display: 'inline-block', width: 38, textAlign: 'center' }}>
                  <span style={{
                    display:       'inline-block',
                    padding:       '1px 5px',
                    background:    'var(--surface2)',
                    border:        '1px solid var(--border)',
                    borderRadius:  4,
                    fontSize:      11,
                    fontWeight:    700,
                    color:         '#94a3b8',
                    boxShadow:     '0 2px 0 var(--border)',
                    verticalAlign: 'middle',
                  }}>
                    {k.key}
                  </span>
                  <span style={{ display: 'block', fontSize: 9, color: '#64748b', marginTop: 1 }}>
                    {k.note}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Tip */}
          <span style={{ fontSize: 11, color: 'var(--text-sub)', flexShrink: 0 }}>
            💡 Or click the keys above
          </span>
        </div>
      </div>
    )
  }

  // ── Guitar layout ──────────────────────────────────────────
  if (instrument === 'guitar') {
    return (
      <div style={{
        padding:    '10px 20px',
        background: 'var(--surface)',
        borderTop:  '1px solid var(--border)',
      }}>
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        16,
          flexWrap:   'wrap',
        }}>
          <span style={{
            fontSize:      11,
            fontWeight:    700,
            color:         'var(--text-sub)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            flexShrink:    0,
          }}>
            Keyboard →
          </span>

          <div style={{
            fontFamily:   'monospace',
            fontSize:     12,
            background:   'var(--surface2)',
            padding:      '8px 14px',
            borderRadius: 8,
            border:       '1px solid var(--border)',
          }}>
            {/* String rows — low E to high e */}
            {[
              { string: 'Low E',  keys: ['A','S','D','F','G','H','J','K','L'], notes: ['E2','F2','F#2','G2','G#2','A2','A#2','B2','C3'] },
              { string: 'A',      keys: ['Z','X','C','V','B','N','M'],          notes: ['A2','A#2','B2','C3','C#3','D3','D#3'] },
            ].map((row, ri) => (
              <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: ri === 0 ? 4 : 0 }}>
                <span style={{ fontSize: 10, color: '#64748b', width: 42, flexShrink: 0 }}>
                  {row.string}:
                </span>
                {row.keys.map((k, i) => (
                  <span key={i} style={{ textAlign: 'center' }}>
                    <span style={{
                      display:       'inline-block',
                      padding:       '1px 5px',
                      background:    'var(--surface2)',
                      border:        '1px solid var(--border)',
                      borderRadius:  4,
                      fontSize:      11,
                      fontWeight:    700,
                      color:         '#94a3b8',
                      boxShadow:     '0 2px 0 var(--border)',
                    }}>
                      {k}
                    </span>
                    <span style={{ display: 'block', fontSize: 9, color: '#64748b', marginTop: 1 }}>
                      {row.notes[i]}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>

          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>
            💡 Or click the fretboard above
          </span>
        </div>
      </div>
    )
  }

  // ── Drums layout ───────────────────────────────────────────
  if (instrument === 'drums') {
    const pads = [
      { key: '1', name: 'Kick',   color: '#ef4444' },
      { key: '2', name: 'Snare',  color: '#f97316' },
      { key: '3', name: 'Hi-Hat', color: '#3b82f6' },
      { key: '4', name: 'Open HH',color: '#60a5fa' },
      { key: '5', name: 'Hi Tom', color: '#10b981' },
      { key: '6', name: 'Mid Tom',color: '#34d399' },
      { key: '7', name: 'Lo Tom', color: '#6ee7b7' },
      { key: '8', name: 'Crash',  color: '#f59e0b' },
      { key: '9', name: 'Ride',   color: '#fbbf24' },
      { key: '0', name: 'Rim',    color: '#fb923c' },
    ]

    return (
      <div style={{
        padding:    '10px 20px',
        background: 'var(--surface)',
        borderTop:  '1px solid var(--border)',
      }}>
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        16,
          flexWrap:   'wrap',
        }}>
          <span style={{
            fontSize:      11,
            fontWeight:    700,
            color:         'var(--text-sub)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            flexShrink:    0,
          }}>
            Number Keys →
          </span>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pads.map(pad => (
              <div key={pad.key} style={{
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                gap:           3,
              }}>
                <span style={{
                  display:        'inline-block',
                  width:          28,
                  height:         26,
                  background:     `${pad.color}18`,
                  border:         `1px solid ${pad.color}55`,
                  borderRadius:   5,
                  boxShadow:      `0 2px 0 ${pad.color}33`,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       13,
                  fontWeight:     700,
                  color:          pad.color,
                }}>
                  {pad.key}
                </span>
                <span style={{
                  fontSize:   9,
                  fontWeight: 600,
                  color:      pad.color,
                  whiteSpace: 'nowrap',
                  maxWidth:   40,
                  textAlign:  'center',
                  lineHeight: 1.2,
                }}>
                  {pad.name}
                </span>
              </div>
            ))}
          </div>

          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>
            💡 Or click the pads above
          </span>
        </div>
      </div>
    )
  }

  return null
}
