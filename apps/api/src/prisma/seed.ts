import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── MIDI note map ─────────────────────────────────────────────
const N: Record<string, number> = {
  A0:21, B0:23,
  C1:24, D1:26, E1:28, F1:29, G1:31, A1:33, B1:35,
  C2:36, D2:38, E2:40, F2:41, G2:43, A2:45, B2:47,
  C3:48, D3:50, E3:52, F3:53, G3:55, A3:57, B3:59,
  Cs3:49, Ds3:51, Fs3:54, Gs3:56, As3:58,
  C4:60, D4:62, E4:64, F4:65, G4:67, A4:69, B4:71,
  Cs4:61, Ds4:63, Fs4:66, Gs4:68, As4:70,
  C5:72, D5:74, E5:76, F5:77, G5:79, A5:81, B5:83,
  Cs5:73, Ds5:75, Fs5:78, Gs5:80, As5:82,
  C6:84, D6:86, E6:88, F6:89, G6:91, A6:93, B6:95,
  Cs6:85, Ds6:87, Fs6:90, Gs6:92, As6:94,
  C7:96, D7:98, E7:100,
}

const midiName = (m: number) => {
  if (m === 0) return '—'
  const n = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return `${n[m % 12]}${Math.floor(m / 12) - 1}`
}

function seq(pairs: [number, number][], dur = 1) {
  return pairs.map(([note, beat]) => ({
    note, beat, duration: dur,
    label: midiName(note),
    isRest: note === 0,
  }))
}

// ── Build a scale sequence ─────────────────────────────────────
// intervals: array of semitone steps e.g. [2,2,1,2,2,2,1] for major
function buildScale(root: number, intervals: number[]): number[] {
  const notes = [root]
  let cur = root
  for (const step of intervals) {
    cur += step
    notes.push(cur)
  }
  return notes
}

// ── Scale patterns ─────────────────────────────────────────────
const MAJOR        = [2,2,1,2,2,2,1]
const NATURAL_MIN  = [2,1,2,2,1,2,2]
const HARMONIC_MIN = [2,1,2,2,1,3,1]
const MELODIC_MIN  = [2,1,2,2,2,2,1]  // ascending (descending = natural)

// Modes (starting from their root)
const DORIAN     = [2,1,2,2,2,1,2]
const PHRYGIAN   = [1,2,2,2,1,2,2]
const LYDIAN     = [2,2,2,1,2,2,1]
const MIXOLYDIAN = [2,2,1,2,2,1,2]
const LOCRIAN    = [1,2,2,1,2,2,2]

// ── All 12 roots (starting MIDI notes) ────────────────────────
const ROOTS_3OCT: Record<string, number> = {
  C: N.C3, G: N.G3, D: N.D3, A: N.A3, E: N.E3, B: N.B3,
  'F#': N.Fs3, Db: N.Cs3, Ab: N.Gs3, Eb: N.Ds3, Bb: N.As3, F: N.F3,
}

// ── Build all-scales sequence ──────────────────────────────────
function allScalesSeq(intervals: number[], octaveStart = 3): any[] {
  const keys = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F']
  const rootMidi = keys.map(k => ROOTS_3OCT[k])
  const notes: any[] = []
  let beat = 1

  keys.forEach((key, ki) => {
    const root  = rootMidi[ki]
    const scale = buildScale(root, intervals)

    // Up
    scale.forEach(note => {
      notes.push({ note, beat, duration: 1, label: midiName(note), isRest: false })
      beat++
    })
    // Down (exclude top note already played)
    ;[...scale].reverse().slice(1).forEach(note => {
      notes.push({ note, beat, duration: 1, label: midiName(note), isRest: false })
      beat++
    })

    // Rest between keys
    notes.push({ note: 0, beat, duration: 1, label: '—', isRest: true })
    beat++
  })

  return notes
}

