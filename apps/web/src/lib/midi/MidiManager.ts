type CB      = (note: number, velocity: number) => void
type StateCB = (connected: boolean, deviceName: string | null) => void

class MM {
  private access:       MIDIAccess | null = null
  private inputs:       MIDIInput[]       = []
  private onCb:         CB | null         = null
  private offCb:        CB | null         = null
  private stateCb:      StateCB | null    = null
  private _selected:    string | null     = null
  private _manualSelect = false           // user manually picked a device

  async init() {
    if (!navigator.requestMIDIAccess) {
      console.warn('WebMIDI not supported')
      return false
    }
    try {
      this.access = await navigator.requestMIDIAccess({ sysex: false })
      this.setup()
      this.access.onstatechange = () => {
        this.setup()
        if (!this._manualSelect) this.autoSelect()
        this.stateCb?.(this.connected, this.deviceName)
      }
      this.autoSelect()
      return this.connected
    } catch (err) {
      console.error('MIDI access denied:', err)
      return false
    }
  }

  private setup() {
    this.inputs = []
    this.access?.inputs.forEach(i => {
      if (i.state === 'connected') {
        i.onmidimessage = this.msg.bind(this)
        this.inputs.push(i)
      }
    })
  }

  private autoSelect() {
    const fantom = this.inputs.find(i => i.name.toLowerCase().includes('fantom'))
    const first  = this.inputs[0]
    this._selected = fantom?.name || first?.name || null
    if (this._selected) console.log('Auto-selected MIDI device:', this._selected)
  }

  private msg(e: MIDIMessageEvent) {
    const port = e.target as MIDIInput
    if (this._selected && port.name !== this._selected) return

    const data = Array.from(e.data)
    if (data.length < 3) return
    const [s, n, v] = data
    const c = s & 0xf0

    if (c === 0x90 && v > 0)                        this.onCb?.(n, v)
    else if (c === 0x80 || (c === 0x90 && v === 0)) this.offCb?.(n, 0)
  }

  selectDevice(name: string) {
    this._selected    = name
    this._manualSelect = true
    console.log('Manually selected MIDI device:', name)
  }

  onNoteOn(cb: CB)           { this.onCb    = cb }
  onNoteOff(cb: CB)          { this.offCb   = cb }
  onStateChange(cb: StateCB) { this.stateCb = cb }

  get connected()  { return this.inputs.length > 0 }
  get selected()   { return this._selected }
  get deviceName() { return this._selected || this.inputs[0]?.name || null }
  get allDevices() { return this.inputs.map(i => i.name) }
}

export const MidiManager = new MM()
