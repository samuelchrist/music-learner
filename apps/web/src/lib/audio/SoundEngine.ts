import * as Tone from 'tone'

// ═══════════════════════════════════════════════════════════════
//  SOUND ENGINE
//  Piano → Salamander Grand Piano (real Yamaha C5 samples)
//  Drums → Real acoustic drum kit samples
// ═══════════════════════════════════════════════════════════════

// ── State ──────────────────────────────────────────────────────
let pianoSampler: Tone.Sampler | null = null
let drumSampler:  Tone.Sampler | null = null

let pianoLoaded  = false
let pianoLoading = false
let drumsLoaded  = false
let drumsLoading = false

type LoadCb = (loaded: boolean) => void
const pianoCallbacks: LoadCb[] = []
const drumCallbacks:  LoadCb[] = []

export function onPianoLoaded(cb: LoadCb) {
  if (pianoLoaded) { cb(true); return }
  pianoCallbacks.push(cb)
}

export function onDrumsLoaded(cb: LoadCb) {
  if (drumsLoaded) { cb(true); return }
  drumCallbacks.push(cb)
}

// ── MIDI 60 = C4 ───────────────────────────────────────────────
function midiToNote(midi: number): string {
  return Tone.Frequency(midi, 'midi').toNote()
}

// ═══════════════════════════════════════════════════════════════
//  PIANO — Salamander Grand Piano
//  Real Yamaha C5 grand piano recorded at multiple velocities
// ═══════════════════════════════════════════════════════════════
export async function initPiano(): Promise<void> {
  if (pianoLoaded || pianoLoading) return
  pianoLoading = true

  await Tone.start()

  return new Promise(resolve => {
    pianoSampler = new Tone.Sampler({
      urls: {
        A0:   'A0.mp3',
        C1:   'C1.mp3',  'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', A1: 'A1.mp3',
        C2:   'C2.mp3',  'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', A2: 'A2.mp3',
        C3:   'C3.mp3',  'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', A3: 'A3.mp3',
        C4:   'C4.mp3',  'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', A4: 'A4.mp3',
        C5:   'C5.mp3',  'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', A5: 'A5.mp3',
        C6:   'C6.mp3',  'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', A6: 'A6.mp3',
        C7:   'C7.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        pianoLoaded  = true
        pianoLoading = false
        pianoCallbacks.forEach(cb => cb(true))
        console.log('🎹 Salamander Grand Piano loaded!')
        resolve()
      },
      onerror: err => {
        console.warn('Piano samples failed:', err)
        pianoLoading = false
        resolve()
      },
      release: 1.5,
    })
    .toDestination()
  })
}

// ═══════════════════════════════════════════════════════════════
//  DRUMS — Real acoustic drum kit samples
//  Source: Tone.js drum machine samples (free, CDN hosted)
//
//  MIDI mapping:
//  36 = Kick   38 = Snare  42 = HH closed  46 = HH open
//  50 = Hi Tom 47 = Mid Tom 45 = Lo Tom
//  49 = Crash  51 = Ride   37 = Rimshot
// ═══════════════════════════════════════════════════════════════
export async function initDrums(): Promise<void> {
  if (drumsLoaded || drumsLoading) return
  drumsLoading = true

  await Tone.start()

  return new Promise(resolve => {
    // Map MIDI note numbers to sample files
    // Using Tone.js drum machine samples
    drumSampler = new Tone.Sampler({
      urls: {
        // We map each drum MIDI note to a "note" in the sampler
        // C1 = Kick, D1 = Snare, E1 = HH closed, etc.
        C1:  'bd.mp3',   // Kick (Bass Drum)
        D1:  'sd.mp3',   // Snare
        E1:  'hh.mp3',   // Hi-Hat closed
        F1:  'oh.mp3',   // Hi-Hat open
        G1:  'ht.mp3',   // Hi Tom
        A1:  'mt.mp3',   // Mid Tom
        B1:  'lt.mp3',   // Lo Tom
        C2:  'cy.mp3',   // Crash cymbal
        D2:  'rd.mp3',   // Ride cymbal
        E2:  'sd.mp3',   // Rimshot (use snare sample)
      },
      baseUrl: 'https://tonejs.github.io/audio/drum-machine/',
      onload: () => {
        drumsLoaded  = true
        drumsLoading = false
        drumCallbacks.forEach(cb => cb(true))
        console.log('🥁 Acoustic drum samples loaded!')
        resolve()
      },
      onerror: err => {
        console.warn('Drum samples failed, using synthesis:', err)
        drumsLoading = false
        resolve()
        // Fall back to synthesis
        initDrumSynths()
      },
    })
    .toDestination()
  })
}

// ── MIDI number → sampler note ──────────────────────────────────
// Each drum MIDI number maps to a note that has a sample loaded
const DRUM_TO_SAMPLER_NOTE: Record<number, string> = {
  36: 'C1',   // Kick
  38: 'D1',   // Snare
  42: 'E1',   // Hi-Hat closed
  46: 'F1',   // Hi-Hat open
  50: 'G1',   // Hi Tom
  47: 'A1',   // Mid Tom
  45: 'B1',   // Lo Tom
  49: 'C2',   // Crash
  51: 'D2',   // Ride
  37: 'E2',   // Rimshot
}