// ── Build arpeggio sequence ────────────────────────────────────
// type: 'major' | 'minor' | 'dom7' | 'maj7' | 'min7' | 'dim7'
function arpeggioNotes(root: number, type: string): number[] {
  switch (type) {
    case 'major':  return [root, root+4, root+7, root+12, root+7, root+4, root]
    case 'minor':  return [root, root+3, root+7, root+12, root+7, root+3, root]
    case 'dom7':   return [root, root+4, root+7, root+10, root+7, root+4, root]
    case 'maj7':   return [root, root+4, root+7, root+11, root+7, root+4, root]
    case 'min7':   return [root, root+3, root+7, root+10, root+7, root+3, root]
    case 'dim7':   return [root, root+3, root+6, root+9,  root+6, root+3, root]
    case 'aug':    return [root, root+4, root+8, root+12, root+8, root+4, root]
    default:       return [root, root+4, root+7, root+12]
  }
}

function allArpeggiosSeq(type: string): any[] {
  const keys  = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F']
  const notes: any[] = []
  let beat = 1

  keys.forEach((key, ki) => {
    const root  = ROOTS_3OCT[key]
    const arps  = arpeggioNotes(root, type)
    arps.forEach(note => {
      notes.push({ note, beat, duration: 0.5, label: midiName(note), isRest: false })
      beat += 0.5
    })
    notes.push({ note: 0, beat, duration: 1, label: '—', isRest: true })
    beat++
  })

  return notes
}

// ── Build chord progression ────────────────────────────────────
// Returns broken chords in sequence
// inversion: 0=root, 1=first, 2=second
function chordNotes(root: number, quality: string, inversion = 0): number[] {
  let notes: number[]
  switch (quality) {
    case 'major': notes = [root, root+4, root+7]; break
    case 'minor': notes = [root, root+3, root+7]; break
    case 'dom7':  notes = [root, root+4, root+7, root+10]; break
    case 'maj7':  notes = [root, root+4, root+7, root+11]; break
    case 'min7':  notes = [root, root+3, root+7, root+10]; break
    case 'dim':   notes = [root, root+3, root+6]; break
    case 'aug':   notes = [root, root+4, root+8]; break
    default:      notes = [root, root+4, root+7]
  }

  // Apply inversion by shifting bottom notes up an octave
  for (let i = 0; i < inversion; i++) {
    notes[i] += 12
  }
  return notes.sort((a, b) => a - b)
}

// I-IV-V-I progression in all keys, broken chords
function chordProgressionSeq(inversion = 0): any[] {
  // Degrees for major: I=0, IV=5, V=7
  const keys  = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F']
  const steps = [0, 5, 7, 0]  // I-IV-V-I
  const labels = ['I','IV','V','I']
  const notes: any[] = []
  let beat = 1

  keys.forEach((key, ki) => {
    const tonic = ROOTS_3OCT[key]
    steps.forEach((step, si) => {
      const root       = tonic + step
      const chordTones = chordNotes(root, 'major', inversion)

      // Play chord as broken arpeggio
      chordTones.forEach((note, ni) => {
        notes.push({
          note,
          beat,
          duration: 0.5,
          label:    `${labels[si]}${inversion > 0 ? ` inv${inversion}` : ''}: ${midiName(note)}`,
          isRest:   false,
        })
        beat += 0.5
      })
      beat += 0.5  // small gap between chords
    })

    // Rest between keys
    notes.push({ note: 0, beat, duration: 1, label: '—', isRest: true })
    beat++
  })

  return notes
}

// ── ii-V-I progression (jazz) ──────────────────────────────────
function jazzProgressionSeq(inversion = 0): any[] {
  const keys  = ['C','G','D','A','E','F','Bb','Eb']
  const notes: any[] = []
  let beat = 1

  keys.forEach(key => {
    const tonic   = ROOTS_3OCT[key]
    // ii-V-I: minor7 on 2, dom7 on 5, maj7 on root
    const chords = [
      { root: tonic + 2, quality: 'min7',  label: 'ii7' },
      { root: tonic + 7, quality: 'dom7',  label: 'V7'  },
      { root: tonic,     quality: 'maj7',  label: 'Imaj7' },
    ]

    chords.forEach(ch => {
      const tones = chordNotes(ch.root, ch.quality, inversion)
      tones.forEach(note => {
        notes.push({
          note, beat, duration: 0.5,
          label: `${ch.label}: ${midiName(note)}`,
          isRest: false,
        })
        beat += 0.5
      })
      beat += 0.5
    })

    notes.push({ note: 0, beat, duration: 1, label: '—', isRest: true })
    beat++
  })

  return notes
}

