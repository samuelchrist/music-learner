import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const n = (note: number, beat: number, duration: number, label: string) => ({
  note, beat, duration, label, isRest: false
})
const r = (beat: number, duration: number) => ({
  note: 0, beat, duration, label: 'rest', isRest: true
})

// MIDI note constants
const C4=60,D4=62,E4=64,F4=65,G4=67,A4=69,B4=71
const C5=72,D5=74,E5=76,F5=77,G5=79,A5=81,B5=83
const C3=48,D3=50,E3=52,F3=53,G3=55,A3=57,B3=59
const Cs5=73,Eb5=75,Fs4=66,Gs4=68,Bb4=70,Cs4=61,Gs3=56,Fs3=54

export async function seedPianoLessons() {
  console.log('🎹 Seeding piano lessons...')

  // Clear existing piano lessons
  await prisma.lesson.deleteMany({ where: { instrument: 'piano' } })

  const lessons = [

    // ─────────────────────────────────────────────
    // ABRSM — Grade 1 (easy, FREE)
    // ─────────────────────────────────────────────
    {
      name: 'Ode to Joy',
      description: 'Beethoven\'s famous melody — perfect first piece',
      instrument: 'piano', difficulty: 'easy', bpm: 90,
      order: 1, xpReward: 100,
      category: 'abrsm', subcategory: 'grade1',
      composer: 'Beethoven', songTitle: 'Ode to Joy', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(E4,1,1,'E4'), n(E4,2,1,'E4'), n(F4,3,1,'F4'), n(G4,4,1,'G4'),
        n(G4,5,1,'G4'), n(F4,6,1,'F4'), n(E4,7,1,'E4'), n(D4,8,1,'D4'),
        n(C4,9,1,'C4'), n(C4,10,1,'C4'), n(D4,11,1,'D4'), n(E4,12,1,'E4'),
        n(E4,13,2,'E4'), n(D4,15,2,'D4'),
        n(E4,17,1,'E4'), n(E4,18,1,'E4'), n(F4,19,1,'F4'), n(G4,20,1,'G4'),
        n(G4,21,1,'G4'), n(F4,22,1,'F4'), n(E4,23,1,'E4'), n(D4,24,1,'D4'),
        n(C4,25,1,'C4'), n(C4,26,1,'C4'), n(D4,27,1,'D4'), n(E4,28,1,'E4'),
        n(D4,29,2,'D4'), n(C4,31,2,'C4'),
      ]
    },
    {
      name: 'Mary Had a Little Lamb',
      description: 'Classic nursery rhyme to practice E D C hand position',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 2, xpReward: 100,
      category: 'abrsm', subcategory: 'grade1',
      composer: 'Traditional', songTitle: 'Mary Had a Little Lamb', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(E4,1,1,'E4'), n(D4,2,1,'D4'), n(C4,3,1,'C4'), n(D4,4,1,'D4'),
        n(E4,5,1,'E4'), n(E4,6,1,'E4'), n(E4,7,2,'E4'),
        n(D4,9,1,'D4'), n(D4,10,1,'D4'), n(D4,11,2,'D4'),
        n(E4,13,1,'E4'), n(G4,14,1,'G4'), n(G4,15,2,'G4'),
        n(E4,17,1,'E4'), n(D4,18,1,'D4'), n(C4,19,1,'C4'), n(D4,20,1,'D4'),
        n(E4,21,1,'E4'), n(E4,22,1,'E4'), n(E4,23,1,'E4'), n(E4,24,1,'E4'),
        n(D4,25,1,'D4'), n(D4,26,1,'D4'), n(E4,27,1,'E4'), n(D4,28,1,'D4'),
        n(C4,29,4,'C4'),
      ]
    },
    {
      name: 'Hot Cross Buns',
      description: 'Three-note song to build finger independence',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 3, xpReward: 100,
      category: 'abrsm', subcategory: 'grade1',
      composer: 'Traditional', songTitle: 'Hot Cross Buns', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(E4,1,1,'E4'), n(D4,2,1,'D4'), n(C4,3,2,'C4'),
        n(E4,5,1,'E4'), n(D4,6,1,'D4'), n(C4,7,2,'C4'),
        n(C4,9,1,'C4'), n(C4,10,1,'C4'), n(C4,11,1,'C4'), n(C4,12,1,'C4'),
        n(D4,13,1,'D4'), n(D4,14,1,'D4'), n(D4,15,1,'D4'), n(D4,16,1,'D4'),
        n(E4,17,1,'E4'), n(D4,18,1,'D4'), n(C4,19,2,'C4'),
      ]
    },
    {
      name: 'Twinkle Twinkle Little Star',
      description: 'Build confidence with this beloved melody',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 4, xpReward: 100,
      category: 'abrsm', subcategory: 'grade1',
      composer: 'Traditional', songTitle: 'Twinkle Twinkle', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(C4,1,1,'C4'), n(C4,2,1,'C4'), n(G4,3,1,'G4'), n(G4,4,1,'G4'),
        n(A4,5,1,'A4'), n(A4,6,1,'A4'), n(G4,7,2,'G4'),
        n(F4,9,1,'F4'), n(F4,10,1,'F4'), n(E4,11,1,'E4'), n(E4,12,1,'E4'),
        n(D4,13,1,'D4'), n(D4,14,1,'D4'), n(C4,15,2,'C4'),
        n(G4,17,1,'G4'), n(G4,18,1,'G4'), n(F4,19,1,'F4'), n(F4,20,1,'F4'),
        n(E4,21,1,'E4'), n(E4,22,1,'E4'), n(D4,23,2,'D4'),
        n(G4,25,1,'G4'), n(G4,26,1,'G4'), n(F4,27,1,'F4'), n(F4,28,1,'F4'),
        n(E4,29,1,'E4'), n(E4,30,1,'E4'), n(D4,31,2,'D4'),
        n(C4,33,1,'C4'), n(C4,34,1,'C4'), n(G4,35,1,'G4'), n(G4,36,1,'G4'),
        n(A4,37,1,'A4'), n(A4,38,1,'A4'), n(G4,39,2,'G4'),
        n(F4,41,1,'F4'), n(F4,42,1,'F4'), n(E4,43,1,'E4'), n(E4,44,1,'E4'),
        n(D4,45,1,'D4'), n(D4,46,1,'D4'), n(C4,47,2,'C4'),
      ]
    },
    {
      name: 'Lightly Row',
      description: 'Classic ABRSM Grade 1 piece with simple phrasing',
      instrument: 'piano', difficulty: 'easy', bpm: 90,
      order: 5, xpReward: 120,
      category: 'abrsm', subcategory: 'grade1',
      composer: 'Traditional', songTitle: 'Lightly Row', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(E4,1,2,'E4'), n(D4,3,2,'D4'), n(C4,5,2,'C4'), n(D4,7,2,'D4'),
        n(E4,9,1,'E4'), n(E4,10,1,'E4'), n(E4,11,2,'E4'),
        n(D4,13,1,'D4'), n(D4,14,1,'D4'), n(D4,15,2,'D4'),
        n(E4,17,1,'E4'), n(G4,18,1,'G4'), n(G4,19,2,'G4'),
        n(E4,21,2,'E4'), n(D4,23,2,'D4'), n(C4,25,2,'C4'), n(D4,27,2,'D4'),
        n(E4,29,1,'E4'), n(E4,30,1,'E4'), n(E4,31,1,'E4'), n(E4,32,1,'E4'),
        n(D4,33,1,'D4'), n(D4,34,1,'D4'), n(E4,35,1,'E4'), n(D4,36,1,'D4'),
        n(C4,37,4,'C4'),
      ]
    },

    // ─────────────────────────────────────────────
    // ABRSM — Grade 2 (easy, FREE)
    // ─────────────────────────────────────────────
    {
      name: 'Minuet in G',
      description: 'Bach\'s elegant minuet in 3/4 time',
      instrument: 'piano', difficulty: 'easy', bpm: 120,
      order: 6, xpReward: 150,
      category: 'abrsm', subcategory: 'grade2',
      composer: 'Bach', songTitle: 'Minuet in G Major', keySignature: 'G',
      requiredPlan: 'FREE',
      notes: [
        n(D5,1,1,'D5'), n(G4,2,1,'G4'), n(A4,3,1,'A4'),
        n(B4,4,1,'B4'), n(C5,5,1,'C5'), n(D5,6,1,'D5'),
        n(G4,7,2,'G4'), r(9,1),
        n(E5,10,1,'E5'), n(C5,11,1,'C5'), n(D5,12,1,'D5'),
        n(E5,13,1,'E5'), n(Fs4,14,1,'F#4'), n(G4,15,1,'G4'),
        n(A4,16,3,'A4'),
        n(D5,19,1,'D5'), n(G4,20,1,'G4'), n(A4,21,1,'A4'),
        n(B4,22,1,'B4'), n(C5,23,1,'C5'), n(D5,24,1,'D5'),
        n(G4,25,1,'G4'), n(A4,26,1,'A4'), n(B4,27,1,'B4'),
        n(C5,28,1,'C5'), n(D5,29,1,'D5'), n(E5,30,1,'E5'),
        n(D5,31,3,'D5'),
      ]
    },
    {
      name: 'Going Home (Largo)',
      description: 'Dvořák\'s beautiful slow melody from New World Symphony',
      instrument: 'piano', difficulty: 'easy', bpm: 72,
      order: 7, xpReward: 150,
      category: 'abrsm', subcategory: 'grade2',
      composer: 'Dvořák', songTitle: 'Going Home', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(E4,1,1,'E4'),
        n(G4,2,2,'G4'), n(E4,4,1,'E4'), n(D4,5,2,'D4'), n(C4,7,2,'C4'),
        n(D4,9,4,'D4'),
        n(E4,13,1,'E4'), n(G4,14,2,'G4'), n(E4,16,1,'E4'),
        n(G4,17,2,'G4'), n(A4,19,2,'A4'), n(G4,21,4,'G4'),
        n(E4,25,1,'E4'), n(G4,26,2,'G4'), n(E4,28,1,'E4'),
        n(D4,29,2,'D4'), n(C4,31,2,'C4'), n(D4,33,2,'D4'),
        n(C4,35,4,'C4'),
      ]
    },
    {
      name: 'Long Long Ago',
      description: 'Gentle melody to develop smooth phrasing',
      instrument: 'piano', difficulty: 'easy', bpm: 88,
      order: 8, xpReward: 150,
      category: 'abrsm', subcategory: 'grade2',
      composer: 'Bayly', songTitle: 'Long Long Ago', keySignature: 'G',
      requiredPlan: 'FREE',
      notes: [
        n(G4,1,1,'G4'), n(E4,2,2,'E4'), n(E4,4,1,'E4'),
        n(F4,5,1,'F4'), n(D4,6,2,'D4'), n(D4,8,1,'D4'),
        n(C4,9,1,'C4'), n(D4,10,1,'D4'), n(E4,11,1,'E4'), n(F4,12,1,'F4'),
        n(E4,13,2,'E4'), n(C4,15,2,'C4'),
        n(G4,17,1,'G4'), n(E4,18,2,'E4'), n(E4,20,1,'E4'),
        n(F4,21,1,'F4'), n(D4,22,2,'D4'), n(D4,24,1,'D4'),
        n(C4,25,1,'C4'), n(E4,26,1,'E4'), n(G4,27,1,'G4'), n(G4,28,1,'G4'),
        n(E4,29,4,'E4'),
      ]
    },

    // ─────────────────────────────────────────────
    // ABRSM — Grade 3 (medium, BASIC)
    // ─────────────────────────────────────────────
    {
      name: 'Für Elise',
      description: 'Beethoven\'s iconic piece — intro theme',
      instrument: 'piano', difficulty: 'medium', bpm: 120,
      order: 9, xpReward: 200,
      category: 'abrsm', subcategory: 'grade3',
      composer: 'Beethoven', songTitle: 'Für Elise', keySignature: 'Am',
      requiredPlan: 'BASIC',
      notes: [
        n(E5,1,0.5,'E5'), n(Eb5,1.5,0.5,'Eb5'), n(E5,2,0.5,'E5'), n(Eb5,2.5,0.5,'Eb5'),
        n(E5,3,0.5,'E5'), n(B4,3.5,0.5,'B4'), n(D5,4,0.5,'D5'), n(C5,4.5,0.5,'C5'),
        n(A4,5,1,'A4'), r(6,0.5),
        n(C4,6.5,0.5,'C4'), n(E4,7,0.5,'E4'), n(A4,7.5,0.5,'A4'),
        n(B4,8,1,'B4'), r(9,0.5),
        n(E4,9.5,0.5,'E4'), n(Gs4,10,0.5,'G#4'), n(B4,10.5,0.5,'B4'),
        n(C5,11,1,'C5'), r(12,0.5),
        n(E4,12.5,0.5,'E4'),
        n(E5,13,0.5,'E5'), n(Eb5,13.5,0.5,'Eb5'), n(E5,14,0.5,'E5'), n(Eb5,14.5,0.5,'Eb5'),
        n(E5,15,0.5,'E5'), n(B4,15.5,0.5,'B4'), n(D5,16,0.5,'D5'), n(C5,16.5,0.5,'C5'),
        n(A4,17,1,'A4'), r(18,0.5),
        n(C4,18.5,0.5,'C4'), n(E4,19,0.5,'E4'), n(A4,19.5,0.5,'A4'),
        n(B4,20,1,'B4'), r(21,0.5),
        n(E4,21.5,0.5,'E4'), n(C5,22,0.5,'C5'), n(B4,22.5,0.5,'B4'),
        n(A4,23,2,'A4'),
      ]
    },
    {
      name: 'Greensleeves',
      description: 'English folk song in A minor, 3/4 time',
      instrument: 'piano', difficulty: 'medium', bpm: 108,
      order: 10, xpReward: 200,
      category: 'abrsm', subcategory: 'grade3',
      composer: 'Traditional', songTitle: 'Greensleeves', keySignature: 'Am',
      requiredPlan: 'BASIC',
      notes: [
        n(A4,1,1,'A4'),
        n(C5,2,2,'C5'), n(D5,4,1,'D5'),
        n(E5,5,1.5,'E5'), n(D5,6.5,0.5,'D5'), n(C5,7,1,'C5'),
        n(A4,8,2,'A4'), n(A4,10,1,'A4'),
        n(Gs4,11,1.5,'G#4'), n(B4,12.5,0.5,'B4'), n(B4,13,1,'B4'),
        n(Gs4,14,2,'G#4'), n(Fs4,16,1,'F#4'),
        n(Gs4,17,1.5,'G#4'), n(A4,18.5,0.5,'A4'), n(B4,19,1,'B4'),
        n(E4,20,2,'E4'), n(A4,22,1,'A4'),
        n(C5,23,2,'C5'), n(D5,25,1,'D5'),
        n(E5,26,1.5,'E5'), n(D5,27.5,0.5,'D5'), n(C5,28,1,'C5'),
        n(A4,29,2,'A4'), n(A4,31,1,'A4'),
        n(Gs4,32,1,'G#4'), n(B4,33,1,'B4'), n(Gs4,34,1,'G#4'),
        n(E4,35,3,'E4'),
      ]
    },
    {
      name: 'Scarborough Fair',
      description: 'Dorian mode melody — introduces modal scales',
      instrument: 'piano', difficulty: 'medium', bpm: 100,
      order: 11, xpReward: 200,
      category: 'abrsm', subcategory: 'grade3',
      composer: 'Traditional', songTitle: 'Scarborough Fair', keySignature: 'Dm',
      requiredPlan: 'BASIC',
      notes: [
        n(A4,1,2,'A4'), n(C5,3,1,'C5'),
        n(D5,4,3,'D5'),
        n(D5,7,1,'D5'), n(E5,8,1,'E5'), n(F5,9,1,'F5'),
        n(E5,10,3,'E5'),
        n(E5,13,1,'E5'), n(D5,14,1,'D5'), n(C5,15,1,'C5'),
        n(B4,16,3,'B4'),
        n(A4,19,2,'A4'), n(C5,21,1,'C5'),
        n(D5,22,2,'D5'), n(E5,24,1,'E5'),
        n(A4,25,3,'A4'),
        n(A4,28,2,'A4'), n(B4,30,1,'B4'),
        n(C5,31,2,'C5'), n(B4,33,1,'B4'),
        n(A4,34,3,'A4'),
      ]
    },

    // ─────────────────────────────────────────────
    // ABRSM — Grade 4 (hard, PRO)
    // ─────────────────────────────────────────────
    {
      name: 'Moonlight Sonata (Opening)',
      description: 'Beethoven Op.27 No.2 — famous Adagio sostenuto melody',
      instrument: 'piano', difficulty: 'hard', bpm: 60,
      order: 12, xpReward: 300,
      category: 'abrsm', subcategory: 'grade4',
      composer: 'Beethoven', songTitle: 'Moonlight Sonata', keySignature: 'C#m',
      requiredPlan: 'PRO',
      notes: [
        n(Gs4,1,0.5,'G#4'), n(A4,1.5,0.5,'A4'), n(Gs4,2,0.5,'G#4'),
        n(E4,2.5,0.5,'E4'), n(Cs4,3,0.5,'C#4'), n(E4,3.5,0.5,'E4'),
        n(Gs4,4,0.5,'G#4'), n(A4,4.5,0.5,'A4'), n(B4,5,0.5,'B4'),
        n(A4,5.5,0.5,'A4'), n(Gs4,6,0.5,'G#4'), n(Fs4,6.5,0.5,'F#4'),
        n(E4,7,2,'E4'),
        n(Gs4,9,0.5,'G#4'), n(A4,9.5,0.5,'A4'), n(Gs4,10,0.5,'G#4'),
        n(E4,10.5,0.5,'E4'), n(Cs4,11,0.5,'C#4'), n(E4,11.5,0.5,'E4'),
        n(Gs4,12,0.5,'G#4'), n(Cs5,12.5,0.5,'C#5'), n(E5,13,2,'E5'),
        n(D5,15,0.5,'D5'), n(Cs5,15.5,0.5,'C#5'), n(B4,16,0.5,'B4'),
        n(A4,16.5,0.5,'A4'), n(Gs4,17,2,'G#4'),
      ]
    },
    {
      name: 'Turkish March',
      description: 'Mozart\'s Rondo alla Turca — energetic and fun',
      instrument: 'piano', difficulty: 'hard', bpm: 140,
      order: 13, xpReward: 300,
      category: 'abrsm', subcategory: 'grade4',
      composer: 'Mozart', songTitle: 'Turkish March', keySignature: 'Am',
      requiredPlan: 'PRO',
      notes: [
        n(A4,1,0.5,'A4'), n(Gs4,1.5,0.5,'G#4'),
        n(A4,2,0.5,'A4'), n(Gs4,2.5,0.5,'G#4'), n(A4,3,0.5,'A4'),
        n(E4,3.5,0.5,'E4'), n(C5,4,0.5,'C5'), n(B4,4.5,0.5,'B4'),
        n(A4,5,0.5,'A4'), n(B4,5.5,0.5,'B4'), n(C5,6,1,'C5'),
        n(D5,7,0.5,'D5'), n(E5,7.5,0.5,'E5'),
        n(A5,8,1,'A5'),
        n(A4,9,0.5,'A4'), n(Gs4,9.5,0.5,'G#4'),
        n(A4,10,0.5,'A4'), n(Gs4,10.5,0.5,'G#4'), n(A4,11,0.5,'A4'),
        n(E4,11.5,0.5,'E4'), n(C5,12,0.5,'C5'), n(B4,12.5,0.5,'B4'),
        n(A4,13,0.5,'A4'), n(B4,13.5,0.5,'B4'), n(C5,14,1,'C5'),
        n(B4,15,1,'B4'), n(A4,16,1,'A4'),
      ]
    },

    // ─────────────────────────────────────────────
    // ABRSM — Grade 5 (expert, PRO)
    // ─────────────────────────────────────────────
    {
      name: 'Prelude in C Major',
      description: 'Bach WTC Book 1 — arpeggiated chord study',
      instrument: 'piano', difficulty: 'expert', bpm: 120,
      order: 14, xpReward: 400,
      category: 'abrsm', subcategory: 'grade5',
      composer: 'Bach', songTitle: 'Prelude in C Major BWV 846', keySignature: 'C',
      requiredPlan: 'PRO',
      notes: [
        // Bar 1 C major arpeggio pattern
        n(C4,1,0.5,'C4'), n(E4,1.5,0.5,'E4'), n(G4,2,0.5,'G4'), n(C5,2.5,0.5,'C5'),
        n(E5,3,0.5,'E5'), n(C5,3.5,0.5,'C5'), n(G4,4,0.5,'G4'), n(E4,4.5,0.5,'E4'),
        // Bar 2 D minor
        n(D4,5,0.5,'D4'), n(A4,5.5,0.5,'A4'), n(D5,6,0.5,'D5'), n(F5,6.5,0.5,'F5'),
        n(A5,7,0.5,'A5'), n(F5,7.5,0.5,'F5'), n(D5,8,0.5,'D5'), n(A4,8.5,0.5,'A4'),
        // Bar 3 G7
        n(G3,9,0.5,'G3'), n(D4,9.5,0.5,'D4'), n(G4,10,0.5,'G4'), n(B4,10.5,0.5,'B4'),
        n(D5,11,0.5,'D5'), n(B4,11.5,0.5,'B4'), n(G4,12,0.5,'G4'), n(D4,12.5,0.5,'D4'),
        // Bar 4 C major
        n(C4,13,0.5,'C4'), n(E4,13.5,0.5,'E4'), n(G4,14,0.5,'G4'), n(C5,14.5,0.5,'C5'),
        n(E5,15,0.5,'E5'), n(C5,15.5,0.5,'C5'), n(G4,16,0.5,'G4'), n(E4,16.5,0.5,'E4'),
      ]
    },
    {
      name: 'Clair de Lune (Theme)',
      description: 'Debussy\'s impressionist masterpiece — main theme',
      instrument: 'piano', difficulty: 'expert', bpm: 66,
      order: 15, xpReward: 400,
      category: 'abrsm', subcategory: 'grade5',
      composer: 'Debussy', songTitle: 'Clair de Lune', keySignature: 'Db',
      requiredPlan: 'PRO',
      notes: [
        n(F4,1,1.5,'F4'), n(A4,2.5,0.5,'A4'), n(C5,3,1,'C5'), n(F5,4,2,'F5'),
        n(E5,6,1,'E5'), n(D5,7,1,'D5'), n(C5,8,1,'C5'),
        n(Bb4,9,1.5,'Bb4'), n(A4,10.5,0.5,'A4'), n(G4,11,1,'G4'), n(F4,12,2,'F4'),
        n(A4,14,1,'A4'), n(C5,15,1,'C5'), n(E5,16,1,'E5'),
        n(F5,17,2,'F5'), n(D5,19,1,'D5'), n(C5,20,1,'C5'),
        n(Bb4,21,1.5,'Bb4'), n(G4,22.5,0.5,'G4'), n(F4,23,2,'F4'),
        n(A4,25,1,'A4'), n(C5,26,1,'C5'), n(F5,27,2,'F5'),
        n(E5,29,1,'E5'), n(D5,30,1,'D5'), n(C5,31,2,'C5'),
      ]
    },

    // ─────────────────────────────────────────────
    // CLASSICAL — Baroque (medium, BASIC)
    // ─────────────────────────────────────────────
    {
      name: 'Air on the G String',
      description: 'Bach\'s serene melody arranged for solo piano',
      instrument: 'piano', difficulty: 'medium', bpm: 60,
      order: 16, xpReward: 220,
      category: 'classical', subcategory: 'baroque',
      composer: 'Bach', songTitle: 'Air on the G String', keySignature: 'D',
      requiredPlan: 'BASIC',
      notes: [
        n(D5,1,1,'D5'), n(C5,2,0.5,'C5'), n(B4,2.5,0.5,'B4'),
        n(A4,3,1,'A4'), n(G4,4,1,'G4'),
        n(Fs4,5,1,'F#4'), n(G4,6,1,'G4'), n(A4,7,2,'A4'),
        n(D5,9,1,'D5'), n(C5,10,0.5,'C5'), n(B4,10.5,0.5,'B4'),
        n(A4,11,1,'A4'), n(B4,12,1,'B4'),
        n(C5,13,1,'C5'), n(B4,14,1,'B4'), n(A4,15,2,'A4'),
        n(G4,17,1,'G4'), n(A4,18,1,'A4'), n(B4,19,1,'B4'), n(A4,20,1,'A4'),
        n(G4,21,2,'G4'), n(Fs4,23,2,'F#4'),
        n(G4,25,4,'G4'),
      ]
    },
    {
      name: 'Jesu, Joy of Man\'s Desiring',
      description: 'Bach\'s flowing triplet melody in G major',
      instrument: 'piano', difficulty: 'medium', bpm: 92,
      order: 17, xpReward: 220,
      category: 'classical', subcategory: 'baroque',
      composer: 'Bach', songTitle: 'Jesu Joy of Man\'s Desiring',
      requiredPlan: 'BASIC',
      notes: [
        n(B4,1,0.33,'B4'), n(C5,1.33,0.33,'C5'), n(D5,1.66,0.33,'D5'),
        n(B4,2,0.33,'B4'), n(D5,2.33,0.33,'D5'), n(G5,2.66,0.33,'G5'),
        n(Fs4,3,0.33,'F#4'), n(G4,3.33,0.33,'G4'), n(A4,3.66,0.33,'A4'),
        n(D5,4,1,'D5'),
        n(C5,5,0.33,'C5'), n(D5,5.33,0.33,'D5'), n(E5,5.66,0.33,'E5'),
        n(C5,6,0.33,'C5'), n(E5,6.33,0.33,'E5'), n(A5,6.66,0.33,'A5'),
        n(B4,7,0.33,'B4'), n(C5,7.33,0.33,'C5'), n(D5,7.66,0.33,'D5'),
        n(G4,8,1,'G4'),
        n(B4,9,0.33,'B4'), n(C5,9.33,0.33,'C5'), n(D5,9.66,0.33,'D5'),
        n(E5,10,0.33,'E5'), n(D5,10.33,0.33,'D5'), n(C5,10.66,0.33,'C5'),
        n(D5,11,0.33,'D5'), n(C5,11.33,0.33,'C5'), n(B4,11.66,0.33,'B4'),
        n(A4,12,1,'A4'),
      ]
    },

    // ─────────────────────────────────────────────
    // CLASSICAL — Romantic (hard, PRO)
    // ─────────────────────────────────────────────
    {
      name: 'Nocturne Op.9 No.2 (Theme)',
      description: 'Chopin\'s most beloved nocturne — singing melody',
      instrument: 'piano', difficulty: 'hard', bpm: 66,
      order: 18, xpReward: 320,
      category: 'classical', subcategory: 'romantic',
      composer: 'Chopin', songTitle: 'Nocturne Op.9 No.2', keySignature: 'Eb',
      requiredPlan: 'PRO',
      notes: [
        n(B4,1,1.5,'B4'), n(D5,2.5,0.5,'D5'), n(E5,3,1.5,'E5'),
        n(Fs4,4.5,0.5,'F#4'), n(Gs4,5,1,'G#4'),
        n(A4,6,2,'A4'),
        n(Gs4,8,1,'G#4'), n(A4,9,0.5,'A4'), n(B4,9.5,0.5,'B4'),
        n(Cs5,10,2,'C#5'),
        n(B4,12,1,'B4'), n(A4,13,1,'A4'),
        n(Gs4,14,2,'G#4'),
        n(E4,16,1,'E4'), n(Fs4,17,1,'F#4'), n(Gs4,18,1,'G#4'),
        n(A4,19,4,'A4'),
      ]
    },
    {
      name: 'Waltz in A Minor (Chopin)',
      description: 'Chopin\'s posthumous waltz in 3/4 time',
      instrument: 'piano', difficulty: 'hard', bpm: 132,
      order: 19, xpReward: 320,
      category: 'classical', subcategory: 'romantic',
      composer: 'Chopin', songTitle: 'Waltz in A Minor B.150', keySignature: 'Am',
      requiredPlan: 'PRO',
      notes: [
        n(A4,1,1,'A4'), n(C5,2,1,'C5'), n(B4,3,1,'B4'),
        n(A4,4,1,'A4'), n(E4,5,1,'E4'), r(6,1),
        n(F4,7,1,'F4'), n(A4,8,2,'A4'),
        n(E4,10,1,'E4'), n(C4,11,1,'C4'), r(12,1),
        n(A4,13,1,'A4'), n(C5,14,1,'C5'), n(B4,15,1,'B4'),
        n(A4,16,1,'A4'), n(E4,17,1,'E4'), r(18,1),
        n(G4,19,1,'G4'), n(B4,20,1,'B4'), n(E5,21,1,'E5'),
        n(A4,22,3,'A4'),
      ]
    },

    // ─────────────────────────────────────────────
    // JAZZ — Blues (medium, BASIC)
    // ─────────────────────────────────────────────
    {
      name: '12 Bar Blues in C',
      description: 'Master the classic blues progression in C major',
      instrument: 'piano', difficulty: 'medium', bpm: 100,
      order: 20, xpReward: 200,
      category: 'jazz', subcategory: 'blues',
      composer: 'Traditional', songTitle: '12 Bar Blues in C', keySignature: 'C',
      requiredPlan: 'BASIC',
      notes: [
        // Blues scale: C Eb F F# G Bb
        n(C4,1,0.5,'C4'), n(Eb5,1.5,0.5,'Eb4'), n(F4,2,0.5,'F4'),
        n(66,2.5,0.5,'F#4'), n(G4,3,0.5,'G4'), n(Bb4,3.5,0.5,'Bb4'),
        n(G4,4,1,'G4'),
        n(C4,5,0.5,'C4'), n(Eb5,5.5,0.5,'Eb4'), n(F4,6,0.5,'F4'),
        n(66,6.5,0.5,'F#4'), n(G4,7,1,'G4'),
        // IV chord (F)
        n(F4,9,0.5,'F4'), n(A4,9.5,0.5,'A4'), n(C5,10,0.5,'C5'),
        n(A4,10.5,0.5,'A4'), n(F4,11,1,'F4'),
        n(F4,13,0.5,'F4'), n(A4,13.5,0.5,'A4'), n(C5,14,0.5,'C5'),
        n(A4,14.5,0.5,'A4'), n(F4,15,1,'F4'),
        // I chord (C)
        n(C4,17,0.5,'C4'), n(E4,17.5,0.5,'E4'), n(G4,18,0.5,'G4'),
        n(E4,18.5,0.5,'E4'), n(C4,19,1,'C4'),
        // V chord (G7)
        n(G4,21,0.5,'G4'), n(B4,21.5,0.5,'B4'), n(D5,22,0.5,'D5'),
        n(B4,22.5,0.5,'B4'), n(G4,23,1,'G4'),
        n(C4,25,2,'C4'), n(G4,27,2,'G4'),
      ]
    },
    {
      name: 'Autumn Leaves',
      description: 'Jazz standard with ii-V-I progressions',
      instrument: 'piano', difficulty: 'medium', bpm: 110,
      order: 21, xpReward: 220,
      category: 'jazz', subcategory: 'jazz_standards',
      composer: 'Kosma', songTitle: 'Autumn Leaves', keySignature: 'Gm',
      requiredPlan: 'BASIC',
      notes: [
        // Cm / F7 / Bb / Eb / Am7b5 / D7 / Gm
        n(D5,1,1,'D5'), n(C5,2,1,'C5'), n(Bb4,3,1,'Bb4'), n(A4,4,1,'A4'),
        n(G4,5,2,'G4'), r(7,2),
        n(C5,9,1,'C5'), n(Bb4,10,1,'Bb4'), n(A4,11,1,'A4'), n(G4,12,1,'G4'),
        n(F4,13,2,'F4'), r(15,2),
        n(B4,17,1,'B4'), n(A4,18,1,'A4'), n(G4,19,1,'G4'), n(Fs4,20,1,'F#4'),
        n(E4,21,2,'E4'), r(23,2),
        n(A4,25,1,'A4'), n(G4,26,1,'G4'), n(Fs4,27,1,'F#4'), n(E4,28,1,'E4'),
        n(D4,29,4,'D4'),
      ]
    },
    {
      name: 'Fly Me to the Moon',
      description: 'Classic jazz standard — chord melody intro',
      instrument: 'piano', difficulty: 'hard', bpm: 120,
      order: 22, xpReward: 260,
      category: 'jazz', subcategory: 'jazz_standards',
      composer: 'Howard', songTitle: 'Fly Me to the Moon', keySignature: 'Am',
      requiredPlan: 'BASIC',
      notes: [
        n(A4,1,2,'A4'), n(B4,3,1,'B4'), n(C5,4,1,'C5'),
        n(D5,5,2,'D5'), n(C5,7,2,'C5'),
        n(B4,9,2,'B4'), n(A4,11,2,'A4'),
        n(G4,13,4,'G4'),
        n(F4,17,2,'F4'), n(G4,19,1,'G4'), n(A4,20,1,'A4'),
        n(Bb4,21,2,'Bb4'), n(A4,23,2,'A4'),
        n(G4,25,2,'G4'), n(F4,27,2,'F4'),
        n(E4,29,4,'E4'),
      ]
    },

    // ─────────────────────────────────────────────
    // POP (easy–medium, FREE–BASIC)
    // ─────────────────────────────────────────────
    {
      name: 'Happy Birthday',
      description: 'Everyone\'s favourite song — great for beginners',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 23, xpReward: 100,
      category: 'pop', subcategory: 'pop_beginner',
      composer: 'Traditional', songTitle: 'Happy Birthday', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(C4,1,0.75,'C4'), n(C4,1.75,0.25,'C4'), n(D4,2,1,'D4'),
        n(C4,3,1,'C4'), n(F4,4,1,'F4'), n(E4,5,2,'E4'),
        n(C4,7,0.75,'C4'), n(C4,7.75,0.25,'C4'), n(D4,8,1,'D4'),
        n(C4,9,1,'C4'), n(G4,10,1,'G4'), n(F4,11,2,'F4'),
        n(C4,13,0.75,'C4'), n(C4,13.75,0.25,'C4'), n(C5,14,1,'C5'),
        n(A4,15,1,'A4'), n(F4,16,1,'F4'), n(E4,17,1,'E4'), n(D4,18,2,'D4'),
        n(Bb4,20,0.75,'Bb4'), n(Bb4,20.75,0.25,'Bb4'), n(A4,21,1,'A4'),
        n(F4,22,1,'F4'), n(G4,23,1,'G4'), n(F4,24,2,'F4'),
      ]
    },
    {
      name: 'Let It Be',
      description: 'Beatles classic — C major chord melody',
      instrument: 'piano', difficulty: 'medium', bpm: 75,
      order: 24, xpReward: 180,
      category: 'pop', subcategory: 'pop_songs',
      composer: 'Lennon & McCartney', songTitle: 'Let It Be', keySignature: 'C',
      requiredPlan: 'BASIC',
      notes: [
        n(C4,1,2,'C4'), n(C4,3,1,'C4'), n(D4,4,1,'D4'),
        n(E4,5,2,'E4'), n(G4,7,2,'G4'),
        n(E4,9,1,'E4'), n(D4,10,1,'D4'), n(C4,11,2,'C4'),
        n(G3,13,2,'G3'), n(A3,15,2,'A3'),
        n(C4,17,2,'C4'), n(B3,19,1,'B3'), n(C4,20,1,'C4'),
        n(D4,21,2,'D4'), n(E4,23,2,'E4'),
        n(C4,25,4,'C4'),
      ]
    },
    {
      name: 'Clocks (Intro)',
      description: 'Coldplay piano riff — triplet arpeggios',
      instrument: 'piano', difficulty: 'medium', bpm: 130,
      order: 25, xpReward: 200,
      category: 'pop', subcategory: 'pop_songs',
      composer: 'Coldplay', songTitle: 'Clocks', keySignature: 'Eb',
      requiredPlan: 'BASIC',
      notes: [
        // Eb major: Eb G Bb
        n(75,1,0.33,'Eb5'), n(G4,1.33,0.33,'G4'), n(Bb4,1.66,0.33,'Bb4'),
        n(75,2,0.33,'Eb5'), n(G4,2.33,0.33,'G4'), n(Bb4,2.66,0.33,'Bb4'),
        n(75,3,0.33,'Eb5'), n(G4,3.33,0.33,'G4'), n(Bb4,3.66,0.33,'Bb4'),
        n(75,4,0.33,'Eb5'), n(G4,4.33,0.33,'G4'), n(Bb4,4.66,0.33,'Bb4'),
        // Bb major: Bb D F
        n(Bb4,5,0.33,'Bb4'), n(D4,5.33,0.33,'D4'), n(F4,5.66,0.33,'F4'),
        n(Bb4,6,0.33,'Bb4'), n(D4,6.33,0.33,'D4'), n(F4,6.66,0.33,'F4'),
        n(Bb4,7,0.33,'Bb4'), n(D4,7.33,0.33,'D4'), n(F4,7.66,0.33,'F4'),
        n(Bb4,8,0.33,'Bb4'), n(D4,8.33,0.33,'D4'), n(F4,8.66,0.33,'F4'),
        // F major: F A C
        n(F4,9,0.33,'F4'), n(A4,9.33,0.33,'A4'), n(C5,9.66,0.33,'C5'),
        n(F4,10,0.33,'F4'), n(A4,10.33,0.33,'A4'), n(C5,10.66,0.33,'C5'),
        n(F4,11,0.33,'F4'), n(A4,11.33,0.33,'A4'), n(C5,11.66,0.33,'C5'),
        n(F4,12,0.33,'F4'), n(A4,12.33,0.33,'A4'), n(C5,12.66,0.33,'C5'),
      ]
    },

    // ─────────────────────────────────────────────
    // EXERCISES — Hanon (easy, FREE)
    // ─────────────────────────────────────────────
    {
      name: 'Hanon Exercise No.1',
      description: 'Five-finger extension exercise — C major position',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 26, xpReward: 120,
      category: 'exercises', subcategory: 'hanon',
      composer: 'Hanon', songTitle: 'The Virtuoso Pianist No.1', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        // Ascending C pattern
        n(C4,1,0.5,'C4'), n(E4,1.5,0.5,'E4'), n(F4,2,0.5,'F4'), n(G4,2.5,0.5,'G4'),
        n(E4,3,0.5,'E4'), n(G4,3.5,0.5,'G4'), n(A4,4,0.5,'A4'), n(B4,4.5,0.5,'B4'),
        // D pattern
        n(D4,5,0.5,'D4'), n(Fs4,5.5,0.5,'F#4'), n(G4,6,0.5,'G4'), n(A4,6.5,0.5,'A4'),
        n(Fs4,7,0.5,'F#4'), n(A4,7.5,0.5,'A4'), n(B4,8,0.5,'B4'), n(C5,8.5,0.5,'C5'),
        // E pattern
        n(E4,9,0.5,'E4'), n(Gs4,9.5,0.5,'G#4'), n(A4,10,0.5,'A4'), n(B4,10.5,0.5,'B4'),
        n(Gs4,11,0.5,'G#4'), n(B4,11.5,0.5,'B4'), n(C5,12,0.5,'C5'), n(D5,12.5,0.5,'D5'),
        // Descending
        n(D5,13,0.5,'D5'), n(B4,13.5,0.5,'B4'), n(C5,14,0.5,'C5'), n(A4,14.5,0.5,'A4'),
        n(B4,15,0.5,'B4'), n(Gs4,15.5,0.5,'G#4'), n(A4,16,0.5,'A4'), n(E4,16.5,0.5,'E4'),
        n(A4,17,0.5,'A4'), n(Fs4,17.5,0.5,'F#4'), n(G4,18,0.5,'G4'), n(D4,18.5,0.5,'D4'),
        n(G4,19,0.5,'G4'), n(E4,19.5,0.5,'E4'), n(F4,20,0.5,'F4'), n(C4,20.5,0.5,'C4'),
        n(C4,21,2,'C4'),
      ]
    },
    {
      name: 'Hanon Exercise No.2',
      description: 'Five-finger contraction exercise — builds dexterity',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 27, xpReward: 120,
      category: 'exercises', subcategory: 'hanon',
      composer: 'Hanon', songTitle: 'The Virtuoso Pianist No.2', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(C4,1,0.5,'C4'), n(D4,1.5,0.5,'D4'), n(E4,2,0.5,'E4'), n(C4,2.5,0.5,'C4'),
        n(D4,3,0.5,'D4'), n(E4,3.5,0.5,'E4'), n(F4,4,0.5,'F4'), n(D4,4.5,0.5,'D4'),
        n(E4,5,0.5,'E4'), n(F4,5.5,0.5,'F4'), n(G4,6,0.5,'G4'), n(E4,6.5,0.5,'E4'),
        n(F4,7,0.5,'F4'), n(G4,7.5,0.5,'G4'), n(A4,8,0.5,'A4'), n(F4,8.5,0.5,'F4'),
        n(G4,9,0.5,'G4'), n(A4,9.5,0.5,'A4'), n(B4,10,0.5,'B4'), n(G4,10.5,0.5,'G4'),
        n(A4,11,0.5,'A4'), n(B4,11.5,0.5,'B4'), n(C5,12,0.5,'C5'), n(A4,12.5,0.5,'A4'),
        // Descending
        n(C5,13,0.5,'C5'), n(B4,13.5,0.5,'B4'), n(A4,14,0.5,'A4'), n(C5,14.5,0.5,'C5'),
        n(B4,15,0.5,'B4'), n(A4,15.5,0.5,'A4'), n(G4,16,0.5,'G4'), n(B4,16.5,0.5,'B4'),
        n(A4,17,0.5,'A4'), n(G4,17.5,0.5,'G4'), n(F4,18,0.5,'F4'), n(A4,18.5,0.5,'A4'),
        n(G4,19,0.5,'G4'), n(F4,19.5,0.5,'F4'), n(E4,20,0.5,'E4'), n(G4,20.5,0.5,'G4'),
        n(F4,21,0.5,'F4'), n(E4,21.5,0.5,'E4'), n(D4,22,0.5,'D4'), n(F4,22.5,0.5,'F4'),
        n(E4,23,0.5,'E4'), n(D4,23.5,0.5,'D4'), n(C4,24,2,'C4'),
      ]
    },
    {
      name: 'Hanon Exercise No.3',
      description: 'Wrist flexibility and evenness of touch',
      instrument: 'piano', difficulty: 'medium', bpm: 110,
      order: 28, xpReward: 150,
      category: 'exercises', subcategory: 'hanon',
      composer: 'Hanon', songTitle: 'The Virtuoso Pianist No.3', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(C4,1,0.5,'C4'), n(E4,1.5,0.5,'E4'), n(G4,2,0.5,'G4'), n(E4,2.5,0.5,'E4'),
        n(F4,3,0.5,'F4'), n(A4,3.5,0.5,'A4'), n(G4,4,0.5,'G4'), n(E4,4.5,0.5,'E4'),
        n(D4,5,0.5,'D4'), n(F4,5.5,0.5,'F4'), n(A4,6,0.5,'A4'), n(F4,6.5,0.5,'F4'),
        n(G4,7,0.5,'G4'), n(B4,7.5,0.5,'B4'), n(A4,8,0.5,'A4'), n(F4,8.5,0.5,'F4'),
        n(E4,9,0.5,'E4'), n(G4,9.5,0.5,'G4'), n(B4,10,0.5,'B4'), n(G4,10.5,0.5,'G4'),
        n(A4,11,0.5,'A4'), n(C5,11.5,0.5,'C5'), n(B4,12,0.5,'B4'), n(G4,12.5,0.5,'G4'),
        // Descend
        n(G4,13,0.5,'G4'), n(B4,13.5,0.5,'B4'), n(A4,14,0.5,'A4'), n(C5,14.5,0.5,'C5'),
        n(B4,15,0.5,'B4'), n(G4,15.5,0.5,'G4'), n(A4,16,0.5,'A4'), n(F4,16.5,0.5,'F4'),
        n(G4,17,0.5,'G4'), n(E4,17.5,0.5,'E4'), n(F4,18,0.5,'F4'), n(D4,18.5,0.5,'D4'),
        n(E4,19,0.5,'E4'), n(C4,19.5,0.5,'C4'), n(C4,20,2,'C4'),
      ]
    },

    // ─────────────────────────────────────────────
    // EXERCISES — Czerny (easy–medium, FREE–BASIC)
    // ─────────────────────────────────────────────
    {
      name: 'Czerny Op.599 No.1',
      description: 'C major scale and arpeggio study',
      instrument: 'piano', difficulty: 'easy', bpm: 110,
      order: 29, xpReward: 130,
      category: 'exercises', subcategory: 'czerny',
      composer: 'Czerny', songTitle: 'Practical Method Op.599 No.1', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        // Scale up
        n(C4,1,0.5,'C4'), n(D4,1.5,0.5,'D4'), n(E4,2,0.5,'E4'), n(F4,2.5,0.5,'F4'),
        n(G4,3,0.5,'G4'), n(A4,3.5,0.5,'A4'), n(B4,4,0.5,'B4'), n(C5,4.5,0.5,'C5'),
        // Scale down
        n(C5,5,0.5,'C5'), n(B4,5.5,0.5,'B4'), n(A4,6,0.5,'A4'), n(G4,6.5,0.5,'G4'),
        n(F4,7,0.5,'F4'), n(E4,7.5,0.5,'E4'), n(D4,8,0.5,'D4'), n(C4,8.5,0.5,'C4'),
        // Arpeggio up C-E-G-C
        n(C4,9,0.5,'C4'), n(E4,9.5,0.5,'E4'), n(G4,10,0.5,'G4'), n(C5,10.5,0.5,'C5'),
        n(E5,11,0.5,'E5'), n(C5,11.5,0.5,'C5'), n(G4,12,0.5,'G4'), n(E4,12.5,0.5,'E4'),
        n(C4,13,2,'C4'),
      ]
    },
    {
      name: 'Czerny Op.599 No.2',
      description: 'G major position and legato phrasing',
      instrument: 'piano', difficulty: 'easy', bpm: 110,
      order: 30, xpReward: 130,
      category: 'exercises', subcategory: 'czerny',
      composer: 'Czerny', songTitle: 'Practical Method Op.599 No.2', keySignature: 'G',
      requiredPlan: 'FREE',
      notes: [
        n(G4,1,0.5,'G4'), n(A4,1.5,0.5,'A4'), n(B4,2,0.5,'B4'), n(C5,2.5,0.5,'C5'),
        n(D5,3,0.5,'D5'), n(E5,3.5,0.5,'E5'), n(Fs4,4,0.5,'F#4'), n(G5,4.5,0.5,'G5'),
        n(G5,5,0.5,'G5'), n(Fs4,5.5,0.5,'F#4'), n(E5,6,0.5,'E5'), n(D5,6.5,0.5,'D5'),
        n(C5,7,0.5,'C5'), n(B4,7.5,0.5,'B4'), n(A4,8,0.5,'A4'), n(G4,8.5,0.5,'G4'),
        n(G4,9,0.5,'G4'), n(B4,9.5,0.5,'B4'), n(D5,10,0.5,'D5'), n(G5,10.5,0.5,'G5'),
        n(D5,11,0.5,'D5'), n(B4,11.5,0.5,'B4'), n(G4,12,2,'G4'),
      ]
    },
    {
      name: 'Czerny Op.849 No.1',
      description: 'School of Velocity — triplet coordination study',
      instrument: 'piano', difficulty: 'medium', bpm: 120,
      order: 31, xpReward: 180,
      category: 'exercises', subcategory: 'czerny',
      composer: 'Czerny', songTitle: 'School of Velocity Op.849 No.1', keySignature: 'C',
      requiredPlan: 'BASIC',
      notes: [
        n(C4,1,0.33,'C4'), n(D4,1.33,0.33,'D4'), n(E4,1.66,0.33,'E4'),
        n(F4,2,0.33,'F4'), n(G4,2.33,0.33,'G4'), n(A4,2.66,0.33,'A4'),
        n(G4,3,0.33,'G4'), n(F4,3.33,0.33,'F4'), n(E4,3.66,0.33,'E4'),
        n(F4,4,0.33,'F4'), n(E4,4.33,0.33,'E4'), n(D4,4.66,0.33,'D4'),
        n(E4,5,0.33,'E4'), n(F4,5.33,0.33,'F4'), n(G4,5.66,0.33,'G4'),
        n(A4,6,0.33,'A4'), n(B4,6.33,0.33,'B4'), n(C5,6.66,0.33,'C5'),
        n(B4,7,0.33,'B4'), n(A4,7.33,0.33,'A4'), n(G4,7.66,0.33,'G4'),
        n(A4,8,0.33,'A4'), n(G4,8.33,0.33,'G4'), n(F4,8.66,0.33,'F4'),
        n(G4,9,0.33,'G4'), n(A4,9.33,0.33,'A4'), n(B4,9.66,0.33,'B4'),
        n(C5,10,0.33,'C5'), n(D5,10.33,0.33,'D5'), n(E5,10.66,0.33,'E5'),
        n(D5,11,0.33,'D5'), n(C5,11.33,0.33,'C5'), n(B4,11.66,0.33,'B4'),
        n(C5,12,2,'C5'),
      ]
    },

    // ─────────────────────────────────────────────
    // EXERCISES — Scales (easy, FREE)
    // ─────────────────────────────────────────────
    {
      name: 'C Major Scale (2 Octaves)',
      description: 'Foundation of all piano playing — two octaves, hands alone',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 32, xpReward: 80,
      category: 'exercises', subcategory: 'scales_arpeggios',
      composer: 'MusicLearner', songTitle: 'C Major Scale', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        n(C4,1,0.5,'C4'), n(D4,1.5,0.5,'D4'), n(E4,2,0.5,'E4'), n(F4,2.5,0.5,'F4'),
        n(G4,3,0.5,'G4'), n(A4,3.5,0.5,'A4'), n(B4,4,0.5,'B4'), n(C5,4.5,0.5,'C5'),
        n(D5,5,0.5,'D5'), n(E5,5.5,0.5,'E5'), n(F5,6,0.5,'F5'), n(G5,6.5,0.5,'G5'),
        n(A5,7,0.5,'A5'), n(B5,7.5,0.5,'B5'), n(72+12,8,1,'C6'),
        // Descend
        n(B5,9,0.5,'B5'), n(A5,9.5,0.5,'A5'), n(G5,10,0.5,'G5'), n(F5,10.5,0.5,'F5'),
        n(E5,11,0.5,'E5'), n(D5,11.5,0.5,'D5'), n(C5,12,0.5,'C5'), n(B4,12.5,0.5,'B4'),
        n(A4,13,0.5,'A4'), n(G4,13.5,0.5,'G4'), n(F4,14,0.5,'F4'), n(E4,14.5,0.5,'E4'),
        n(D4,15,0.5,'D4'), n(C4,15.5,2,'C4'),
      ]
    },
    {
      name: 'G Major Scale',
      description: 'One sharp — F#. Essential scale for piano',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 33, xpReward: 80,
      category: 'exercises', subcategory: 'scales_arpeggios',
      composer: 'MusicLearner', songTitle: 'G Major Scale', keySignature: 'G',
      requiredPlan: 'FREE',
      notes: [
        n(G4,1,0.5,'G4'), n(A4,1.5,0.5,'A4'), n(B4,2,0.5,'B4'), n(C5,2.5,0.5,'C5'),
        n(D5,3,0.5,'D5'), n(E5,3.5,0.5,'E5'), n(Fs4+12,4,0.5,'F#5'), n(G5,4.5,0.5,'G5'),
        n(G5,5,0.5,'G5'), n(Fs4+12,5.5,0.5,'F#5'), n(E5,6,0.5,'E5'), n(D5,6.5,0.5,'D5'),
        n(C5,7,0.5,'C5'), n(B4,7.5,0.5,'B4'), n(A4,8,0.5,'A4'), n(G4,8.5,2,'G4'),
      ]
    },
    {
      name: 'A Natural Minor Scale',
      description: 'Relative minor of C — introduces minor tonality',
      instrument: 'piano', difficulty: 'easy', bpm: 100,
      order: 34, xpReward: 80,
      category: 'exercises', subcategory: 'scales_arpeggios',
      composer: 'MusicLearner', songTitle: 'A Minor Scale', keySignature: 'Am',
      requiredPlan: 'FREE',
      notes: [
        n(A4,1,0.5,'A4'), n(B4,1.5,0.5,'B4'), n(C5,2,0.5,'C5'), n(D5,2.5,0.5,'D5'),
        n(E5,3,0.5,'E5'), n(F5,3.5,0.5,'F5'), n(G5,4,0.5,'G5'), n(A5,4.5,0.5,'A5'),
        n(A5,5,0.5,'A5'), n(G5,5.5,0.5,'G5'), n(F5,6,0.5,'F5'), n(E5,6.5,0.5,'E5'),
        n(D5,7,0.5,'D5'), n(C5,7.5,0.5,'C5'), n(B4,8,0.5,'B4'), n(A4,8.5,2,'A4'),
      ]
    },

    // ─────────────────────────────────────────────
    // CUSTOM — MusicLearner Original (easy, FREE)
    // ─────────────────────────────────────────────
    {
      name: 'Chord Builder: I-IV-V-I',
      description: 'Master the most common chord progression in music',
      instrument: 'piano', difficulty: 'easy', bpm: 80,
      order: 35, xpReward: 120,
      category: 'custom', subcategory: 'theory_builder',
      composer: 'MusicLearner', songTitle: 'I-IV-V-I Progression', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        // C major arpeggio (I)
        n(C4,1,0.5,'C4'), n(E4,1.5,0.5,'E4'), n(G4,2,0.5,'G4'), n(C5,2.5,0.5,'C5'),
        n(G4,3,0.5,'G4'), n(E4,3.5,0.5,'E4'),
        // F major arpeggio (IV)
        n(F4,4,0.5,'F4'), n(A4,4.5,0.5,'A4'), n(C5,5,0.5,'C5'), n(F5,5.5,0.5,'F5'),
        n(C5,6,0.5,'C5'), n(A4,6.5,0.5,'A4'),
        // G major arpeggio (V)
        n(G4,7,0.5,'G4'), n(B4,7.5,0.5,'B4'), n(D5,8,0.5,'D5'), n(G5,8.5,0.5,'G5'),
        n(D5,9,0.5,'D5'), n(B4,9.5,0.5,'B4'),
        // C major (I resolve)
        n(C4,10,0.5,'C4'), n(E4,10.5,0.5,'E4'), n(G4,11,0.5,'G4'), n(C5,11.5,2,'C5'),
      ]
    },
    {
      name: 'Blues Scale Explorer',
      description: 'Learn the blues scale and improvise freely',
      instrument: 'piano', difficulty: 'medium', bpm: 90,
      order: 36, xpReward: 160,
      category: 'custom', subcategory: 'theory_builder',
      composer: 'MusicLearner', songTitle: 'Blues Scale in C', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        // C blues scale: C Eb F F# G Bb C
        n(C4,1,0.5,'C4'), n(75-12,1.5,0.5,'Eb4'), n(F4,2,0.5,'F4'),
        n(66,2.5,0.5,'F#4'), n(G4,3,0.5,'G4'), n(Bb4,3.5,0.5,'Bb4'), n(C5,4,1,'C5'),
        // Descend
        n(Bb4,5,0.5,'Bb4'), n(G4,5.5,0.5,'G4'), n(66,6,0.5,'F#4'),
        n(F4,6.5,0.5,'F4'), n(75-12,7,0.5,'Eb4'), n(C4,7.5,1,'C4'),
        // Riff pattern
        n(C4,9,0.5,'C4'), n(75-12,9.5,0.5,'Eb4'), n(C4,10,0.5,'C4'),
        n(G4,10.5,0.5,'G4'), n(Bb4,11,0.5,'Bb4'), n(G4,11.5,0.5,'G4'),
        n(C5,12,2,'C5'),
      ]
    },
    {
      name: 'Ear Training: Intervals',
      description: 'Recognise major 2nd, 3rd, 5th and octave by ear',
      instrument: 'piano', difficulty: 'easy', bpm: 70,
      order: 37, xpReward: 100,
      category: 'custom', subcategory: 'ear_training',
      composer: 'MusicLearner', songTitle: 'Interval Recognition', keySignature: 'C',
      requiredPlan: 'FREE',
      notes: [
        // Unison
        n(C4,1,1,'C4'), n(C4,2,1,'C4'),
        r(3,1),
        // Major 2nd
        n(C4,4,1,'C4'), n(D4,5,1,'D4'),
        r(6,1),
        // Major 3rd
        n(C4,7,1,'C4'), n(E4,8,1,'E4'),
        r(9,1),
        // Perfect 4th
        n(C4,10,1,'C4'), n(F4,11,1,'F4'),
        r(12,1),
        // Perfect 5th
        n(C4,13,1,'C4'), n(G4,14,1,'G4'),
        r(15,1),
        // Major 6th
        n(C4,16,1,'C4'), n(A4,17,1,'A4'),
        r(18,1),
        // Octave
        n(C4,19,1,'C4'), n(C5,20,1,'C5'),
        r(21,1),
      ]
    },

  ]

  // Insert all lessons
  let count = 0
  for (const lesson of lessons) {
    await prisma.lesson.create({ data: lesson as any })
    count++
  }

  console.log(`✅ Seeded ${count} piano lessons`)
}
