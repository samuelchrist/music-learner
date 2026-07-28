import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── MIDI Note Map ─────────────────────────────────────────────
const N: Record<string, number> = {
  // Octave 2
  A2:45, B2:47,
  // Octave 3
  C3:48, D3:50, E3:52, F3:53, G3:55, A3:57, B3:59,
  Cs3:49, Ds3:51, Fs3:54, Gs3:56, As3:58,
  // Octave 4
  C4:60, D4:62, E4:64, F4:65, G4:67, A4:69, B4:71,
  Cs4:61, Ds4:63, Fs4:66, Gs4:68, As4:70,
  // Octave 5
  C5:72, D5:74, E5:76, F5:77, G5:79, A5:81, B5:83,
  Cs5:73, Ds5:75, Fs5:78, Gs5:80, As5:82,
  // Octave 6
  C6:84,
}

// ── Drum Map ──────────────────────────────────────────────────
const D: Record<string, number> = {
  KICK:36, SNARE:38, HIHAT:42, OHAT:46,
  TOM_HI:50, TOM_MD:47, TOM_LO:45,
  CRASH:49, RIDE:51, RIMSHOT:37,
}

const DRUM_NAMES: Record<number, string> = {
  36:'KICK', 38:'SNARE', 42:'HH', 46:'OHH',
  50:'T.HI', 47:'T.MD', 45:'T.LO',
  49:'CRSH', 51:'RIDE', 37:'RIM',
}

// ── Helpers ───────────────────────────────────────────────────
const midiName = (m: number) => {
  if (m === 0) return '—'
  const n = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return `${n[m % 12]}${Math.floor(m / 12) - 1}`
}

function seq(pairs: [number, number, string?][], dur = 1) {
  return pairs.map(([note, beat, label]) => ({
    note, beat, duration: dur,
    label: label || midiName(note),
    isRest: note === 0,
  }))
}

function drumSeq(pairs: [number, number][]) {
  return pairs.map(([note, beat]) => ({
    note, beat, duration: 0.5,
    label: DRUM_NAMES[note] || String(note),
    isRest: note === 0,
  }))
}