// ═══════════════════════════════════════════════════════════════
//  LESSON DEFINITIONS
// ═══════════════════════════════════════════════════════════════
const pianoLessons = [

  // ── GRADE 1: Foundation ──────────────────────────────────────
  {
    slug:'p-g1-1', order:1, instrument:'piano', grade:1,
    name:'Grade 1 — Middle C Position',
    description:'Five finger exercise on C D E F G. Foundation of all piano playing.',
    difficulty:'easy', bpm:60, xpReward:50, requiredPlan:'FREE',
    notes: seq([[N.C4,1],[N.D4,2],[N.E4,3],[N.F4,4],[N.G4,5],[N.F4,6],[N.E4,7],[N.D4,8],[N.C4,9]]),
  },
  {
    slug:'p-g1-2', order:2, instrument:'piano', grade:1,
    name:'Grade 1 — C Major Scale',
    description:'C major scale one octave up and down.',
    difficulty:'easy', bpm:66, xpReward:75, requiredPlan:'FREE',
    notes: seq([[N.C4,1],[N.D4,2],[N.E4,3],[N.F4,4],[N.G4,5],[N.A4,6],[N.B4,7],[N.C5,8],[N.B4,9],[N.A4,10],[N.G4,11],[N.F4,12],[N.E4,13],[N.D4,14],[N.C4,15]]),
  },
  {
    slug:'p-g1-3', order:3, instrument:'piano', grade:1,
    name:'Grade 1 — G Major Scale',
    description:'G major scale with F#. One octave.',
    difficulty:'easy', bpm:66, xpReward:75, requiredPlan:'FREE',
    notes: seq([[N.G3,1],[N.A3,2],[N.B3,3],[N.C4,4],[N.D4,5],[N.E4,6],[N.Fs4,7],[N.G4,8],[N.Fs4,9],[N.E4,10],[N.D4,11],[N.C4,12],[N.B3,13],[N.A3,14],[N.G3,15]]),
  },
  {
    slug:'p-g1-4', order:4, instrument:'piano', grade:1,
    name:'Grade 1 — A Natural Minor Scale',
    description:'A natural minor scale. Relative minor of C major.',
    difficulty:'easy', bpm:66, xpReward:75, requiredPlan:'FREE',
    notes: seq([[N.A3,1],[N.B3,2],[N.C4,3],[N.D4,4],[N.E4,5],[N.F4,6],[N.G4,7],[N.A4,8],[N.G4,9],[N.F4,10],[N.E4,11],[N.D4,12],[N.C4,13],[N.B3,14],[N.A3,15]]),
  },
  {
    slug:'p-g1-5', order:5, instrument:'piano', grade:1,
    name:'Grade 1 — C Major Arpeggio',
    description:'C-E-G arpeggio ascending and descending.',
    difficulty:'easy', bpm:72, xpReward:100, requiredPlan:'FREE',
    notes: seq([[N.C4,1],[N.E4,2],[N.G4,3],[N.C5,4],[N.G4,5],[N.E4,6],[N.C4,7]]),
  },
  {
    slug:'p-g1-6', order:6, instrument:'piano', grade:1,
    name:'Grade 1 — Melody in C',
    description:'Simple melody using C major notes at steady Andante tempo.',
    difficulty:'easy', bpm:76, xpReward:100, requiredPlan:'FREE',
    notes: seq([[N.E4,1],[N.G4,2],[N.A4,3],[N.G4,4],[N.E4,5],[N.C4,6],[N.D4,7],[N.E4,8],[N.F4,9],[N.E4,10],[N.D4,11],[N.C4,12]]),
  },

  // ── GRADE 2: Scales ───────────────────────────────────────────
  {
    slug:'p-g2-major', order:7, instrument:'piano', grade:2,
    name:'Grade 2 — All 12 Major Scales',
    description:'All 12 major scales in circle of fifths order. C G D A E B F# Db Ab Eb Bb F.',
    difficulty:'medium', bpm:72, xpReward:200, requiredPlan:'BASIC',
    notes: allScalesSeq(MAJOR),
  },
  {
    slug:'p-g2-natmin', order:8, instrument:'piano', grade:2,
    name:'Grade 2 — All 12 Natural Minor Scales',
    description:'All 12 natural minor scales. W-H-W-W-H-W-W pattern.',
    difficulty:'medium', bpm:72, xpReward:200, requiredPlan:'BASIC',
    notes: allScalesSeq(NATURAL_MIN),
  },
  {
    slug:'p-g2-harmin', order:9, instrument:'piano', grade:2,
    name:'Grade 2 — All 12 Harmonic Minor Scales',
    description:'Harmonic minor — raised 7th creates leading tone. W-H-W-W-H-Aug2-H.',
    difficulty:'medium', bpm:70, xpReward:225, requiredPlan:'BASIC',
    notes: allScalesSeq(HARMONIC_MIN),
  },
  {
    slug:'p-g2-melmin', order:10, instrument:'piano', grade:2,
    name:'Grade 2 — All 12 Melodic Minor Scales',
    description:'Melodic minor ascending — raised 6th and 7th. Classical and jazz foundation.',
    difficulty:'medium', bpm:70, xpReward:225, requiredPlan:'BASIC',
    notes: allScalesSeq(MELODIC_MIN),
  },

  // ── GRADE 3: Modes ────────────────────────────────────────────
  {
    slug:'p-g3-dorian', order:11, instrument:'piano', grade:3,
    name:'Grade 3 — Dorian Mode (All Keys)',
    description:'Dorian mode — minor with raised 6th. D Dorian = D E F G A B C D. Used in jazz and folk.',
    difficulty:'medium', bpm:76, xpReward:250, requiredPlan:'BASIC',
    notes: allScalesSeq(DORIAN),
  },
  {
    slug:'p-g3-phrygian', order:12, instrument:'piano', grade:3,
    name:'Grade 3 — Phrygian Mode (All Keys)',
    description:'Phrygian mode — minor with b2. Flamenco and metal flavour. E F G A B C D E.',
    difficulty:'medium', bpm:76, xpReward:250, requiredPlan:'BASIC',
    notes: allScalesSeq(PHRYGIAN),
  },
  {
    slug:'p-g3-lydian', order:13, instrument:'piano', grade:3,
    name:'Grade 3 — Lydian Mode (All Keys)',
    description:'Lydian mode — major with #4. Dreamy and bright sound. F G A B C D E F.',
    difficulty:'medium', bpm:76, xpReward:250, requiredPlan:'BASIC',
    notes: allScalesSeq(LYDIAN),
  },
  {
    slug:'p-g3-mixolydian', order:14, instrument:'piano', grade:3,
    name:'Grade 3 — Mixolydian Mode (All Keys)',
    description:'Mixolydian — major with b7. Blues and rock foundation. G A B C D E F G.',
    difficulty:'medium', bpm:80, xpReward:250, requiredPlan:'BASIC',
    notes: allScalesSeq(MIXOLYDIAN),
  },
  {
    slug:'p-g3-locrian', order:15, instrument:'piano', grade:3,
    name:'Grade 3 — Locrian Mode (All Keys)',
    description:'Locrian — diminished feel with b2 b5. B C D E F G A B. Most dissonant mode.',
    difficulty:'hard', bpm:72, xpReward:300, requiredPlan:'BASIC',
    notes: allScalesSeq(LOCRIAN),
  },

  // ── GRADE 4: Arpeggios ────────────────────────────────────────
  {
    slug:'p-g4-arp-major', order:16, instrument:'piano', grade:4,
    name:'Grade 4 — Major Arpeggios (All Keys)',
    description:'Major arpeggios — root, major 3rd, perfect 5th, octave. All 12 keys.',
    difficulty:'hard', bpm:80, xpReward:300, requiredPlan:'PRO',
    notes: allArpeggiosSeq('major'),
  },
  {
    slug:'p-g4-arp-minor', order:17, instrument:'piano', grade:4,
    name:'Grade 4 — Minor Arpeggios (All Keys)',
    description:'Minor arpeggios — root, minor 3rd, perfect 5th. All 12 keys.',
    difficulty:'hard', bpm:80, xpReward:300, requiredPlan:'PRO',
    notes: allArpeggiosSeq('minor'),
  },
  {
    slug:'p-g4-arp-dom7', order:18, instrument:'piano', grade:4,
    name:'Grade 4 — Dominant 7th Arpeggios',
    description:'Dominant 7th arpeggios — root M3 P5 b7. Essential for jazz and blues.',
    difficulty:'hard', bpm:76, xpReward:325, requiredPlan:'PRO',
    notes: allArpeggiosSeq('dom7'),
  },
  {
    slug:'p-g4-arp-maj7', order:19, instrument:'piano', grade:4,
    name:'Grade 4 — Major 7th Arpeggios',
    description:'Major 7th arpeggios — root M3 P5 M7. Lush jazz sound.',
    difficulty:'hard', bpm:76, xpReward:325, requiredPlan:'PRO',
    notes: allArpeggiosSeq('maj7'),
  },
  {
    slug:'p-g4-arp-min7', order:20, instrument:'piano', grade:4,
    name:'Grade 4 — Minor 7th Arpeggios',
    description:'Minor 7th arpeggios — root m3 P5 m7. Smooth jazz and soul.',
    difficulty:'hard', bpm:76, xpReward:325, requiredPlan:'PRO',
    notes: allArpeggiosSeq('min7'),
  },
  {
    slug:'p-g4-arp-dim7', order:21, instrument:'piano', grade:4,
    name:'Grade 4 — Diminished 7th Arpeggios',
    description:'Diminished 7th — root m3 d5 d7. Tension and drama. Symmetrical pattern.',
    difficulty:'hard', bpm:72, xpReward:350, requiredPlan:'PRO',
    notes: allArpeggiosSeq('dim7'),
  },
  {
    slug:'p-g4-arp-aug', order:22, instrument:'piano', grade:4,
    name:'Grade 4 — Augmented Arpeggios',
    description:'Augmented triads — root M3 A5. Mysterious and unstable sound.',
    difficulty:'hard', bpm:72, xpReward:350, requiredPlan:'PRO',
    notes: allArpeggiosSeq('aug'),
  },

  // ── GRADE 5: Chord Progressions ───────────────────────────────
  {
    slug:'p-g5-chord-root', order:23, instrument:'piano', grade:5,
    name:'Grade 5 — I-IV-V-I Root Position (All Keys)',
    description:'Classic I-IV-V-I chord progression in root position. All 12 keys. Broken chords.',
    difficulty:'hard', bpm:72, xpReward:400, requiredPlan:'PRO',
    notes: chordProgressionSeq(0),
  },
  {
    slug:'p-g5-chord-inv1', order:24, instrument:'piano', grade:5,
    name:'Grade 5 — I-IV-V-I First Inversion (All Keys)',
    description:'I-IV-V-I in first inversion — third in the bass. Smoother voice leading.',
    difficulty:'hard', bpm:70, xpReward:425, requiredPlan:'PRO',
    notes: chordProgressionSeq(1),
  },
  {
    slug:'p-g5-chord-inv2', order:25, instrument:'piano', grade:5,
    name:'Grade 5 — I-IV-V-I Second Inversion (All Keys)',
    description:'I-IV-V-I in second inversion — fifth in the bass. Creates tension and resolution.',
    difficulty:'hard', bpm:68, xpReward:450, requiredPlan:'PRO',
    notes: chordProgressionSeq(2),
  },
  {
    slug:'p-g5-iivi-root', order:26, instrument:'piano', grade:5,
    name:'Grade 5 — ii-V-I Jazz Progression Root Position',
    description:'Jazz ii-V-I with 7th chords in root position. C G D A E F Bb Eb. Core jazz harmony.',
    difficulty:'expert', bpm:72, xpReward:500, requiredPlan:'PRO',
    notes: jazzProgressionSeq(0),
  },
  {
    slug:'p-g5-iivi-inv1', order:27, instrument:'piano', grade:5,
    name:'Grade 5 — ii-V-I Jazz First Inversion',
    description:'ii-V-I with 7th chords in first inversion. Professional voice leading.',
    difficulty:'expert', bpm:68, xpReward:550, requiredPlan:'PRO',
    notes: jazzProgressionSeq(1),
  },
]

