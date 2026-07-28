import * as Tone from 'tone'

// ═══════════════════════════════════════════════════════════════
//  SOUND ENGINE
//  Piano → Salamander Grand Piano (Tone.js CDN) ✅
//  Drums → Local acoustic samples in /sounds/drums/ ✅
// ═══════════════════════════════════════════════════════════════

let pianoSampler: Tone.Sampler  | null = null
let drumPlayers:  Tone.Players  | null = null

let pianoLoaded  = false
let pianoLoading = false
let drumsLoaded  = false
let drumsLoading = false

type CB = (ok: boolean) => void
const pianoCallbacks: CB[] = []
const drumCallbacks:  CB[] = []

export function onPianoLoaded(cb: CB) {
  if (pianoLoaded) { cb(true); return }
  pianoCallbacks.push(cb)
}
export function onDrumsLoaded(cb: CB) {
  if (drumsLoaded) { cb(true); return }
  drumCallbacks.push(cb)
}

function midiToNote(midi: number): string {
  return Tone.Frequency(midi, 'midi').toNote()
}

// ═══════════════════════════════════════════════════════════════
//  PIANO — Salamander Grand Piano
// ═══════════════════════════════════════════════════════════════
export async function initPiano(): Promise<void> {
  if (pianoLoaded || pianoLoading) return
  pianoLoading = true
  await Tone.start()

  return new Promise(resolve => {
    pianoSampler = new Tone.Sampler({
      urls: {
        A0:'A0.mp3',
        C1:'C1.mp3',  'D#1':'Ds1.mp3', 'F#1':'Fs1.mp3', A1:'A1.mp3',
        C2:'C2.mp3',  'D#2':'Ds2.mp3', 'F#2':'Fs2.mp3', A2:'A2.mp3',
        C3:'C3.mp3',  'D#3':'Ds3.mp3', 'F#3':'Fs3.mp3', A3:'A3.mp3',
        C4:'C4.mp3',  'D#4':'Ds4.mp3', 'F#4':'Fs4.mp3', A4:'A4.mp3',
        C5:'C5.mp3',  'D#5':'Ds5.mp3', 'F#5':'Fs5.mp3', A5:'A5.mp3',
        C6:'C6.mp3',  'D#6':'Ds6.mp3', 'F#6':'Fs6.mp3', A6:'A6.mp3',
        C7:'C7.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      release: 1.5,
      onload: () => {
        pianoLoaded  = true
        pianoLoading = false
        pianoCallbacks.forEach(cb => cb(true))
        console.log('🎹 Salamander Grand Piano loaded!')
        resolve()
      },
      onerror: () => { pianoLoading = false; resolve() },
    }).toDestination()
  })
}

// ═══════════════════════════════════════════════════════════════
//  DRUMS — Local acoustic samples
//  Files in: public/sounds/drums/
//  Download with: scripts/download-drums.sh
// ═══════════════════════════════════════════════════════════════

// Map MIDI note numbers to local sample files
const DRUM_MAP: Record<number, string> = {
  36: 'kick',      // Acoustic Bass Drum
  38: 'snare',     // Acoustic Snare
  37: 'snare',     // Side Stick / Rimshot → use snare
  42: 'hihat',     // Closed Hi-Hat
  46: 'openhat',   // Open Hi-Hat
  50: 'tom',       // Hi Tom
  47: 'tom',       // Mid Tom
  45: 'boom',      // Lo Tom → use boom (deeper)
  49: 'clap',      // Crash Cymbal → use clap
  51: 'ride',      // Ride Cymbal
  39: 'clap',      // Hand Clap
}

export async function initDrums(): Promise<void> {
  if (drumsLoaded || drumsLoading) return
  drumsLoading = true
  await Tone.start()

  // Build urls object from DRUM_MAP
  // Use unique sample names only
  const uniqueSamples = ['kick', 'snare', 'hihat', 'openhat', 'tom', 'boom', 'ride', 'clap']

  const urls: Record<string, string> = {}
  uniqueSamples.forEach(name => {
    urls[name] = `/sounds/drums/${name}.wav`
  })

  return new Promise(resolve => {
    try {
      drumPlayers = new Tone.Players(
        urls,
        () => {
          drumsLoaded  = true
          drumsLoading = false

          // Volume per drum
          const volumes: Record<string, number> = {
            kick:    4,
            snare:   2,
            hihat:  -6,
            openhat:-4,
            tom:     2,
            boom:    4,
            ride:   -4,
            clap:   -2,
          }
          Object.entries(volumes).forEach(([key, vol]) => {
            try { drumPlayers?.player(key)?.set({ volume: vol }) } catch {}
          })

          drumCallbacks.forEach(cb => cb(true))
          console.log('🥁 Local acoustic drum samples loaded!')
          resolve()
        }
      ).toDestination()
    } catch (e) {
      console.warn('Drum Players failed:', e)
      drumsLoading = false
      initDrumSynths()
      resolve()
    }

    // Fallback timeout if files not found
    setTimeout(() => {
      if (!drumsLoaded) {
        console.warn('⚠️ Drum samples not found in /sounds/drums/')
        console.warn('   Run: bash scripts/download-drums.sh')
        drumsLoading = false
        initDrumSynths()
        resolve()
      }
    }, 5000)
  })
}

// ═══════════════════════════════════════════════════════════════
//  SYNTHESIS FALLBACK (when local files not downloaded yet)
// ═══════════════════════════════════════════════════════════════
let kickSynth:  Tone.MembraneSynth | null = null
let snareSynth: Tone.NoiseSynth    | null = null
let hihatSynth: Tone.MetalSynth    | null = null
let tomSynth:   Tone.MembraneSynth | null = null
let synthReady  = false

function initDrumSynths() {
  if (synthReady) return
  kickSynth  = new Tone.MembraneSynth({ pitchDecay:0.08, octaves:6, oscillator:{type:'sine'}, envelope:{attack:.001,decay:.35,sustain:0,release:.1}, volume:6 }).toDestination()
  snareSynth = new Tone.NoiseSynth({ noise:{type:'white'}, envelope:{attack:.001,decay:.18,sustain:0,release:.05}, volume:-4 }).toDestination()
  hihatSynth = new Tone.MetalSynth({ frequency:400, harmonicity:5.1, modulationIndex:32, resonance:4000, octaves:1.5, volume:-10, envelope:{attack:.001,decay:.08,release:.01} }).toDestination()
  tomSynth   = new Tone.MembraneSynth({ pitchDecay:.05, octaves:4, envelope:{attack:.001,decay:.3,sustain:0,release:.1}, volume:2 }).toDestination()
  synthReady  = true
}

// ═══════════════════════════════════════════════════════════════
//  PLAY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
export function playPianoNote(midi: number, duration = '4n', velocity = 0.8): void {
  Tone.start()
  if (pianoLoaded && pianoSampler) {
    pianoSampler.triggerAttackRelease(midiToNote(midi), duration, Tone.now(), velocity)
    return
  }
  // Synthesis fallback
  const s = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope:   { attack: 0.02, decay: 0.1, sustain: 0.4, release: 1.0 },
    volume:     Tone.gainToDb(velocity * 0.4),
  }).toDestination()
  s.triggerAttackRelease(midiToNote(midi), duration)
  setTimeout(() => s.dispose(), 4000)
}

