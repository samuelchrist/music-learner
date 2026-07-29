// ── Bass MIDI notes ───────────────────────────────────────────
// 4-string: E1(28) A1(33) D2(38) G2(43)
// 5-string: B0(23) E1(28) A1(33) D2(38) G2(43)

export const B: Record<string, number> = {
  // Open strings
  B0: 23, E1: 28, A1: 33, D2: 38, G2: 43,
  // First position
  F1: 29, Fs1: 30, G1: 31, Gs1: 32,
  As1: 34, B1: 35,
  Ds2: 39, E2: 40, F2: 41, Fs2: 42,
  Gs2: 44, A2: 45, As2: 46, B2: 47,
  C3: 48, Cs3: 49, D3: 50, Ds3: 51,
  E3: 52, F3: 53, Fs3: 54, G3: 55,
  Gs3: 56, A3: 57, As3: 58, B3: 59,
  C4: 60,
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

// ── 4-String Bass Lessons ─────────────────────────────────────
export const BASS4_LESSONS = [
  // Grade 1 — Foundation
  {
    slug: 'b4-g1-1', order: 1, instrument: 'bass4', grade: 1,
    name: 'Grade 1 — Open Strings (E A D G)',
    description: 'All 4 open strings. E1 A1 D2 G2. Foundation of bass playing.',
    difficulty: 'easy', bpm: 60, xpReward: 50, requiredPlan: 'FREE',
    notes: seq([
      [B.E1,1],[B.A1,2],[B.D2,3],[B.G2,4],
      [B.G2,5],[B.D2,6],[B.A1,7],[B.E1,8],
      [B.E1,9],[B.E1,10],[B.A1,11],[B.A1,12],
      [B.D2,13],[B.D2,14],[B.G2,15],[B.G2,16],
    ]),
  },
  {
    slug: 'b4-g1-2', order: 2, instrument: 'bass4', grade: 1,
    name: 'Grade 1 — E Major Scale',
    description: 'E major scale in first position. Core bass scale.',
    difficulty: 'easy', bpm: 63, xpReward: 75, requiredPlan: 'FREE',
    notes: seq([
      [B.E1,1],[B.Fs1,2],[B.Gs1,3],[B.A1,4],
      [B.B1,5],[B.Cs3,6],[B.Ds3,7],[B.E2,8],
      [B.Ds3,9],[B.Cs3,10],[B.B1,11],[B.A1,12],
      [B.Gs1,13],[B.Fs1,14],[B.E1,15],
    ]),
  },
  {
    slug: 'b4-g1-3', order: 3, instrument: 'bass4', grade: 1,
    name: 'Grade 1 — A Major Scale',
    description: 'A major scale. Essential bass position.',
    difficulty: 'easy', bpm: 66, xpReward: 75, requiredPlan: 'FREE',
    notes: seq([
      [B.A1,1],[B.B1,2],[B.Cs3,3],[B.D2,4],
      [B.E2,5],[B.Fs2,6],[B.Gs2,7],[B.A2,8],
      [B.Gs2,9],[B.Fs2,10],[B.E2,11],[B.D2,12],
      [B.Cs3,13],[B.B1,14],[B.A1,15],
    ]),
  },
  {
    slug: 'b4-g1-4', order: 4, instrument: 'bass4', grade: 1,
    name: 'Grade 1 — Pentatonic Bass Line',
    description: 'E minor pentatonic bass line. Foundation of rock and pop bass.',
    difficulty: 'easy', bpm: 70, xpReward: 100, requiredPlan: 'FREE',
    notes: seq([
      [B.E1,1],[B.G1,2],[B.A1,3],[B.B1,4],
      [B.D2,5],[B.E2,6],[B.D2,7],[B.B1,8],
      [B.A1,9],[B.G1,10],[B.E1,11],[B.E1,12],
    ]),
  },
  {
    slug: 'b4-g1-5', order: 5, instrument: 'bass4', grade: 1,
    name: 'Grade 1 — Root Note Bass Line',
    description: 'Playing root notes of I-IV-V in E. Most fundamental bass skill.',
    difficulty: 'easy', bpm: 72, xpReward: 100, requiredPlan: 'FREE',
    notes: seq([
      [B.E1,1],[B.E1,2],[B.E1,3],[B.E1,4],  // I = E
      [B.A1,5],[B.A1,6],[B.A1,7],[B.A1,8],  // IV = A
      [B.B1,9],[B.B1,10],[B.B1,11],[B.B1,12], // V = B
      [B.E1,13],[B.E1,14],[B.E1,15],[B.E1,16], // I = E
    ]),
  },

  // Grade 2
  {
    slug: 'b4-g2-1', order: 6, instrument: 'bass4', grade: 2,
    name: 'Grade 2 — Blues Bass Line',
    description: 'Classic 12-bar blues bass pattern in E. Root-5th-octave movement.',
    difficulty: 'medium', bpm: 80, xpReward: 150, requiredPlan: 'BASIC',
    notes: seq([
      [B.E1,1],[B.B1,2],[B.E2,3],[B.B1,4],
      [B.A1,5],[B.E2,6],[B.A2,7],[B.E2,8],
      [B.B1,9],[B.Fs2,10],[B.B2,11],[B.Fs2,12],
      [B.E1,13],[B.B1,14],[B.E1,15],[B.E1,16],
    ]),
  },
  {
    slug: 'b4-g2-2', order: 7, instrument: 'bass4', grade: 2,
    name: 'Grade 2 — Walking Bass Line',
    description: 'Walking bass over I-IV-V-I. Connect chords with passing tones.',
    difficulty: 'medium', bpm: 80, xpReward: 175, requiredPlan: 'BASIC',
    notes: seq([
      [B.E1,1],[B.Fs1,2],[B.Gs1,3],[B.A1,4],
      [B.A1,5],[B.B1,6],[B.Cs3,7],[B.D2,8],
      [B.B1,9],[B.Cs3,10],[B.Ds3,11],[B.E2,12],
      [B.E1,13],[B.D2,14],[B.Cs3,15],[B.E1,16],
    ]),
  },
  {
    slug: 'b4-g2-3', order: 8, instrument: 'bass4', grade: 2,
    name: 'Grade 2 — Funk Bass Pattern',
    description: 'Syncopated funk bass groove. Muted 16th note feel.',
    difficulty: 'medium', bpm: 90, xpReward: 200, requiredPlan: 'BASIC',
    notes: seq([
      [B.E1,1],[B.E1,1.5],[B.G1,2],[B.A1,2.5],
      [B.E1,3],[B.G1,3.5],[B.A1,4],
      [B.E1,5],[B.E1,5.5],[B.G1,6],[B.A1,6.5],
      [B.B1,7],[B.A1,7.5],[B.G1,8],
    ]),
  },
  {
    slug: 'b4-g2-4', order: 9, instrument: 'bass4', grade: 2,
    name: 'Grade 2 — Reggae Bass Line',
    description: 'Classic reggae bass pattern. Emphasises the offbeat.',
    difficulty: 'medium', bpm: 75, xpReward: 175, requiredPlan: 'BASIC',
    notes: seq([
      [0,1],[B.E1,1.5],[0,2],[B.E1,2.5],
      [0,3],[B.A1,3.5],[0,4],[B.A1,4.5],
      [0,5],[B.E1,5.5],[0,6],[B.E1,6.5],
      [0,7],[B.B1,7.5],[0,8],[B.E1,8.5],
    ]),
  },

  // Grade 3
  {
    slug: 'b4-g3-1', order: 10, instrument: 'bass4', grade: 3,
    name: 'Grade 3 — Slap Bass Introduction',
    description: 'Basic slap and pop technique. Thumb on E and A, pop on D and G.',
    difficulty: 'hard', bpm: 85, xpReward: 250, requiredPlan: 'BASIC',
    notes: seq([
      [B.E1,1],[B.G1,1.5],[B.A1,2],[B.G1,2.5],
      [B.E1,3],[B.A1,3.5],[B.B1,4],
      [B.E1,5],[B.G1,5.5],[B.A1,6],[B.G1,6.5],
      [B.D2,7],[B.A1,7.5],[B.E1,8],
    ]),
  },
  {
    slug: 'b4-g3-2', order: 11, instrument: 'bass4', grade: 3,
    name: 'Grade 3 — Chord Tone Arpeggio',
    description: 'Arpeggiate chords I-IV-V in A. Target chord tones for musical bass lines.',
    difficulty: 'hard', bpm: 80, xpReward: 275, requiredPlan: 'BASIC',
    notes: seq([
      [B.A1,1],[B.Cs3,2],[B.E2,3],[B.A2,4],   // A major
      [B.D2,5],[B.Fs2,6],[B.A2,7],[B.D3,8],   // D major
      [B.E2,9],[B.Gs2,10],[B.B2,11],[B.E3,12], // E major
      [B.A1,13],[B.E2,14],[B.A1,15],[B.A1,16],
    ]),
  },
  {
    slug: 'b4-g3-3', order: 12, instrument: 'bass4', grade: 3,
    name: 'Grade 3 — Jaco-Style Melody Bass',
    description: 'Melodic bass line covering full neck range. Fretless-inspired runs.',
    difficulty: 'hard', bpm: 88, xpReward: 300, requiredPlan: 'BASIC',
    notes: seq([
      [B.E1,1],[B.A1,2],[B.B1,3],[B.Cs3,4],
      [B.D2,5],[B.E2,6],[B.Fs2,7],[B.G2,8],
      [B.A2,9],[B.B2,10],[B.Cs3,11],[B.D3,12],
      [B.E3,13],[B.D3,14],[B.B2,15],[B.E1,16],
    ]),
  },

  // Grade 4
  {
    slug: 'b4-g4-1', order: 13, instrument: 'bass4', grade: 4,
    name: 'Grade 4 — Two-Octave Major Scale',
    description: 'E major scale across two octaves. Full neck position shifting.',
    difficulty: 'hard', bpm: 88, xpReward: 300, requiredPlan: 'PRO',
    notes: seq([
      [B.E1,1],[B.Fs1,2],[B.Gs1,3],[B.A1,4],
      [B.B1,5],[B.Cs3,6],[B.Ds3,7],[B.E2,8],
      [B.Fs2,9],[B.Gs2,10],[B.A2,11],[B.B2,12],
      [B.Cs3,13],[B.Ds3,14],[B.E3,15],
      [B.Ds3,16],[B.Cs3,17],[B.B2,18],[B.A2,19],
      [B.Gs2,20],[B.Fs2,21],[B.E2,22],
      [B.Ds3,23],[B.Cs3,24],[B.B1,25],[B.A1,26],
      [B.Gs1,27],[B.Fs1,28],[B.E1,29],
    ]),
  },
  {
    slug: 'b4-g4-2', order: 14, instrument: 'bass4', grade: 4,
    name: 'Grade 4 — ii-V-I Walking Bass',
    description: 'Jazz walking bass over ii-V-I in multiple keys. Chromatic approach notes.',
    difficulty: 'hard', bpm: 92, xpReward: 325, requiredPlan: 'PRO',
    notes: seq([
      // ii-V-I in C
      [B.D2,1],[B.E2,2],[B.F2,3],[B.Cs3,4],   // Dm7
      [B.G2,5],[B.A2,6],[B.B2,7],[B.Gs2,8],    // G7
      [B.C3,9],[B.B2,10],[B.A2,11],[B.G2,12],  // Cmaj7
      [B.E2,13],[B.D2,14],[B.C2,15],[B.D2,16], // turnaround
    ]),
  },

  // Grade 5
  {
    slug: 'b4-g5-1', order: 15, instrument: 'bass4', grade: 5,
    name: 'Grade 5 — Advanced Slap Groove',
    description: 'Complex slap bass pattern with ghost notes and double pops.',
    difficulty: 'expert', bpm: 100, xpReward: 450, requiredPlan: 'PRO',
    notes: seq([
      [B.E1,1],[B.G1,1.25],[B.E1,1.5],[B.A1,2],
      [B.E1,2.25],[B.G1,2.5],[B.D2,3],[B.E1,3.25],
      [B.G1,3.5],[B.A1,4],[B.B1,4.25],[B.A1,4.5],
      [B.G1,5],[B.E1,5.5],[B.G1,6],[B.A1,6.5],
      [B.E1,7],[B.G1,7.25],[B.A1,7.5],[B.B1,8],
    ]),
  },
  {
    slug: 'b4-g5-2', order: 16, instrument: 'bass4', grade: 5,
    name: 'Grade 5 — Full Neck Improvisation',
    description: 'Bass solo using full neck in E. All positions connected.',
    difficulty: 'expert', bpm: 95, xpReward: 500, requiredPlan: 'PRO',
    notes: seq([
      [B.E1,1],[B.G1,2],[B.A1,3],[B.B1,4],
      [B.D2,5],[B.E2,6],[B.G2,7],[B.A2,8],
      [B.B2,9],[B.D3,10],[B.E3,11],[B.D3,12],
      [B.B2,13],[B.A2,14],[B.G2,15],[B.E2,16],
      [B.D2,17],[B.B1,18],[B.A1,19],[B.G1,20],
      [B.E1,21],[B.E1,22],[B.E1,23],[B.E1,24],
    ]),
  },
]

// ── 5-String Bass Lessons ─────────────────────────────────────
export const BASS5_LESSONS = [
  // Grade 1
  {
    slug: 'b5-g1-1', order: 1, instrument: 'bass5', grade: 1,
    name: 'Grade 1 — Open Strings (B E A D G)',
    description: 'All 5 open strings. B0 E1 A1 D2 G2. The extra low B extends range.',
    difficulty: 'easy', bpm: 60, xpReward: 50, requiredPlan: 'FREE',
    notes: seq([
      [B.B0,1],[B.E1,2],[B.A1,3],[B.D2,4],[B.G2,5],
      [B.G2,6],[B.D2,7],[B.A1,8],[B.E1,9],[B.B0,10],
      [B.B0,11],[B.B0,12],[B.E1,13],[B.E1,14],[B.A1,15],[B.A1,16],
    ]),
  },
  {
    slug: 'b5-g1-2', order: 2, instrument: 'bass5', grade: 1,
    name: 'Grade 1 — Low B String Exercises',
    description: 'Exercises using the low B string. B0 C1 C#1 D1 Eb1 E1.',
    difficulty: 'easy', bpm: 63, xpReward: 75, requiredPlan: 'FREE',
    notes: seq([
      [B.B0,1],[B.C1,2],[B.Cs1,3],[B.D1,4],
      [B.Ds1,5],[B.E1,6],[B.F1,7],[B.Fs1,8],
      [B.Fs1,9],[B.F1,10],[B.E1,11],[B.Ds1,12],
      [B.D1,13],[B.Cs1,14],[B.C1,15],[B.B0,16],
    ]),
  },
  {
    slug: 'b5-g1-3', order: 3, instrument: 'bass5', grade: 1,
    name: 'Grade 1 — B Major Scale (Low B String)',
    description: 'B major scale using the low B string. Extended range bass scale.',
    difficulty: 'easy', bpm: 66, xpReward: 75, requiredPlan: 'FREE',
    notes: seq([
      [B.B0,1],[B.Cs1,2],[B.Ds1,3],[B.E1,4],
      [B.Fs1,5],[B.Gs1,6],[B.As1,7],[B.B1,8],
      [B.As1,9],[B.Gs1,10],[B.Fs1,11],[B.E1,12],
      [B.Ds1,13],[B.Cs1,14],[B.B0,15],
    ]),
  },
  {
    slug: 'b5-g1-4', order: 4, instrument: 'bass5', grade: 1,
    name: 'Grade 1 — Extended Range Root Notes',
    description: 'Root notes using all 5 strings. B E A D G roots in I-IV-V.',
    difficulty: 'easy', bpm: 70, xpReward: 100, requiredPlan: 'FREE',
    notes: seq([
      [B.B0,1],[B.B0,2],[B.B0,3],[B.B0,4],   // B root
      [B.E1,5],[B.E1,6],[B.E1,7],[B.E1,8],   // E root
      [B.Fs1,9],[B.Fs1,10],[B.Fs1,11],[B.Fs1,12], // F# root
      [B.B0,13],[B.B0,14],[B.B0,15],[B.B0,16], // back to B
    ]),
  },
  {
    slug: 'b5-g1-5', order: 5, instrument: 'bass5', grade: 1,
    name: 'Grade 1 — Pentatonic Across All Strings',
    description: 'B minor pentatonic using all 5 strings. Full range pentatonic.',
    difficulty: 'easy', bpm: 72, xpReward: 100, requiredPlan: 'FREE',
    notes: seq([
      [B.B0,1],[B.D1,2],[B.E1,3],[B.Fs1,4],
      [B.A1,5],[B.B1,6],[B.D2,7],[B.E2,8],
      [B.Fs2,9],[B.A2,10],[B.B2,11],[B.A2,12],
      [B.Fs2,13],[B.E2,14],[B.D2,15],[B.B1,16],
      [B.A1,17],[B.Fs1,18],[B.E1,19],[B.D1,20],[B.B0,21],
    ]),
  },

  // Grade 2
  {
    slug: 'b5-g2-1', order: 6, instrument: 'bass5', grade: 2,
    name: 'Grade 2 — Drop Tuning Riff (Low B)',
    description: 'Heavy riff using the low B string. Modern metal and rock technique.',
    difficulty: 'medium', bpm: 85, xpReward: 150, requiredPlan: 'BASIC',
    notes: seq([
      [B.B0,1],[B.B0,1.5],[B.D1,2],[B.E1,2.5],
      [B.B0,3],[B.B0,3.5],[B.G1,4],
      [B.B0,5],[B.B0,5.5],[B.D1,6],[B.E1,6.5],
      [B.Fs1,7],[B.E1,7.5],[B.B0,8],
    ]),
  },
  {
    slug: 'b5-g2-2', order: 7, instrument: 'bass5', grade: 2,
    name: 'Grade 2 — Extended Walking Bass',
    description: 'Walking bass using low B string. Expanded harmonic range.',
    difficulty: 'medium', bpm: 80, xpReward: 175, requiredPlan: 'BASIC',
    notes: seq([
      [B.B0,1],[B.Cs1,2],[B.Ds1,3],[B.E1,4],
      [B.A1,5],[B.B1,6],[B.Cs3,7],[B.D2,8],
      [B.Fs1,9],[B.Gs1,10],[B.A1,11],[B.B1,12],
      [B.E1,13],[B.D1,14],[B.Cs1,15],[B.B0,16],
    ]),
  },
  {
    slug: 'b5-g2-3', order: 8, instrument: 'bass5', grade: 2,
    name: 'Grade 2 — Funk Groove on 5-String',
    description: 'Funk bass groove exploiting full 5-string range.',
    difficulty: 'medium', bpm: 90, xpReward: 200, requiredPlan: 'BASIC',
    notes: seq([
      [B.E1,1],[B.G1,1.5],[B.A1,2],[B.G1,2.5],
      [B.B0,3],[B.D1,3.5],[B.E1,4],
      [B.E1,5],[B.G1,5.5],[B.A1,6],[B.B1,6.5],
      [B.D2,7],[B.B0,7.5],[B.E1,8],
    ]),
  },
  {
    slug: 'b5-g2-4', order: 9, instrument: 'bass5', grade: 2,
    name: 'Grade 2 — Two-Octave Pentatonic',
    description: 'E minor pentatonic covering 2.5 octaves on 5-string bass.',
    difficulty: 'medium', bpm: 85, xpReward: 200, requiredPlan: 'BASIC',
    notes: seq([
      [B.E1,1],[B.G1,2],[B.A1,3],[B.B1,4],
      [B.D2,5],[B.E2,6],[B.G2,7],[B.A2,8],
      [B.B2,9],[B.D3,10],[B.E3,11],[B.D3,12],
      [B.B2,13],[B.A2,14],[B.G2,15],[B.E2,16],
      [B.D2,17],[B.B1,18],[B.A1,19],[B.G1,20],[B.E1,21],
    ]),
  },

  // Grade 3
  {
    slug: 'b5-g3-1', order: 10, instrument: 'bass5', grade: 3,
    name: 'Grade 3 — Low B Power Riffs',
    description: 'Power riffs using low B as drone. Metal and progressive rock technique.',
    difficulty: 'hard', bpm: 90, xpReward: 275, requiredPlan: 'BASIC',
    notes: seq([
      [B.B0,1],[B.B0,2],[B.D1,3],[B.E1,4],
      [B.B0,5],[B.G1,6],[B.A1,7],[B.B1,8],
      [B.B0,9],[B.B0,10],[B.E1,11],[B.Fs1,12],
      [B.G1,13],[B.Fs1,14],[B.E1,15],[B.B0,16],
    ]),
  },
  {
    slug: 'b5-g3-2', order: 11, instrument: 'bass5', grade: 3,
    name: 'Grade 3 — Chord Tones Full Range',
    description: 'Arpeggio patterns across all 5 strings. B E A D G chord tones.',
    difficulty: 'hard', bpm: 82, xpReward: 300, requiredPlan: 'BASIC',
    notes: seq([
      [B.B0,1],[B.Ds1,2],[B.Fs1,3],[B.B1,4],  // B major
      [B.E1,5],[B.Gs1,6],[B.B1,7],[B.E2,8],   // E major
      [B.Fs1,9],[B.As1,10],[B.Cs3,11],[B.Fs2,12], // F# major
      [B.B0,13],[B.Fs1,14],[B.B1,15],[B.Fs1,16],
    ]),
  },

  // Grade 4
  {
    slug: 'b5-g4-1', order: 12, instrument: 'bass5', grade: 4,
    name: 'Grade 4 — Three-Octave Major Scale',
    description: 'B major scale across 3 octaves on 5-string. Full neck mastery.',
    difficulty: 'hard', bpm: 80, xpReward: 350, requiredPlan: 'PRO',
    notes: seq([
      [B.B0,1],[B.Cs1,2],[B.Ds1,3],[B.E1,4],
      [B.Fs1,5],[B.Gs1,6],[B.As1,7],[B.B1,8],
      [B.Cs3,9],[B.Ds3,10],[B.E2,11],[B.Fs2,12],
      [B.Gs2,13],[B.As2,14],[B.B2,15],
      [B.Cs3,16],[B.Ds3,17],[B.E3,18],[B.B2,19],
      [B.As2,20],[B.Gs2,21],[B.Fs2,22],[B.E2,23],
      [B.Ds3,24],[B.Cs3,25],[B.B1,26],[B.As1,27],
      [B.Gs1,28],[B.Fs1,29],[B.E1,30],[B.Ds1,31],
      [B.Cs1,32],[B.B0,33],
    ]),
  },
  {
    slug: 'b5-g4-2', order: 13, instrument: 'bass5', grade: 4,
    name: 'Grade 4 — Extended ii-V-I Jazz',
    description: 'Jazz walking bass in multiple keys using low B for extensions.',
    difficulty: 'hard', bpm: 88, xpReward: 375, requiredPlan: 'PRO',
    notes: seq([
      // ii-V-I in B
      [B.Cs3,1],[B.D1,2],[B.E1,3],[B.As1,4],  // C#m7
      [B.Fs1,5],[B.Gs1,6],[B.As1,7],[B.E1,8], // F#7
      [B.B0,9],[B.Cs1,10],[B.Ds1,11],[B.E1,12], // Bmaj7
      [B.Gs1,13],[B.Fs1,14],[B.E1,15],[B.B0,16],
    ]),
  },

  // Grade 5
  {
    slug: 'b5-g5-1', order: 14, instrument: 'bass5', grade: 5,
    name: 'Grade 5 — Extended Slap on 5-String',
    description: 'Advanced slap bass using all 5 strings. Low B pops and thumb slaps.',
    difficulty: 'expert', bpm: 95, xpReward: 500, requiredPlan: 'PRO',
    notes: seq([
      [B.B0,1],[B.E1,1.25],[B.B0,1.5],[B.G1,2],
      [B.B0,2.25],[B.D1,2.5],[B.E1,3],[B.G1,3.25],
      [B.A1,3.5],[B.E1,4],[B.B0,4.25],[B.E1,4.5],
      [B.G1,5],[B.A1,5.25],[B.B1,5.5],[B.D2,6],
      [B.E2,6.25],[B.D2,6.5],[B.B1,7],[B.G1,7.5],
      [B.E1,8],[B.B0,8.5],
    ]),
  },
  {
    slug: 'b5-g5-2', order: 15, instrument: 'bass5', grade: 5,
    name: 'Grade 5 — Full Range Solo',
    description: 'Bass solo covering entire 5-string range B0 to E3.',
    difficulty: 'expert', bpm: 90, xpReward: 550, requiredPlan: 'PRO',
    notes: seq([
      [B.B0,1],[B.E1,2],[B.A1,3],[B.D2,4],
      [B.G2,5],[B.A2,6],[B.B2,7],[B.D3,8],
      [B.E3,9],[B.D3,10],[B.B2,11],[B.G2,12],
      [B.D2,13],[B.A1,14],[B.E1,15],[B.B0,16],
      [B.E1,17],[B.Gs1,18],[B.B1,19],[B.E2,20],
      [B.Gs2,21],[B.B2,22],[B.E3,23],[B.B0,24],
    ]),
  },
]
