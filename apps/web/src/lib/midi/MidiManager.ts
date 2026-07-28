type CB = (note:number, velocity:number) => void
class MM {
  private access: MIDIAccess|null=null; private inputs: MIDIInput[]=[]
  private onCb: CB|null=null; private offCb: CB|null=null; private _conn=false

  async init() {
    if(!navigator.requestMIDIAccess) return false
    try {
      this.access = await navigator.requestMIDIAccess({sysex:false})
      this.setup(); this.access.onstatechange=()=>this.setup(); return this._conn
    } catch { return false }
  }
  private setup() {
    this.inputs=[]
    this.access?.inputs.forEach(i => { i.onmidimessage=this.msg.bind(this); this.inputs.push(i) })
    this._conn = this.inputs.length>0
  }
  private msg(e: MIDIMessageEvent) {
    const [s,n,v]=Array.from(e.data), c=s&0xf0
    if(c===0x90&&v>0) this.onCb?.(n,v)
    else if(c===0x80||(c===0x90&&v===0)) this.offCb?.(n,0)
  }
  onNoteOn(cb:CB)  { this.onCb=cb }
  onNoteOff(cb:CB) { this.offCb=cb }
  get connected()  { return this._conn }
  get deviceName() { return this.inputs[0]?.name||null }
}
export const MidiManager = new MM()