// ── Guitar lessons (keep existing) ───────────────────────────
const guitarLessons = [
  { slug:'g-g1-1', order:1, instrument:'guitar', grade:1, name:'Grade 1 — Open String Exercise', description:'All 6 open strings played evenly.', difficulty:'easy', bpm:60, xpReward:50, requiredPlan:'FREE', notes: seq([[40,1],[45,2],[50,3],[55,4],[59,5],[64,6],[59,7],[55,8],[50,9],[45,10],[40,11]]) },
  { slug:'g-g1-2', order:2, instrument:'guitar', grade:1, name:'Grade 1 — E Minor Chord Melody', description:'Simple melody using first position notes on E minor.', difficulty:'easy', bpm:63, xpReward:75, requiredPlan:'FREE', notes: seq([[64,1],[62,2],[59,3],[57,4],[55,5],[57,6],[59,7],[60,8],[62,9],[64,10],[62,11],[59,12],[55,13]]) },
  { slug:'g-g1-3', order:3, instrument:'guitar', grade:1, name:'Grade 1 — C Major Position', description:'First position C major scale on guitar.', difficulty:'easy', bpm:66, xpReward:75, requiredPlan:'FREE', notes: seq([[48,1],[50,2],[52,3],[53,4],[55,5],[57,6],[59,7],[60,8],[59,9],[57,10],[55,11],[53,12],[52,13],[50,14],[48,15]]) },
  { slug:'g-g2-1', order:4, instrument:'guitar', grade:2, name:'Grade 2 — A Major Scale', description:'A major scale first position.', difficulty:'easy', bpm:72, xpReward:100, requiredPlan:'BASIC', notes: seq([[45,1],[47,2],[49,3],[50,4],[52,5],[54,6],[56,7],[57,8],[56,9],[54,10],[52,11],[50,12],[49,13],[47,14],[45,15]]) },
  { slug:'g-g2-2', order:5, instrument:'guitar', grade:2, name:'Grade 2 — E Minor Pentatonic', description:'E minor pentatonic box pattern.', difficulty:'easy', bpm:76, xpReward:100, requiredPlan:'BASIC', notes: seq([[40,1],[43,2],[45,3],[47,4],[50,5],[52,6],[50,7],[47,8],[45,9],[43,10],[40,11]]) },
  { slug:'g-g3-1', order:6, instrument:'guitar', grade:3, name:'Grade 3 — Blues Scale', description:'E blues scale with b5 blue note.', difficulty:'medium', bpm:80, xpReward:175, requiredPlan:'BASIC', notes: seq([[40,1],[43,2],[45,3],[46,4],[47,5],[50,6],[52,7],[50,8],[47,9],[46,10],[45,11],[43,12],[40,13]]) },
  { slug:'g-g3-2', order:7, instrument:'guitar', grade:3, name:'Grade 3 — Smoke on the Water', description:'Classic Deep Purple riff.', difficulty:'medium', bpm:90, xpReward:200, requiredPlan:'BASIC', notes: seq([[50,1],[53,2],[55,3],[50,5],[53,6],[56,7],[55,8],[50,10],[53,11],[55,12],[53,14],[50,16]]) },
  { slug:'g-g4-1', order:8, instrument:'guitar', grade:4, name:'Grade 4 — B Minor Scale', description:'B minor scale in third position.', difficulty:'hard', bpm:88, xpReward:250, requiredPlan:'PRO', notes: seq([[47,1],[49,2],[50,3],[52,4],[54,5],[55,6],[57,7],[59,8],[57,9],[55,10],[54,11],[52,12],[50,13],[49,14],[47,15]]) },
  { slug:'g-g5-1', order:9, instrument:'guitar', grade:5, name:'Grade 5 — Full Pentatonic Positions', description:'All 5 pentatonic positions connected.', difficulty:'hard', bpm:96, xpReward:350, requiredPlan:'PRO', notes: seq([[40,1],[43,2],[45,3],[47,4],[50,5],[52,6],[55,7],[57,8],[59,9],[62,10],[64,11],[67,12],[64,13],[62,14],[59,15],[57,16],[55,17],[52,18],[50,19],[47,20],[45,21],[43,22],[40,23]]) },
]

