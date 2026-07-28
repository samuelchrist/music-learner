import { create } from 'zustand'
import type { Instrument } from '@music-learner/shared'
interface S {
  lessons:any[]; selectedInstrument:Instrument|null
  setLessons:(l:any[])=>void; setInstrument:(i:Instrument)=>void
}
export const useLessonStore = create<S>()(set => ({
  lessons:[], selectedInstrument:null,
  setLessons:  l => set({lessons:l}),
  setInstrument: i => set({selectedInstrument:i})
}))
