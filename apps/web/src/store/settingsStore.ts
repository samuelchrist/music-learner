import { create }  from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface SettingsState {
  volume:          number
  keyboardEnabled: boolean
  showNoteNames:   boolean
  theme:           Theme
  setVolume:       (v: number)  => void
  toggleKeyboard:  ()           => void
  toggleNoteNames: ()           => void
  setTheme:        (t: Theme)   => void
  toggleTheme:     ()           => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      volume:          0.8,
      keyboardEnabled: true,
      showNoteNames:   true,
      theme:           'dark',
      setVolume:       volume => set({ volume }),
      toggleKeyboard:  ()     => set(s => ({ keyboardEnabled: !s.keyboardEnabled })),
      toggleNoteNames: ()     => set(s => ({ showNoteNames: !s.showNoteNames })),
      setTheme:        theme  => set({ theme }),
      toggleTheme:     ()     => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'settings-storage' }
  )
)