// ── Drum lessons (keep existing) ──────────────────────────────
const D: Record<string, number> = {
  KICK:36, SNARE:38, HIHAT:42, OHAT:46,
  TOM_HI:50, TOM_MD:47, TOM_LO:45, CRASH:49, RIDE:51, RIMSHOT:37,
}

const DRUM_NAMES: Record<number, string> = {
  36:'KICK',38:'SNARE',42:'HH',46:'OHH',50:'T.HI',47:'T.MD',45:'T.LO',49:'CRSH',51:'RIDE',37:'RIM'
}

function drumSeq(pairs: [number, number][]) {
  return pairs.map(([note, beat]) => ({
    note, beat, duration: 0.5,
    label: DRUM_NAMES[note] || String(note),
    isRest: note === 0,
  }))
}

const drumLessons = [
  { slug:'d-g1-1', order:1, instrument:'drums', grade:1, name:'Grade 1 — Single Stroke Roll', description:'Alternating single strokes R-L-R-L on snare.', difficulty:'easy', bpm:60, xpReward:50, requiredPlan:'FREE', notes: drumSeq([[D.SNARE,1],[D.SNARE,1.5],[D.SNARE,2],[D.SNARE,2.5],[D.SNARE,3],[D.SNARE,3.5],[D.SNARE,4],[D.SNARE,4.5]]) },
  { slug:'d-g1-2', order:2, instrument:'drums', grade:1, name:'Grade 1 — Kick on Beats', description:'Bass drum on every beat.', difficulty:'easy', bpm:63, xpReward:50, requiredPlan:'FREE', notes: drumSeq([[D.KICK,1],[D.KICK,2],[D.KICK,3],[D.KICK,4],[D.KICK,5],[D.KICK,6],[D.KICK,7],[D.KICK,8]]) },
  { slug:'d-g1-3', order:3, instrument:'drums', grade:1, name:'Grade 1 — Snare on 2 and 4', description:'Snare backbeat on beats 2 and 4.', difficulty:'easy', bpm:66, xpReward:75, requiredPlan:'FREE', notes: drumSeq([[D.KICK,1],[D.SNARE,2],[D.KICK,3],[D.SNARE,4],[D.KICK,5],[D.SNARE,6],[D.KICK,7],[D.SNARE,8]]) },
  { slug:'d-g1-4', order:4, instrument:'drums', grade:1, name:'Grade 1 — Hi-Hat Quarter Notes', description:'Hi-hat on every beat with kick and snare.', difficulty:'easy', bpm:70, xpReward:75, requiredPlan:'FREE', notes: drumSeq([[D.HIHAT,1],[D.KICK,1],[D.HIHAT,2],[D.SNARE,2],[D.HIHAT,3],[D.KICK,3],[D.HIHAT,4],[D.SNARE,4],[D.HIHAT,5],[D.KICK,5],[D.HIHAT,6],[D.SNARE,6],[D.HIHAT,7],[D.KICK,7],[D.HIHAT,8],[D.SNARE,8]]) },
  { slug:'d-g1-5', order:5, instrument:'drums', grade:1, name:'Grade 1 — Basic Rock Beat', description:'Hi-hat 8th notes with kick on 1 and 3, snare on 2 and 4.', difficulty:'easy', bpm:72, xpReward:100, requiredPlan:'FREE', notes: drumSeq([[D.HIHAT,1],[D.KICK,1],[D.HIHAT,1.5],[D.HIHAT,2],[D.SNARE,2],[D.HIHAT,2.5],[D.HIHAT,3],[D.KICK,3],[D.HIHAT,3.5],[D.HIHAT,4],[D.SNARE,4],[D.HIHAT,4.5],[D.HIHAT,5],[D.KICK,5],[D.HIHAT,5.5],[D.HIHAT,6],[D.SNARE,6],[D.HIHAT,6.5],[D.HIHAT,7],[D.KICK,7],[D.HIHAT,7.5],[D.HIHAT,8],[D.SNARE,8]]) },
  { slug:'d-g2-1', order:6, instrument:'drums', grade:2, name:'Grade 2 — Double Stroke Roll', description:'R-R-L-L double strokes on snare.', difficulty:'easy', bpm:72, xpReward:100, requiredPlan:'BASIC', notes: drumSeq([[D.SNARE,1],[D.SNARE,1.25],[D.SNARE,1.5],[D.SNARE,1.75],[D.SNARE,2],[D.SNARE,2.25],[D.SNARE,2.5],[D.SNARE,2.75],[D.SNARE,3],[D.SNARE,3.25],[D.SNARE,3.5],[D.SNARE,3.75],[D.SNARE,4],[D.SNARE,4.25],[D.SNARE,4.5],[D.SNARE,4.75]]) },
  { slug:'d-g2-2', order:7, instrument:'drums', grade:2, name:'Grade 2 — Paradiddle', description:'R-L-R-R L-R-L-L paradiddle.', difficulty:'medium', bpm:76, xpReward:125, requiredPlan:'BASIC', notes: drumSeq([[D.SNARE,1],[D.SNARE,1.5],[D.SNARE,2],[D.SNARE,2.25],[D.SNARE,2.5],[D.SNARE,3],[D.SNARE,3.5],[D.SNARE,3.75],[D.SNARE,4],[D.SNARE,4.5],[D.SNARE,5],[D.SNARE,5.25],[D.SNARE,5.5],[D.SNARE,6],[D.SNARE,6.5],[D.SNARE,6.75]]) },
  { slug:'d-g3-1', order:8, instrument:'drums', grade:3, name:'Grade 3 — Funk Groove', description:'Syncopated funk beat with ghost notes.', difficulty:'medium', bpm:88, xpReward:200, requiredPlan:'BASIC', notes: drumSeq([[D.KICK,1],[D.HIHAT,1],[D.HIHAT,1.5],[D.SNARE,2],[D.KICK,2.5],[D.HIHAT,3],[D.OHAT,3.5],[D.SNARE,4],[D.KICK,4.5],[D.HIHAT,5],[D.KICK,5],[D.HIHAT,5.5],[D.SNARE,6],[D.KICK,6.5],[D.HIHAT,7],[D.OHAT,7.5],[D.SNARE,8],[D.CRASH,8]]) },
  { slug:'d-g4-1', order:9, instrument:'drums', grade:4, name:'Grade 4 — Double Bass Pattern', description:'Double kick drum pattern for independence.', difficulty:'hard', bpm:90, xpReward:250, requiredPlan:'PRO', notes: drumSeq([[D.KICK,1],[D.KICK,1.5],[D.SNARE,2],[D.KICK,2.5],[D.KICK,3],[D.SNARE,4],[D.KICK,4.5],[D.KICK,5],[D.SNARE,6],[D.KICK,6.5],[D.KICK,7],[D.SNARE,8]]) },
  { slug:'d-g5-1', order:10, instrument:'drums', grade:5, name:'Grade 5 — Blast Beat', description:'High-speed alternating kick and snare.', difficulty:'expert', bpm:160, xpReward:500, requiredPlan:'PRO', notes: drumSeq([[D.KICK,1],[D.SNARE,1.5],[D.KICK,2],[D.SNARE,2.5],[D.KICK,3],[D.SNARE,3.5],[D.KICK,4],[D.SNARE,4.5],[D.KICK,5],[D.SNARE,5.5],[D.KICK,6],[D.SNARE,6.5],[D.KICK,7],[D.SNARE,7.5],[D.KICK,8],[D.CRASH,8]]) },
]

