import { midiToFreq } from '@/constants/midiNotes'
class NP {
  private ctx:AudioContext|null=null
  getCtx() {
    if(!this.ctx) this.ctx=new (window.AudioContext||(window as any).webkitAudioContext)()
    return this.ctx
  }
  play(midi:number,dur=.4,vol=.4) {
    const ctx=this.getCtx(); if(ctx.state==='suspended') ctx.resume()
    const o=ctx.createOscillator(),g=ctx.createGain()
    o.connect(g);g.connect(ctx.destination)
    o.type='triangle'; o.frequency.value=midiToFreq(midi)
    g.gain.setValueAtTime(vol,ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur)
    o.start(ctx.currentTime); o.stop(ctx.currentTime+dur)
  }
  playDrum(midi:number) {
    const ctx=this.getCtx(); if(ctx.state==='suspended') ctx.resume()
    const buf=ctx.createBuffer(1,ctx.sampleRate*.1,ctx.sampleRate)
    const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1
    const src=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter()
    src.buffer=buf; f.type=midi===36?'lowpass':'highpass'; f.frequency.value=midi===36?200:3000
    src.connect(f);f.connect(g);g.connect(ctx.destination)
    g.gain.setValueAtTime(.6,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.15)
    src.start()
  }
}
export const NotePlayer = new NP()