// ═══════════════════════════════════════════════════════════════
// PIANO LESSONS — ABRSM Grade 1 to 5 Inspired
// ═══════════════════════════════════════════════════════════════
const pianoLessons = [

  // ── GRADE 1 ──────────────────────────────────────────────────
  {
    slug:'p-g1-1', order:1, instrument:'piano',
    name:'Grade 1 — Middle C Position',
    description:'Five finger exercise on C D E F G. Foundation of all piano playing.',
    difficulty:'easy', bpm:60, xpReward:50,
    notes: seq([
      [N.C4,1],[N.D4,2],[N.E4,3],[N.F4,4],[N.G4,5],
      [N.F4,6],[N.E4,7],[N.D4,8],[N.C4,9],
    ]),
  },
  {
    slug:'p-g1-2', order:2, instrument:'piano',
    name:'Grade 1 — C Major Scale',
    description:'C major scale one octave ascending and descending. ABRSM Grade 1 requirement.',
    difficulty:'easy', bpm:66, xpReward:75,
    notes: seq([
      [N.C4,1],[N.D4,2],[N.E4,3],[N.F4,4],
      [N.G4,5],[N.A4,6],[N.B4,7],[N.C5,8],
      [N.B4,9],[N.A4,10],[N.G4,11],[N.F4,12],
      [N.E4,13],[N.D4,14],[N.C4,15],
    ]),
  },
  {
    slug:'p-g1-3', order:3, instrument:'piano',
    name:'Grade 1 — G Major Scale',
    description:'G major scale with F# . One octave ascending and descending.',
    difficulty:'easy', bpm:66, xpReward:75,
    notes: seq([
      [N.G3,1],[N.A3,2],[N.B3,3],[N.C4,4],
      [N.D4,5],[N.E4,6],[N.Fs4,7],[N.G4,8],
      [N.Fs4,9],[N.E4,10],[N.D4,11],[N.C4,12],
      [N.B3,13],[N.A3,14],[N.G3,15],
    ]),
  },
  {
    slug:'p-g1-4', order:4, instrument:'piano',
    name:'Grade 1 — A Minor Scale (Natural)',
    description:'A natural minor scale. Relative minor of C major.',
    difficulty:'easy', bpm:66, xpReward:75,
    notes: seq([
      [N.A3,1],[N.B3,2],[N.C4,3],[N.D4,4],
      [N.E4,5],[N.F4,6],[N.G4,7],[N.A4,8],
      [N.G4,9],[N.F4,10],[N.E4,11],[N.D4,12],
      [N.C4,13],[N.B3,14],[N.A3,15],
    ]),
  },
  {
    slug:'p-g1-5', order:5, instrument:'piano',
    name:'Grade 1 — C Major Arpeggio',
    description:'Broken chord C-E-G ascending and descending. ABRSM Grade 1 arpeggio.',
    difficulty:'easy', bpm:72, xpReward:100,
    notes: seq([
      [N.C4,1],[N.E4,2],[N.G4,3],[N.C5,4],
      [N.G4,5],[N.E4,6],[N.C4,7],
      [N.C4,8],[N.E4,9],[N.G4,10],[N.C5,11],
      [N.G4,12],[N.E4,13],[N.C4,14],
    ]),
  },
  {
    slug:'p-g1-6', order:6, instrument:'piano',
    name:'Grade 1 — Melody in C (Andante)',
    description:'Simple melody using C major notes. Steady Andante tempo.',
    difficulty:'easy', bpm:76, xpReward:100,
    notes: seq([
      [N.E4,1],[N.G4,2],[N.A4,3],[N.G4,4],
      [N.E4,5],[N.C4,6],[N.D4,7],[N.E4,8],
      [N.F4,9],[N.E4,10],[N.D4,11],[N.C4,12],
      [N.G4,13],[N.E4,15],
    ]),
  },

  // ── GRADE 2 ──────────────────────────────────────────────────
  {
    slug:'p-g2-1', order:7, instrument:'piano',
    name:'Grade 2 — D Major Scale',
    description:'D major scale with F# and C#. One octave. ABRSM Grade 2.',
    difficulty:'easy', bpm:72, xpReward:100,
    notes: seq([
      [N.D4,1],[N.E4,2],[N.Fs4,3],[N.G4,4],
      [N.A4,5],[N.B4,6],[N.Cs5,7],[N.D5,8],
      [N.Cs5,9],[N.B4,10],[N.A4,11],[N.G4,12],
      [N.Fs4,13],[N.E4,14],[N.D4,15],
    ]),
  },
  {
    slug:'p-g2-2', order:8, instrument:'piano',
    name:'Grade 2 — F Major Scale',
    description:'F major scale with Bb. One octave ascending and descending.',
    difficulty:'easy', bpm:72, xpReward:100,
    notes: seq([
      [N.F3,1],[N.G3,2],[N.A3,3],[N.As3,4],
      [N.C4,5],[N.D4,6],[N.E4,7],[N.F4,8],
      [N.E4,9],[N.D4,10],[N.C4,11],[N.As3,12],
      [N.A3,13],[N.G3,14],[N.F3,15],
    ]),
  },
  {
    slug:'p-g2-3', order:9, instrument:'piano',
    name:'Grade 2 — D Minor Scale (Harmonic)',
    description:'D harmonic minor with raised 7th C#. ABRSM Grade 2.',
    difficulty:'medium', bpm:72, xpReward:125,
    notes: seq([
      [N.D4,1],[N.E4,2],[N.F4,3],[N.G4,4],
      [N.A4,5],[N.As4,6],[N.Cs5,7],[N.D5,8],
      [N.Cs5,9],[N.As4,10],[N.A4,11],[N.G4,12],
      [N.F4,13],[N.E4,14],[N.D4,15],
    ]),
  },
  {
    slug:'p-g2-4', order:10, instrument:'piano',
    name:'Grade 2 — Minuet in G Style',
    description:'Minuet style melody in G major. Elegant and flowing.',
    difficulty:'medium', bpm:80, xpReward:150,
    notes: seq([
      [N.D4,1],[N.G4,2],[N.A4,3],[N.B4,4],
      [N.C5,5],[N.B4,6],[N.A4,7],
      [N.D5,9],[N.C5,10],[N.B4,11],[N.A4,12],
      [N.G4,13],[N.Fs4,15],
      [N.G4,17],[N.A4,18],[N.B4,19],[N.G4,20],
      [N.E4,21],[N.Fs4,23],[N.G4,24],
    ]),
  },
  {
    slug:'p-g2-5', order:11, instrument:'piano',
    name:'Grade 2 — Chromatic Scale Intro',
    description:'Chromatic scale from C4 to G4. Introduction to all 12 semitones.',
    difficulty:'medium', bpm:76, xpReward:150,
    notes: seq([
      [N.C4,1],[N.Cs4,2],[N.D4,3],[N.Ds4,4],
      [N.E4,5],[N.F4,6],[N.Fs4,7],[N.G4,8],
      [N.Fs4,9],[N.F4,10],[N.E4,11],[N.Ds4,12],
      [N.D4,13],[N.Cs4,14],[N.C4,15],
    ]),
  },

  // ── GRADE 3 ──────────────────────────────────────────────────
  {
    slug:'p-g3-1', order:12, instrument:'piano',
    name:'Grade 3 — Bb Major Scale',
    description:'Bb major scale two octaves. ABRSM Grade 3 requirement.',
    difficulty:'medium', bpm:80, xpReward:175,
    notes: seq([
      [N.As3,1],[N.C4,2],[N.D4,3],[N.Ds4,4],
      [N.F4,5],[N.G4,6],[N.A4,7],[N.As4,8],
      [N.A4,9],[N.G4,10],[N.F4,11],[N.Ds4,12],
      [N.D4,13],[N.C4,14],[N.As3,15],
    ]),
  },
  {
    slug:'p-g3-2', order:13, instrument:'piano',
    name:'Grade 3 — E Minor Scale (Melodic)',
    description:'E melodic minor — raised 6th and 7th ascending, natural descending.',
    difficulty:'medium', bpm:80, xpReward:175,
    notes: seq([
      [N.E4,1],[N.Fs4,2],[N.G4,3],[N.A4,4],
      [N.B4,5],[N.Cs5,6],[N.Ds5,7],[N.E5,8],
      [N.D5,9],[N.C5,10],[N.B4,11],[N.A4,12],
      [N.G4,13],[N.Fs4,14],[N.E4,15],
    ]),
  },
  {
    slug:'p-g3-3', order:14, instrument:'piano',
    name:'Grade 3 — Waltz Style',
    description:'Waltz in A minor. 3/4 feel with melodic right hand.',
    difficulty:'medium', bpm:88, xpReward:200,
    notes: seq([
      [N.A4,1],[N.E4,2],[N.C4,3],
      [N.B4,4],[N.E4,5],[N.C4,6],
      [N.C5,7],[N.E4,8],[N.A3,9],
      [N.B4,10],[N.D4,11],[N.G3,12],
      [N.A4,13],[N.E4,14],[N.C4,15],
      [N.E4,16],[N.A3,18],
    ]),
  },
  {
    slug:'p-g3-4', order:15, instrument:'piano',
    name:'Grade 3 — Contrary Motion C Major',
    description:'Both hands moving in opposite directions. ABRSM favourite exercise.',
    difficulty:'medium', bpm:84, xpReward:200,
    notes: seq([
      [N.C4,1],[N.D4,2],[N.E4,3],[N.F4,4],
      [N.G4,5],[N.A4,6],[N.B4,7],[N.C5,8],
      [N.B4,9],[N.A4,10],[N.G4,11],[N.F4,12],
      [N.E4,13],[N.D4,14],[N.C4,15],
    ]),
  },

  // ── GRADE 4 ──────────────────────────────────────────────────
  {
    slug:'p-g4-1', order:16, instrument:'piano',
    name:'Grade 4 — E Major Scale',
    description:'E major scale with four sharps F# C# G# D#. Two octaves.',
    difficulty:'hard', bpm:88, xpReward:250,
    notes: seq([
      [N.E4,1],[N.Fs4,2],[N.Gs4,3],[N.A4,4],
      [N.B4,5],[N.Cs5,6],[N.Ds5,7],[N.E5,8],
      [N.Ds5,9],[N.Cs5,10],[N.B4,11],[N.A4,12],
      [N.Gs4,13],[N.Fs4,14],[N.E4,15],
    ]),
  },
  {
    slug:'p-g4-2', order:17, instrument:'piano',
    name:'Grade 4 — Ab Major Scale',
    description:'Ab major — four flats. Crosses the full octave smoothly.',
    difficulty:'hard', bpm:88, xpReward:250,
    notes: seq([
      [N.Gs3,1],[N.As3,2],[N.C4,3],[N.Cs4,4],
      [N.Ds4,5],[N.F4,6],[N.G4,7],[N.Gs4,8],
      [N.G4,9],[N.F4,10],[N.Ds4,11],[N.Cs4,12],
      [N.C4,13],[N.As3,14],[N.Gs3,15],
    ]),
  },
  {
    slug:'p-g4-3', order:18, instrument:'piano',
    name:'Grade 4 — Sonatina Theme',
    description:'Sonatina-style theme. Balanced phrasing and dynamic contrast.',
    difficulty:'hard', bpm:96, xpReward:300,
    notes: seq([
      [N.C5,1],[N.B4,2],[N.A4,3],[N.G4,4],
      [N.E4,5],[N.F4,6],[N.G4,7],[N.C4,8],
      [N.D4,9],[N.E4,10],[N.F4,11],[N.G4,12],
      [N.A4,13],[N.G4,14],[N.F4,15],[N.E4,16],
      [N.D4,17],[N.C4,19],
    ]),
  },
  {
    slug:'p-g4-4', order:19, instrument:'piano',
    name:'Grade 4 — Pentatonic Improvisation',
    description:'G pentatonic scale pattern. Foundation for jazz and blues.',
    difficulty:'hard', bpm:100, xpReward:300,
    notes: seq([
      [N.G4,1],[N.A4,2],[N.B4,3],[N.D5,4],
      [N.E5,5],[N.D5,6],[N.B4,7],[N.A4,8],
      [N.G4,9],[N.B4,10],[N.D5,11],[N.B4,12],
      [N.A4,13],[N.G4,15],
    ]),
  },

  // ── GRADE 5 ──────────────────────────────────────────────────
  {
    slug:'p-g5-1', order:20, instrument:'piano',
    name:'Grade 5 — B Major Scale',
    description:'B major — five sharps. Full two octaves at Grade 5 tempo.',
    difficulty:'hard', bpm:96, xpReward:350,
    notes: seq([
      [N.B3,1],[N.Cs4,2],[N.Ds4,3],[N.E4,4],
      [N.Fs4,5],[N.Gs4,6],[N.As4,7],[N.B4,8],
      [N.As4,9],[N.Gs4,10],[N.Fs4,11],[N.E4,12],
      [N.Ds4,13],[N.Cs4,14],[N.B3,15],
    ]),
  },
  {
    slug:'p-g5-2', order:21, instrument:'piano',
    name:'Grade 5 — Chromatic Scale Full',
    description:'Full chromatic scale C4 to C5 and back. ABRSM Grade 5.',
    difficulty:'hard', bpm:100, xpReward:350,
    notes: seq([
      [N.C4,1],[N.Cs4,2],[N.D4,3],[N.Ds4,4],
      [N.E4,5],[N.F4,6],[N.Fs4,7],[N.G4,8],
      [N.Gs4,9],[N.A4,10],[N.As4,11],[N.B4,12],
      [N.C5,13],[N.B4,14],[N.As4,15],[N.A4,16],
      [N.Gs4,17],[N.G4,18],[N.Fs4,19],[N.F4,20],
      [N.E4,21],[N.Ds4,22],[N.D4,23],[N.Cs4,24],
      [N.C4,25],
    ]),
  },
  {
    slug:'p-g5-3', order:22, instrument:'piano',
    name:'Grade 5 — Nocturne Style',
    description:'Lyrical nocturne-inspired melody. Expressive and flowing.',
    difficulty:'expert', bpm:84, xpReward:400,
    notes: seq([
      [N.E5,1],[N.D5,2],[N.C5,3],[N.B4,4],
      [N.G4,5],[N.A4,6],[N.B4,7],[N.C5,8],
      [N.D5,9],[N.E5,10],[N.F5,11],[N.E5,12],
      [N.Ds5,13],[N.E5,15],
      [N.A4,17],[N.B4,18],[N.C5,19],[N.D5,20],
      [N.E5,21],[N.C5,22],[N.A4,23],[N.G4,24],
      [N.E4,25],[N.C4,27],
    ]),
  },
  {
    slug:'p-g5-4', order:23, instrument:'piano',
    name:'Grade 5 — Alberti Bass Full',
    description:'Full Alberti bass pattern over chord progression. Classical style.',
    difficulty:'expert', bpm:120, xpReward:450,
    notes: seq([
      [N.C4,1],[N.G4,2],[N.E4,3],[N.G4,4],
      [N.C4,5],[N.G4,6],[N.E4,7],[N.G4,8],
      [N.F3,9],[N.C4,10],[N.A3,11],[N.C4,12],
      [N.G3,13],[N.D4,14],[N.B3,15],[N.D4,16],
      [N.A3,17],[N.E4,18],[N.C4,19],[N.E4,20],
      [N.G3,21],[N.D4,22],[N.B3,23],[N.D4,24],
      [N.C3,25],[N.G3,26],[N.E3,27],[N.G3,28],
    ]),
  },
]