// ═══════════════════════════════════════════════════════════════
//  SEED
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 Seeding lessons...\n')

  const all = [...pianoLessons, ...guitarLessons, ...drumLessons]

  for (const lesson of all) {
    await prisma.lesson.upsert({
      where:  { slug: lesson.slug },
      update: {
        name: lesson.name, description: lesson.description,
        difficulty: lesson.difficulty, bpm: lesson.bpm,
        xpReward: lesson.xpReward, notes: lesson.notes as any,
        grade: lesson.grade, requiredPlan: lesson.requiredPlan,
      },
      create: lesson as any,
    })
    console.log(`  ✓ [${lesson.instrument.padEnd(6)}] ${lesson.name}`)
  }

  console.log(`\n✅ Seeded ${all.length} lessons`)
  console.log(`   🎹 Piano:  ${pianoLessons.length} lessons`)
  console.log(`   🎸 Guitar: ${guitarLessons.length} lessons`)
  console.log(`   🥁 Drums:  ${drumLessons.length} lessons`)
  console.log(`\n🎹 Piano lesson breakdown:`)
  console.log(`   Grade 1: Foundation (6 lessons)`)
  console.log(`   Grade 2: All 12 Major + Natural/Harmonic/Melodic Minor`)
  console.log(`   Grade 3: All 5 Modes (Dorian/Phrygian/Lydian/Mixolydian/Locrian)`)
  console.log(`   Grade 4: All arpeggios (Major/Minor/Dom7/Maj7/Min7/Dim7/Aug)`)
  console.log(`   Grade 5: I-IV-V-I and ii-V-I chord progressions (root + inversions)`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
