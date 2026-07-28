import { KEYBOARD_MAP } from '@music-learner/shared'
type CB = (note:number, velocity:number) => void
class KB {
  private pressed=new Set<string>(); private onCb:CB|null=null; private offCb:CB|null=null; private en=true
  init() {
    document.addEventListener('keydown', e => {
      if(!this.en||e.repeat||this.pressed.has(e.key)) return
      const n=KEYBOARD_MAP[e.key.toLowerCase()]
      if(n!==undefined) { this.pressed.add(e.key); this.onCb?.(n,80) }
    })
    document.addEventListener('keyup', e => {
      const n=KEYBOARD_MAP[e.key.toLowerCase()]
      if(n!==undefined) { this.pressed.delete(e.key); this.offCb?.(n,0) }
    })
  }
  onNoteOn(cb:CB)   { this.onCb=cb }
  onNoteOff(cb:CB)  { this.offCb=cb }
  setEnabled(v:boolean) { this.en=v }
}
export const KeyboardFallback = new KB()
