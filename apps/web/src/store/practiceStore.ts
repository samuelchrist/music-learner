import { create } from 'zustand'
import type { Lesson } from '@music-learner/shared'

type State = 'idle'|'countdown'|'playing'|'finished'

interface S {
  lesson:Lesson|null; sessionState:State; noteIndex:number
  bpm:number; metronomeOn:boolean; hits:number
  setLesson:(l:Lesson)=>void; setSessionState:(s:State)=>void
  setNoteIndex:(i:number)=>void; setBPM:(b:number)=>void
  toggleMetronome:()=>void; setMetronomeOn:(v:boolean)=>void; incrementHits:()=>void; reset:()=>void
}

export const usePracticeStore = create<S>()(set => ({
  lesson:null, sessionState:'idle', noteIndex:0, bpm:80, metronomeOn:false, hits:0,
  setLesson: l    => set({lesson:l, bpm:l.bpm}),
  setSessionState: s => set({sessionState:s}),
  setNoteIndex:    i => set({noteIndex:i}),
  setBPM:          b => set({bpm:b}),
  toggleMetronome: () => set(s => ({metronomeOn:!s.metronomeOn})),
  setMetronomeOn:  v  => set({metronomeOn:v}),
  incrementHits:   () => set(s => ({hits:s.hits+1})),
  reset: () => set({sessionState:'idle', noteIndex:0, hits:0})
}))