// ═══════════════════════════════════════════════════════════════
// GUITAR LESSONS — ABRSM Grade 1 to 5 Inspired
// ═══════════════════════════════════════════════════════════════
const guitarLessons = [

  // ── GRADE 1 ──────────────────────────────────────────────────
  {
    slug:'g-g1-1', order:1, instrument:'guitar',
    name:'Grade 1 — Open String Exercise',
    description:'All 6 open strings played evenly. Foundation of guitar technique.',
    difficulty:'easy', bpm:60, xpReward:50,
    notes: seq([[40,1,'E2'],[45,2,'A2'],[50,3,'D3'],[55,4,'G3'],[59,5,'B3'],[64,6,'E4'],[59,7,'B3'],[55,8,'G3'],[50,9,'D3'],[45,10,'A2'],[40,11,'E2']]),
  },
  {
    slug:'g-g1-2', order:2, instrument:'guitar',
    name:'Grade 1 — E Minor Chord Melody',
    description:'Simple melody using first position notes on E minor.',
    difficulty:'easy', bpm:63, xpReward:75,
    notes: seq([
      [64,1,'E4'],[62,2,'D4'],[59,3,'B3'],[57,4,'A3'],
      [55,5,'G3'],[57,6,'A3'],[59,7,'B3'],[60,8,'C4'],
      [62,9,'D4'],[64,10,'E4'],[62,11,'D4'],[59,12,'B3'],
      [55,13,'G3'],[55,15,'G3'],
    ]),
  },
  {
    slug:'g-g1-3', order:3, instrument:'guitar',
    name:'Grade 1 — C Major Position',
    description:'First position C major scale on guitar. ABRSM Grade 1.',
    difficulty:'easy', bpm:66, xpReward:75,
    notes: seq([
      [48,1,'C3'],[50,2,'D3'],[52,3,'E3'],[53,4,'F3'],
      [55,5,'G3'],[57,6,'A3'],[59,7,'B3'],[60,8,'C4'],
      [59,9,'B3'],[57,10,'A3'],[55,11,'G3'],[53,12,'F3'],
      [52,13,'E3'],[50,14,'D3'],[48,15,'C3'],
    ]),
  },
  {
    slug:'g-g1-4', order:4, instrument:'guitar',
    name:'Grade 1 — Simple Waltz',
    description:'Simple waltz melody in first position. Even tone and timing.',
    difficulty:'easy', bpm:72, xpReward:100,
    notes: seq([
      [64,1,'E4'],[64,2,'E4'],[62,3,'D4'],
      [60,4,'C4'],[60,5,'C4'],[59,6,'B3'],
      [57,7,'A3'],[59,8,'B3'],[60,9,'C4'],
      [62,10,'D4'],[62,11,'D4'],[60,12,'C4'],
      [59,13,'B3'],[57,15,'A3'],
    ]),
  },
  {
    slug:'g-g1-5', order:5, instrument:'guitar',
    name:'Grade 1 — Andantino',
    description:'Gentle flowing melody. Focus on smooth note connections.',
    difficulty:'easy', bpm:76, xpReward:100,
    notes: seq([
      [55,1,'G3'],[57,2,'A3'],[59,3,'B3'],[60,4,'C4'],
      [59,5,'B3'],[57,6,'A3'],[55,7,'G3'],[55,8,'G3'],
      [60,9,'C4'],[59,10,'B3'],[57,11,'A3'],[55,12,'G3'],
      [53,13,'F3'],[52,14,'E3'],[53,15,'F3'],[55,16,'G3'],
      [55,17,'G3'],[55,19,'G3'],
    ]),
  },

  // ── GRADE 2 ──────────────────────────────────────────────────
  {
    slug:'g-g2-1', order:6, instrument:'guitar',
    name:'Grade 2 — A Major Scale',
    description:'A major scale first position. Introduces G# and C#.',
    difficulty:'easy', bpm:72, xpReward:100,
    notes: seq([
      [45,1,'A2'],[47,2,'B2'],[49,3,'C#3'],[50,4,'D3'],
      [52,5,'E3'],[54,6,'F#3'],[56,7,'G#3'],[57,8,'A3'],
      [56,9,'G#3'],[54,10,'F#3'],[52,11,'E3'],[50,12,'D3'],
      [49,13,'C#3'],[47,14,'B2'],[45,15,'A2'],
    ]),
  },
  {
    slug:'g-g2-2', order:7, instrument:'guitar',
    name:'Grade 2 — E Minor Pentatonic',
    description:'E minor pentatonic box pattern. Foundation of rock and blues.',
    difficulty:'easy', bpm:76, xpReward:100,
    notes: seq([
      [40,1,'E2'],[43,2,'G2'],[45,3,'A2'],[47,4,'B2'],
      [50,5,'D3'],[52,6,'E3'],[50,7,'D3'],[47,8,'B2'],
      [45,9,'A2'],[43,10,'G2'],[40,11,'E2'],[43,12,'G2'],
      [45,13,'A2'],[47,14,'B2'],[52,15,'E3'],
    ]),
  },
  {
    slug:'g-g2-3', order:8, instrument:'guitar',
    name:'Grade 2 — Romanza Style',
    description:'Classical guitar romance style. Alternating bass and melody.',
    difficulty:'medium', bpm:76, xpReward:150,
    notes: seq([
      [64,1,'E4'],[59,2,'B3'],[55,3,'G3'],[52,4,'E3'],
      [64,5,'E4'],[59,6,'B3'],[55,7,'G3'],[52,8,'E3'],
      [62,9,'D4'],[59,10,'B3'],[55,11,'G3'],[50,12,'D3'],
      [62,13,'D4'],[59,14,'B3'],[55,15,'G3'],
    ]),
  },
  {
    slug:'g-g2-4', order:9, instrument:'guitar',
    name:'Grade 2 — D Major Scale',
    description:'D major in second position on guitar. Smooth shifts.',
    difficulty:'medium', bpm:80, xpReward:150,
    notes: seq([
      [50,1,'D3'],[52,2,'E3'],[54,3,'F#3'],[55,4,'G3'],
      [57,5,'A3'],[59,6,'B3'],[61,7,'C#4'],[62,8,'D4'],
      [61,9,'C#4'],[59,10,'B3'],[57,11,'A3'],[55,12,'G3'],
      [54,13,'F#3'],[52,14,'E3'],[50,15,'D3'],
    ]),
  },

  // ── GRADE 3 ──────────────────────────────────────────────────
  {
    slug:'g-g3-1', order:10, instrument:'guitar',
    name:'Grade 3 — Blues Scale',
    description:'E blues scale with b5 blue note. Essential for improvisation.',
    difficulty:'medium', bpm:80, xpReward:175,
    notes: seq([
      [40,1,'E2'],[43,2,'G2'],[45,3,'A2'],[46,4,'Bb2'],
      [47,5,'B2'],[50,6,'D3'],[52,7,'E3'],[50,8,'D3'],
      [47,9,'B2'],[46,10,'Bb2'],[45,11,'A2'],[43,12,'G2'],
      [40,13,'E2'],
    ]),
  },
  {
    slug:'g-g3-2', order:11, instrument:'guitar',
    name:'Grade 3 — Andante in G',
    description:'Andante melody in G major. Two octave range with position shifts.',
    difficulty:'medium', bpm:84, xpReward:200,
    notes: seq([
      [55,1,'G3'],[57,2,'A3'],[59,3,'B3'],[60,4,'C4'],
      [62,5,'D4'],[64,6,'E4'],[66,7,'F#4'],[67,8,'G4'],
      [66,9,'F#4'],[64,10,'E4'],[62,11,'D4'],[60,12,'C4'],
      [59,13,'B3'],[57,14,'A3'],[55,15,'G3'],
    ]),
  },
  {
    slug:'g-g3-3', order:12, instrument:'guitar',
    name:'Grade 3 — Smoke on the Water',
    description:'Deep Purple classic riff. Power chords and iconic melody.',
    difficulty:'medium', bpm:90, xpReward:200,
    notes: seq([
      [50,1,'D3'],[53,2,'F3'],[55,3,'G3'],
      [50,5,'D3'],[53,6,'F3'],[56,7,'Ab3'],[55,8,'G3'],
      [50,10,'D3'],[53,11,'F3'],[55,12,'G3'],
      [53,14,'F3'],[50,16,'D3'],
    ]),
  },

  // ── GRADE 4 ──────────────────────────────────────────────────
  {
    slug:'g-g4-1', order:13, instrument:'guitar',
    name:'Grade 4 — B Minor Scale',
    description:'B minor scale in third position. Two octaves.',
    difficulty:'hard', bpm:88, xpReward:250,
    notes: seq([
      [47,1,'B2'],[49,2,'C#3'],[50,3,'D3'],[52,4,'E3'],
      [54,5,'F#3'],[55,6,'G3'],[57,7,'A3'],[59,8,'B3'],
      [57,9,'A3'],[55,10,'G3'],[54,11,'F#3'],[52,12,'E3'],
      [50,13,'D3'],[49,14,'C#3'],[47,15,'B2'],
    ]),
  },
  {
    slug:'g-g4-2', order:14, instrument:'guitar',
    name:'Grade 4 — Barre Chord Workout',
    description:'F major barre chord melody. Essential barre technique.',
    difficulty:'hard', bpm:88, xpReward:250,
    notes: seq([
      [53,1,'F3'],[55,2,'G3'],[57,3,'A3'],[58,4,'Bb3'],
      [60,5,'C4'],[62,6,'D4'],[64,7,'E4'],[65,8,'F4'],
      [64,9,'E4'],[62,10,'D4'],[60,11,'C4'],[58,12,'Bb3'],
      [57,13,'A3'],[55,14,'G3'],[53,15,'F3'],
    ]),
  },
  {
    slug:'g-g4-3', order:15, instrument:'guitar',
    name:'Grade 4 — Fingerpicking Pattern',
    description:'p-i-m-a fingerpicking pattern. Classical guitar technique.',
    difficulty:'hard', bpm:92, xpReward:300,
    notes: seq([
      [40,1,'E2'],[47,2,'B2'],[52,3,'E3'],[55,4,'G3'],
      [40,5,'E2'],[47,6,'B2'],[52,7,'E3'],[55,8,'G3'],
      [45,9,'A2'],[47,10,'B2'],[52,11,'E3'],[57,12,'A3'],
      [43,13,'G2'],[47,14,'B2'],[50,15,'D3'],[55,16,'G3'],
    ]),
  },

  // ── GRADE 5 ──────────────────────────────────────────────────
  {
    slug:'g-g5-1', order:16, instrument:'guitar',
    name:'Grade 5 — Full Pentatonic Positions',
    description:'All 5 pentatonic box positions connected. Full neck workout.',
    difficulty:'hard', bpm:96, xpReward:350,
    notes: seq([
      [40,1,'E2'],[43,2,'G2'],[45,3,'A2'],[47,4,'B2'],
      [50,5,'D3'],[52,6,'E3'],[55,7,'G3'],[57,8,'A3'],
      [59,9,'B3'],[62,10,'D4'],[64,11,'E4'],[67,12,'G4'],
      [64,13,'E4'],[62,14,'D4'],[59,15,'B3'],[57,16,'A3'],
      [55,17,'G3'],[52,18,'E3'],[50,19,'D3'],[47,20,'B2'],
      [45,21,'A2'],[43,22,'G2'],[40,23,'E2'],
    ]),
  },
  {
    slug:'g-g5-2', order:17, instrument:'guitar',
    name:'Grade 5 — Recuerdos de la Alhambra Style',
    description:'Tremolo technique inspired piece. Right hand finger speed.',
    difficulty:'expert', bpm:100, xpReward:450,
    notes: seq([
      [64,1,'E4'],[64,1.33,'E4'],[64,1.66,'E4'],
      [62,2,'D4'],[62,2.33,'D4'],[62,2.66,'D4'],
      [60,3,'C4'],[60,3.33,'C4'],[60,3.66,'C4'],
      [59,4,'B3'],[59,4.33,'B3'],[59,4.66,'B3'],
      [57,5,'A3'],[57,5.33,'A3'],[57,5.66,'A3'],
      [55,6,'G3'],[55,6.33,'G3'],[55,6.66,'G3'],
      [57,7,'A3'],[57,7.33,'A3'],[57,7.66,'A3'],
      [59,8,'B3'],[59,8.33,'B3'],[59,8.66,'B3'],
    ]),
  },
  {
    slug:'g-g5-3', order:18, instrument:'guitar',
    name:'Grade 5 — Expert Shred Run',
    description:'Chromatic run at maximum tempo. Ultimate speed exercise.',
    difficulty:'expert', bpm:160, xpReward:500,
    notes: seq([
      [40,1],[41,2],[42,3],[43,4],[44,5],[45,6],[46,7],[47,8],
      [48,9],[49,10],[50,11],[51,12],[52,13],[53,14],[54,15],[55,16],
      [54,17],[53,18],[52,19],[51,20],[50,21],[49,22],[48,23],[47,24],
      [46,25],[45,26],[44,27],[43,28],[42,29],[41,30],[40,31],
    ]),
  },
]