// ── Synthesis fallback drums ────────────────────────────────────
let kickFallback:   Tone.MembraneSynth | null = null
let snareFallback:  Tone.NoiseSynth    | null = null
let hihatFallback:  Tone.MetalSynth    | null = null
let tomFallback:    Tone.MembraneSynth | null = null
let synthFallbackReady = false

function initDrumSynths() {
  if (synthFallbackReady) return

  kickFallback = new Tone.MembraneSynth({
    pitchDecay: 0.08, octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 },
    volume: 6,
  }).toDestination()

  snareFallback = new Tone.NoiseSynth({
    noise:    { type: 'white' },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.05 },
    volume:   -4,
  }).toDestination()

  hihatFallback = new Tone.MetalSynth({
    frequency: 400, harmonicity: 5.1, modulationIndex: 32,
    resonance: 4000, octaves: 1.5, volume: -10,
    envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
  }).toDestination()

  tomFallback = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 4,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    volume: 2,
  }).toDestination()

  synthFallbackReady = true
}

// ── Play piano note ─────────────────────────────────────────────
export function playPianoNote(
  midi:     number,
  duration  = '4n',
  velocity  = 0.8
): void {
  Tone.start()

  if (pianoLoaded && pianoSampler) {
    const note = midiToNote(midi)
    pianoSampler.triggerAttackRelease(note, duration, Tone.now(), velocity)
    return
  }

  // Synthesis fallback while piano loads
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope:   { attack: 0.02, decay: 0.1, sustain: 0.4, release: 1.0 },
    volume:     Tone.gainToDb(velocity * 0.4),
  }).toDestination()

  const note = midiToNote(midi)
  synth.triggerAttackRelease(note, duration)
  setTimeout(() => synth.dispose(), 4000)
}

// ── Attack only (for key hold) ──────────────────────────────────
export function attackPianoNote(midi: number, velocity = 0.8): void {
  Tone.start()
  if (pianoLoaded && pianoSampler) {
    const note = midiToNote(midi)
    pianoSampler.triggerAttack(note, Tone.now(), velocity)
  }
}

// ── Release piano note ──────────────────────────────────────────
export function releasePianoNote(midi: number): void {
  if (pianoLoaded && pianoSampler) {
    const note = midiToNote(midi)
    pianoSampler.triggerRelease(note, Tone.now())
  }
}

// ── Play drum hit ───────────────────────────────────────────────
export function playDrumHit(midi: number): void {
  Tone.start()
  const now = Tone.now()

  // Use real samples if loaded
  if (drumsLoaded && drumSampler) {
    const note = DRUM_TO_SAMPLER_NOTE[midi]
    if (note) {
      // Velocity and pitch adjustments per drum type
      const config: Record<number, { vel: number; pitch?: number }> = {
        36: { vel: 0.9           },  // Kick   — loud
        38: { vel: 0.75          },  // Snare
        42: { vel: 0.5           },  // HH closed — quieter
        46: { vel: 0.6           },  // HH open
        50: { vel: 0.7           },  // Hi Tom
        47: { vel: 0.7           },  // Mid Tom
        45: { vel: 0.75          },  // Lo Tom
        49: { vel: 0.8           },  // Crash
        51: { vel: 0.5           },  // Ride
        37: { vel: 0.6           },  // Rimshot
      }
      const { vel = 0.7 } = config[midi] || {}
      drumSampler.triggerAttackRelease(note, '8n', now, vel)
      return
    }
  }

  // Synthesis fallback
  if (!synthFallbackReady) initDrumSynths()

  switch (midi) {
    case 36:
      kickFallback?.triggerAttackRelease('C1', '8n', now)
      break
    case 38:
    case 37:
      snareFallback?.triggerAttackRelease('8n', now)
      break
    case 42:
      hihatFallback?.envelope.set({ decay: 0.05 })
      hihatFallback?.triggerAttackRelease('32n', now)
      break
    case 46:
      hihatFallback?.envelope.set({ decay: 0.4 })
      hihatFallback?.triggerAttackRelease('8n', now)
      break
    case 50:
      tomFallback?.triggerAttackRelease('G2', '8n', now)
      break
    case 47:
      tomFallback?.triggerAttackRelease('D2', '8n', now)
      break
    case 45:
      tomFallback?.triggerAttackRelease('A1', '8n', now)
      break
    case 49:
    case 51:
      hihatFallback?.envelope.set({ decay: 1.0 })
      hihatFallback?.triggerAttackRelease('4n', now)
      break
    default:
      tomFallback?.triggerAttackRelease('C2', '16n', now)
  }
}

// ── Preload all sounds ──────────────────────────────────────────
export async function preloadSounds(): Promise<void> {
  // Load both simultaneously
  await Promise.all([
    initPiano(),
    initDrums(),
  ])
}

// ── Status ─────────────────────────────────────────────────────
export function isPianoLoaded(): boolean { return pianoLoaded }
export function isDrumsLoaded(): boolean { return drumsLoaded }
