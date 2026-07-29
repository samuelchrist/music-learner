type Instrument = 'piano' | 'guitar' | 'bass4' | 'bass5' | 'drums'

interface Props {
  instrument: Instrument
}

export default function KeyboardGuide({ instrument }: Props) {

  // ── Piano ──────────────────────────────────────────────────
  if (instrument === 'piano') {
    return (
      <div style={{ padding: '10px 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>
            Keyboard →
          </span>
          <div style={{ fontFamily:'monospace', fontSize:12, background:'var(--surface2)', padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)' }}>
            <div>
              {[{key:'W',note:'C#4'},{key:'E',note:'D#4'},{gap:true},{key:'T',note:'F#4'},{key:'Y',note:'G#4'},{key:'U',note:'A#4'},{gap:true},{key:'O',note:'C#5'},{key:'P',note:'D#5'}].map((k:any,i) =>
                k.gap
                  ? <span key={i} style={{display:'inline-block',width:38,textAlign:'center',color:'transparent'}}>__</span>
                  : <span key={i} style={{display:'inline-block',width:38,textAlign:'center'}}>
                      <span style={{display:'inline-block',padding:'1px 5px',background:'#1a1a2e',border:'1px solid #334155',borderRadius:4,fontSize:11,fontWeight:700,color:'#a855f7',boxShadow:'0 2px 0 #0f172a'}}>{k.key}</span>
                      <span style={{display:'block',fontSize:9,color:'#a855f7',marginTop:1}}>{k.note}</span>
                    </span>
              )}
            </div>
            <div style={{marginTop:2}}>
              {[{key:'A',note:'C4'},{key:'S',note:'D4'},{key:'D',note:'E4'},{key:'F',note:'F4'},{key:'G',note:'G4'},{key:'H',note:'A4'},{key:'J',note:'B4'},{key:'K',note:'C5'},{key:'L',note:'D5'}].map((k,i) => (
                <span key={i} style={{display:'inline-block',width:38,textAlign:'center'}}>
                  <span style={{display:'inline-block',padding:'1px 5px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:4,fontSize:11,fontWeight:700,color:'#94a3b8',boxShadow:'0 2px 0 var(--border)'}}>{k.key}</span>
                  <span style={{display:'block',fontSize:9,color:'#64748b',marginTop:1}}>{k.note}</span>
                </span>
              ))}
            </div>
          </div>
          <span style={{fontSize:11,color:'var(--text-sub)',flexShrink:0}}>💡 Or click keys above</span>
        </div>
      </div>
    )
  }

  // ── Guitar ─────────────────────────────────────────────────
  if (instrument === 'guitar') {
    return (
      <div style={{ padding: '10px 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Guitar →</span>
          <div style={{ fontFamily:'monospace', fontSize:11, background:'var(--surface2)', padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)' }}>
            <div style={{color:'#94a3b8',marginBottom:2}}>Low E: [A]=E2 [S]=F2 [D]=F#2 [F]=G2 [G]=G#2 [H]=A2</div>
            <div style={{color:'#94a3b8'}}>A str: [Z]=A2 [X]=A#2 [C]=B2 [V]=C3 [B]=C#3 [N]=D3</div>
          </div>
          <span style={{fontSize:11,color:'var(--text-sub)'}}>💡 Or click fretboard above</span>
        </div>
      </div>
    )
  }

  // ── Bass 4-string ──────────────────────────────────────────
  if (instrument === 'bass4') {
    return (
      <div style={{ padding: '10px 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
            4-String Bass →
          </span>
          <div style={{ fontFamily:'monospace', fontSize:11, background:'var(--surface2)', padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)', lineHeight:1.8 }}>
            {[
              { string: 'G  (MIDI 43)', keys: ['A','S','D','F','G','H','J','K'], notes: ['G2','Ab2','A2','Bb2','B2','C3','C#3','D3'] },
              { string: 'D  (MIDI 38)', keys: ['Z','X','C','V','B','N','M',','],  notes: ['D2','Eb2','E2','F2','F#2','G2','Ab2','A2'] },
              { string: 'A  (MIDI 33)', keys: ['1','2','3','4','5','6','7','8'],  notes: ['A1','Bb1','B1','C2','C#2','D2','Eb2','E2'] },
              { string: 'E  (MIDI 28)', keys: ['Q','W','E','R','T','Y','U','I'],  notes: ['E1','F1','F#1','G1','Ab1','A1','Bb1','B1'] },
            ].map((row, ri) => (
              <div key={ri} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                <span style={{ fontSize:10, color:'#64748b', width:80, flexShrink:0 }}>{row.string}:</span>
                {row.keys.map((k, i) => (
                  <span key={i} style={{ textAlign:'center' }}>
                    <span style={{ display:'inline-block', padding:'1px 4px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:3, fontSize:10, fontWeight:700, color:'#94a3b8' }}>{k}</span>
                    <span style={{ display:'block', fontSize:8, color:'#475569', marginTop:1 }}>{row.notes[i]}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <span style={{ fontSize:11, color:'var(--text-sub)' }}>💡 Or click fretboard</span>
        </div>
      </div>
    )
  }

  // ── Bass 5-string ──────────────────────────────────────────
  if (instrument === 'bass5') {
    return (
      <div style={{ padding: '10px 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
            5-String Bass →
          </span>
          <div style={{ fontFamily:'monospace', fontSize:11, background:'var(--surface2)', padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)', lineHeight:1.8 }}>
            {[
              { string: 'G  (MIDI 43)', keys: ['A','S','D','F','G','H'], notes: ['G2','Ab2','A2','Bb2','B2','C3'] },
              { string: 'D  (MIDI 38)', keys: ['Z','X','C','V','B','N'], notes: ['D2','Eb2','E2','F2','F#2','G2'] },
              { string: 'A  (MIDI 33)', keys: ['1','2','3','4','5','6'], notes: ['A1','Bb1','B1','C2','C#2','D2'] },
              { string: 'E  (MIDI 28)', keys: ['Q','W','E','R','T','Y'], notes: ['E1','F1','F#1','G1','Ab1','A1'] },
              { string: 'B  (MIDI 23)', keys: ['!','@','#','$','%','^'], notes: ['B0','C1','C#1','D1','Eb1','E1'] },
            ].map((row, ri) => (
              <div key={ri} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                <span style={{ fontSize:10, color: ri === 4 ? '#f59e0b' : '#64748b', width:80, flexShrink:0, fontWeight: ri === 4 ? 700 : 400 }}>{row.string}:</span>
                {row.keys.map((k, i) => (
                  <span key={i} style={{ textAlign:'center' }}>
                    <span style={{ display:'inline-block', padding:'1px 4px', background: ri === 4 ? 'rgba(245,158,11,.1)' : 'var(--surface)', border:`1px solid ${ri === 4 ? '#f59e0b55' : 'var(--border)'}`, borderRadius:3, fontSize:10, fontWeight:700, color: ri === 4 ? '#f59e0b' : '#94a3b8' }}>{k}</span>
                    <span style={{ display:'block', fontSize:8, color: ri === 4 ? '#f59e0b99' : '#475569', marginTop:1 }}>{row.notes[i]}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div style={{ fontSize:10, color:'var(--text-sub)', lineHeight:1.5 }}>
            <div>💡 Or click fretboard</div>
            <div style={{ color:'#f59e0b', marginTop:2 }}>🟡 B string = low B0</div>
          </div>
        </div>
      </div>
    )
  }

  // ── Drums ──────────────────────────────────────────────────
  if (instrument === 'drums') {
    const pads = [
      {key:'1',name:'Kick',color:'#ef4444'},{key:'2',name:'Snare',color:'#f97316'},
      {key:'3',name:'Hi-Hat',color:'#3b82f6'},{key:'4',name:'Open HH',color:'#60a5fa'},
      {key:'5',name:'Hi Tom',color:'#10b981'},{key:'6',name:'Mid Tom',color:'#34d399'},
      {key:'7',name:'Lo Tom',color:'#6ee7b7'},{key:'8',name:'Crash',color:'#f59e0b'},
      {key:'9',name:'Ride',color:'#fbbf24'},{key:'0',name:'Rim',color:'#fb923c'},
    ]
    return (
      <div style={{ padding:'10px 20px', background:'var(--surface)', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--text-sub)', textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>Number Keys →</span>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {pads.map(pad => (
              <div key={pad.key} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ display:'flex', width:28, height:26, background:`${pad.color}18`, border:`1px solid ${pad.color}55`, borderRadius:5, boxShadow:`0 2px 0 ${pad.color}33`, alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:pad.color }}>{pad.key}</span>
                <span style={{ fontSize:9, fontWeight:600, color:pad.color, whiteSpace:'nowrap', maxWidth:40, textAlign:'center', lineHeight:1.2 }}>{pad.name}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize:11, color:'var(--text-sub)' }}>💡 Or click pads</span>
        </div>
      </div>
    )
  }

  return null
}