export function attackPianoNote(midi: number, velocity = 0.8): void {
  Tone.start()
  if (pianoLoaded && pianoSampler) {
    pianoSampler.triggerAttack(midiToNote(midi), Tone.now(), velocity)
  }
}

export function releasePianoNote(midi: number): void {
  if (pianoLoaded && pianoSampler) {
    pianoSampler.triggerRelease(midiToNote(midi), Tone.now())
  }
}

export function playDrumHit(midi: number): void {
  Tone.start()
  const now = Tone.now()

  // Use real samples if loaded
  if (drumsLoaded && drumPlayers) {
    const sampleName = DRUM_MAP[midi]
    if (sampleName) {
      try {
        const player = drumPlayers.player(sampleName)
        if (player) {
          // Stop any currently playing instance and restart
          player.stop(now)
          player.start(now)
          return
        }
      } catch (e) {
        // Fall through to synthesis
      }
    }
  }

  // Synthesis fallback
  if (!synthReady) initDrumSynths()

  switch (midi) {
    case 36: kickSynth?.triggerAttackRelease('C1', '8n', now); break
    case 38:
    case 37: snareSynth?.triggerAttackRelease('8n', now); break
    case 42: hihatSynth?.envelope.set({ decay: 0.05 }); hihatSynth?.triggerAttackRelease('32n', now); break
    case 46: hihatSynth?.envelope.set({ decay: 0.4  }); hihatSynth?.triggerAttackRelease('8n', now);  break
    case 50: tomSynth?.triggerAttackRelease('G2', '8n', now); break
    case 47: tomSynth?.triggerAttackRelease('D2', '8n', now); break
    case 45: tomSynth?.triggerAttackRelease('A1', '8n', now); break
    case 49: hihatSynth?.envelope.set({ decay: 1.2 }); hihatSynth?.triggerAttackRelease('4n', now); break
    case 51: hihatSynth?.envelope.set({ decay: 0.6 }); hihatSynth?.triggerAttackRelease('4n', now); break
    default: tomSynth?.triggerAttackRelease('C2', '16n', now)
  }
}

export async function preloadSounds(): Promise<void> {
  await Promise.all([initPiano(), initDrums()])
}

export function isPianoLoaded(): boolean { return pianoLoaded }
export function isDrumsLoaded(): boolean { return drumsLoaded }