// ═══════════════════════════════════════════════════════════════
// DRUM LESSONS — ABRSM Percussion Grade 1 to 5 Inspired
// ═══════════════════════════════════════════════════════════════
const drumLessons = [

  // ── GRADE 1 ──────────────────────────────────────────────────
  {
    slug:'d-g1-1', order:1, instrument:'drums',
    name:'Grade 1 — Single Stroke Roll',
    description:'Alternating single strokes R-L-R-L on snare. Core rudiment.',
    difficulty:'easy', bpm:60, xpReward:50,
    notes: drumSeq([
      [D.SNARE,1],[D.SNARE,1.5],[D.SNARE,2],[D.SNARE,2.5],
      [D.SNARE,3],[D.SNARE,3.5],[D.SNARE,4],[D.SNARE,4.5],
      [D.SNARE,5],[D.SNARE,5.5],[D.SNARE,6],[D.SNARE,6.5],
      [D.SNARE,7],[D.SNARE,7.5],[D.SNARE,8],[D.SNARE,8.5],
    ]),
  },
  {
    slug:'d-g1-2', order:2, instrument:'drums',
    name:'Grade 1 — Kick on Beats',
    description:'Bass drum on beats 1 2 3 4. Steady pulse foundation.',
    difficulty:'easy', bpm:63, xpReward:50,
    notes: drumSeq([
      [D.KICK,1],[D.KICK,2],[D.KICK,3],[D.KICK,4],
      [D.KICK,5],[D.KICK,6],[D.KICK,7],[D.KICK,8],
    ]),
  },
  {
    slug:'d-g1-3', order:3, instrument:'drums',
    name:'Grade 1 — Snare on 2 and 4',
    description:'Snare on beats 2 and 4. The backbeat — foundation of all popular music.',
    difficulty:'easy', bpm:66, xpReward:75,
    notes: drumSeq([
      [D.KICK,1],[D.SNARE,2],[D.KICK,3],[D.SNARE,4],
      [D.KICK,5],[D.SNARE,6],[D.KICK,7],[D.SNARE,8],
    ]),
  },
  {
    slug:'d-g1-4', order:4, instrument:'drums',
    name:'Grade 1 — Hi-Hat Quarter Notes',
    description:'Hi-hat on every beat with kick and snare. Basic coordination.',
    difficulty:'easy', bpm:70, xpReward:75,
    notes: drumSeq([
      [D.HIHAT,1],[D.KICK,1],
      [D.HIHAT,2],[D.SNARE,2],
      [D.HIHAT,3],[D.KICK,3],
      [D.HIHAT,4],[D.SNARE,4],
      [D.HIHAT,5],[D.KICK,5],
      [D.HIHAT,6],[D.SNARE,6],
      [D.HIHAT,7],[D.KICK,7],
      [D.HIHAT,8],[D.SNARE,8],
    ]),
  },
  {
    slug:'d-g1-5', order:5, instrument:'drums',
    name:'Grade 1 — Basic Rock Beat',
    description:'Hi-hat 8th notes with kick on 1 and 3, snare on 2 and 4.',
    difficulty:'easy', bpm:72, xpReward:100,
    notes: drumSeq([
      [D.HIHAT,1],[D.KICK,1],
      [D.HIHAT,1.5],
      [D.HIHAT,2],[D.SNARE,2],
      [D.HIHAT,2.5],
      [D.HIHAT,3],[D.KICK,3],
      [D.HIHAT,3.5],
      [D.HIHAT,4],[D.SNARE,4],
      [D.HIHAT,4.5],
      [D.HIHAT,5],[D.KICK,5],
      [D.HIHAT,5.5],
      [D.HIHAT,6],[D.SNARE,6],
      [D.HIHAT,6.5],
      [D.HIHAT,7],[D.KICK,7],
      [D.HIHAT,7.5],
      [D.HIHAT,8],[D.SNARE,8],
    ]),
  },

  // ── GRADE 2 ──────────────────────────────────────────────────
  {
    slug:'d-g2-1', order:6, instrument:'drums',
    name:'Grade 2 — Double Stroke Roll',
    description:'R-R-L-L double strokes on snare. ABRSM percussion rudiment.',
    difficulty:'easy', bpm:72, xpReward:100,
    notes: drumSeq([
      [D.SNARE,1],[D.SNARE,1.25],[D.SNARE,1.5],[D.SNARE,1.75],
      [D.SNARE,2],[D.SNARE,2.25],[D.SNARE,2.5],[D.SNARE,2.75],
      [D.SNARE,3],[D.SNARE,3.25],[D.SNARE,3.5],[D.SNARE,3.75],
      [D.SNARE,4],[D.SNARE,4.25],[D.SNARE,4.5],[D.SNARE,4.75],
    ]),
  },
  {
    slug:'d-g2-2', order:7, instrument:'drums',
    name:'Grade 2 — Paradiddle',
    description:'R-L-R-R L-R-L-L paradiddle. Essential sticking pattern.',
    difficulty:'medium', bpm:76, xpReward:125,
    notes: drumSeq([
      [D.SNARE,1],[D.SNARE,1.5],[D.SNARE,2],[D.SNARE,2.25],
      [D.SNARE,2.5],[D.SNARE,3],[D.SNARE,3.5],[D.SNARE,3.75],
      [D.SNARE,4],[D.SNARE,4.5],[D.SNARE,5],[D.SNARE,5.25],
      [D.SNARE,5.5],[D.SNARE,6],[D.SNARE,6.5],[D.SNARE,6.75],
    ]),
  },
  {
    slug:'d-g2-3', order:8, instrument:'drums',
    name:'Grade 2 — Shuffle Beat',
    description:'Swung 8th notes shuffle feel. Foundation of blues drumming.',
    difficulty:'medium', bpm:80, xpReward:150,
    notes: drumSeq([
      [D.HIHAT,1],[D.KICK,1],
      [D.HIHAT,1.66],
      [D.HIHAT,2],[D.SNARE,2],
      [D.HIHAT,2.66],
      [D.HIHAT,3],[D.KICK,3],
      [D.HIHAT,3.66],
      [D.HIHAT,4],[D.SNARE,4],
      [D.HIHAT,4.66],
      [D.HIHAT,5],[D.KICK,5],
      [D.HIHAT,5.66],
      [D.HIHAT,6],[D.SNARE,6],
      [D.HIHAT,6.66],
      [D.HIHAT,7],[D.KICK,7],
      [D.HIHAT,7.66],
      [D.HIHAT,8],[D.SNARE,8],
    ]),
  },
  {
    slug:'d-g2-4', order:9, instrument:'drums',
    name:'Grade 2 — Tom Tom Fill',
    description:'4 beat tom fill from high to low. Musical fill pattern.',
    difficulty:'medium', bpm:80, xpReward:150,
    notes: drumSeq([
      [D.TOM_HI,1],[D.TOM_HI,1.5],
      [D.TOM_MD,2],[D.TOM_MD,2.5],
      [D.TOM_LO,3],[D.TOM_LO,3.5],
      [D.SNARE,4],[D.KICK,4],[D.CRASH,4],
      [D.TOM_HI,5],[D.TOM_HI,5.5],
      [D.TOM_MD,6],[D.TOM_MD,6.5],
      [D.TOM_LO,7],[D.TOM_LO,7.5],
      [D.SNARE,8],[D.KICK,8],[D.CRASH,8],
    ]),
  },

  // ── GRADE 3 ──────────────────────────────────────────────────
  {
    slug:'d-g3-1', order:10, instrument:'drums',
    name:'Grade 3 — Flam Rudiment',
    description:'Grace note before primary stroke. Adds texture and accent.',
    difficulty:'medium', bpm:80, xpReward:175,
    notes: drumSeq([
      [D.RIMSHOT,1],[D.SNARE,1.1],
      [D.RIMSHOT,2],[D.SNARE,2.1],
      [D.RIMSHOT,3],[D.SNARE,3.1],
      [D.RIMSHOT,4],[D.SNARE,4.1],
      [D.RIMSHOT,5],[D.SNARE,5.1],
      [D.RIMSHOT,6],[D.SNARE,6.1],
      [D.RIMSHOT,7],[D.SNARE,7.1],
      [D.RIMSHOT,8],[D.SNARE,8.1],
    ]),
  },
  {
    slug:'d-g3-2', order:11, instrument:'drums',
    name:'Grade 3 — Funk Groove',
    description:'Syncopated funk beat. Ghost notes on snare with open hi-hat.',
    difficulty:'medium', bpm:88, xpReward:200,
    notes: drumSeq([
      [D.KICK,1],[D.HIHAT,1],
      [D.HIHAT,1.5],
      [D.SNARE,2],[D.HIHAT,2],
      [D.KICK,2.5],[D.HIHAT,2.5],
      [D.HIHAT,3],[D.KICK,3.25],
      [D.OHAT,3.5],
      [D.SNARE,4],[D.HIHAT,4],
      [D.KICK,4.5],
      [D.HIHAT,5],[D.KICK,5],
      [D.HIHAT,5.5],
      [D.SNARE,6],[D.HIHAT,6],
      [D.KICK,6.5],[D.HIHAT,6.5],
      [D.HIHAT,7],
      [D.OHAT,7.5],
      [D.SNARE,8],[D.CRASH,8],[D.KICK,8],
    ]),
  },
  {
    slug:'d-g3-3', order:12, instrument:'drums',
    name:'Grade 3 — Jazz Ride Pattern',
    description:'Jazz ride cymbal pattern with hi-hat on 2 and 4.',
    difficulty:'medium', bpm:92, xpReward:200,
    notes: drumSeq([
      [D.RIDE,1],[D.KICK,1],
      [D.RIDE,1.66],
      [D.RIDE,2],[D.HIHAT,2],
      [D.RIDE,2.66],
      [D.RIDE,3],[D.KICK,3],
      [D.RIDE,3.66],
      [D.RIDE,4],[D.HIHAT,4],
      [D.RIDE,4.66],
      [D.RIDE,5],[D.KICK,5],
      [D.RIDE,5.66],
      [D.RIDE,6],[D.HIHAT,6],
      [D.RIDE,6.66],
      [D.RIDE,7],
      [D.RIDE,7.66],
      [D.RIDE,8],[D.HIHAT,8],[D.KICK,8],
    ]),
  },

  // ── GRADE 4 ──────────────────────────────────────────────────
  {
    slug:'d-g4-1', order:13, instrument:'drums',
    name:'Grade 4 — Double Bass Intro',
    description:'Double kick drum pattern. Develops independent foot technique.',
    difficulty:'hard', bpm:90, xpReward:250,
    notes: drumSeq([
      [D.KICK,1],[D.KICK,1.5],[D.SNARE,2],
      [D.KICK,2.5],[D.KICK,3],[D.SNARE,4],
      [D.KICK,4.5],[D.KICK,5],[D.SNARE,6],
      [D.KICK,6.5],[D.KICK,7],[D.SNARE,8],
      [D.KICK,8.5],[D.CRASH,9],
    ]),
  },
  {
    slug:'d-g4-2', order:14, instrument:'drums',
    name:'Grade 4 — 16th Note Hi-Hat',
    description:'16th note hi-hat with syncopated kick. Advanced coordination.',
    difficulty:'hard', bpm:88, xpReward:275,
    notes: drumSeq([
      [D.HIHAT,1],[D.KICK,1],[D.HIHAT,1.25],[D.HIHAT,1.5],[D.HIHAT,1.75],
      [D.HIHAT,2],[D.SNARE,2],[D.HIHAT,2.25],[D.HIHAT,2.5],[D.KICK,2.75],
      [D.HIHAT,3],[D.HIHAT,3.25],[D.HIHAT,3.5],[D.KICK,3.5],[D.HIHAT,3.75],
      [D.HIHAT,4],[D.SNARE,4],[D.HIHAT,4.25],[D.HIHAT,4.5],[D.HIHAT,4.75],
    ]),
  },
  {
    slug:'d-g4-3', order:15, instrument:'drums',
    name:'Grade 4 — Samba Pattern',
    description:'Brazilian samba rhythm on drum kit. Cross-stick and surdo feel.',
    difficulty:'hard', bpm:96, xpReward:300,
    notes: drumSeq([
      [D.KICK,1],[D.HIHAT,1],
      [D.RIMSHOT,1.5],
      [D.KICK,2],[D.HIHAT,2],
      [D.KICK,2.5],
      [D.HIHAT,3],[D.SNARE,3],
      [D.RIMSHOT,3.5],
      [D.KICK,4],[D.HIHAT,4],
      [D.KICK,4.5],
      [D.HIHAT,5],[D.KICK,5],
      [D.RIMSHOT,5.5],
      [D.HIHAT,6],[D.SNARE,6],
      [D.KICK,6.5],
      [D.HIHAT,7],[D.KICK,7],
      [D.RIMSHOT,7.5],
      [D.HIHAT,8],[D.SNARE,8],[D.CRASH,8],
    ]),
  },

  // ── GRADE 5 ──────────────────────────────────────────────────
  {
    slug:'d-g5-1', order:16, instrument:'drums',
    name:'Grade 5 — Linear Drumming',
    description:'No two drums hit simultaneously. Modern linear groove technique.',
    difficulty:'hard', bpm:96, xpReward:350,
    notes: drumSeq([
      [D.KICK,1],[D.HIHAT,1.25],[D.SNARE,1.5],[D.HIHAT,1.75],
      [D.KICK,2],[D.HIHAT,2.25],[D.KICK,2.5],[D.SNARE,2.75],
      [D.HIHAT,3],[D.KICK,3.25],[D.HIHAT,3.5],[D.SNARE,3.75],
      [D.KICK,4],[D.HIHAT,4.25],[D.SNARE,4.5],[D.KICK,4.75],
    ]),
  },
  {
    slug:'d-g5-2', order:17, instrument:'drums',
    name:'Grade 5 — Polyrhythm 3 over 4',
    description:'Three notes over four beats. Advanced rhythmic independence.',
    difficulty:'hard', bpm:92, xpReward:375,
    notes: drumSeq([
      [D.SNARE,1],[D.KICK,1],
      [D.HIHAT,1.5],
      [D.SNARE,2.33],
      [D.HIHAT,2.5],
      [D.KICK,3],
      [D.SNARE,3.66],[D.HIHAT,3.66],
      [D.KICK,4.5],
      [D.SNARE,5],[D.HIHAT,5],
      [D.KICK,5.5],
      [D.SNARE,6.33],
      [D.HIHAT,7],
      [D.SNARE,7.66],[D.KICK,7.66],
      [D.CRASH,8],[D.KICK,8],
    ]),
  },
  {
    slug:'d-g5-3', order:18, instrument:'drums',
    name:'Grade 5 — Blast Beat',
    description:'Extreme speed alternating kick and snare. Metal drumming pinnacle.',
    difficulty:'expert', bpm:160, xpReward:500,
    notes: drumSeq([
      [D.KICK,1],[D.SNARE,1.5],
      [D.KICK,2],[D.SNARE,2.5],
      [D.KICK,3],[D.SNARE,3.5],
      [D.KICK,4],[D.SNARE,4.5],
      [D.KICK,5],[D.SNARE,5.5],
      [D.KICK,6],[D.SNARE,6.5],
      [D.KICK,7],[D.SNARE,7.5],
      [D.KICK,8],[D.CRASH,8],
    ]),
  },
]

// ═══════════════════════════════════════════════════════════════
// SEED
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 Seeding ABRSM-inspired lessons...\n')

  const allLessons = [
    ...pianoLessons,
    ...guitarLessons,
    ...drumLessons,
  ]

  for (const lesson of allLessons) {
    await prisma.lesson.upsert({
      where:  { slug: lesson.slug },
      update: {
        name:        lesson.name,
        description: lesson.description,
        difficulty:  lesson.difficulty,
        bpm:         lesson.bpm,
        xpReward:    lesson.xpReward,
        notes:       lesson.notes as any,
      },
      create: lesson as any,
    })
    console.log(`  ✓ [${lesson.instrument.padEnd(6)}] ${lesson.name}`)
  }

  console.log(`\n✅ Seeded ${allLessons.length} lessons`)
  console.log(`   🎹 Piano:  ${pianoLessons.length} lessons (Grade 1-5)`)
  console.log(`   🎸 Guitar: ${guitarLessons.length} lessons (Grade 1-5)`)
  console.log(`   🥁 Drums:  ${drumLessons.length} lessons (Grade 1-5)`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
