import { create }  from 'zustand'
import { persist } from 'zustand/middleware'
interface S {
  volume:number; keyboardEnabled:boolean; showNoteNames:boolean
  setVolume:(v:number)=>void; toggleKeyboard:()=>void; toggleNoteNames:()=>void
}
export const useSettingsStore = create<S>()(persist(set => ({
  volume:0.8, keyboardEnabled:true, showNoteNames:true,
  setVolume:       v => set({volume:v}),
  toggleKeyboard:  () => set(s => ({keyboardEnabled:!s.keyboardEnabled})),
  toggleNoteNames: () => set(s => ({showNoteNames:!s.showNoteNames}))
}), { name:'settings-storage' }))
