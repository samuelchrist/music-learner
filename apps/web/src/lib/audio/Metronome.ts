class Metro {
  private ctx:AudioContext|null=null; private timer:number|null=null
  private next=0; private beat=0; private bpm=80; private running=false
  private onBeatCb:((b:number,t:number)=>void)|null=null
  private LA=0.1; private INT=50

  getCtx() {
    if(!this.ctx) this.ctx=new (window.AudioContext||(window as any).webkitAudioContext)()
    return this.ctx
  }
  private click(t:number,accent:boolean) {
    const ctx=this.getCtx(),o=ctx.createOscillator(),g=ctx.createGain()
    o.connect(g);g.connect(ctx.destination)
    o.frequency.value=accent?1000:800
    g.gain.setValueAtTime(accent?.5:.25,t)
    g.gain.exponentialRampToValueAtTime(.001,t+.05)
    o.start(t);o.stop(t+.06)
  }
  private sched() {
    const ctx=this.getCtx(),spb=60/this.bpm
    while(this.next<ctx.currentTime+this.LA) {
      this.click(this.next,this.beat%4===0)
      if(this.onBeatCb) { const d=(this.next-ctx.currentTime)*1000; setTimeout(()=>this.onBeatCb!(this.beat,this.next),Math.max(0,d)) }
      this.next+=spb; this.beat++
    }
  }
  start(bpm?:number) {
    if(this.running) this.stop()
    if(bpm) this.bpm=bpm
    const ctx=this.getCtx()
    if(ctx.state==='suspended') ctx.resume()
    this.next=ctx.currentTime+.05; this.beat=0; this.running=true
    this.timer=window.setInterval(()=>this.sched(),this.INT)
  }
  stop() { if(this.timer) clearInterval(this.timer); this.running=false; this.beat=0 }
  setBPM(b:number) { this.bpm=Math.max(20,Math.min(300,b)) }
  countdown(beats:number,bpm:number):Promise<void> {
    return new Promise(res => {
      this.bpm=bpm; const ctx=this.getCtx()
      if(ctx.state==='suspended') ctx.resume()
      let t=ctx.currentTime+.1
      for(let i=beats;i>=1;i--) { this.click(t,true); t+=60/bpm }
      setTimeout(res,(t-ctx.currentTime)*1000)
    })
  }
  onBeat(cb:(b:number,t:number)=>void) { this.onBeatCb=cb }
  isRunning() { return this.running }
  getBPM()    { return this.bpm }
}
export const Metronome = new Metro()
