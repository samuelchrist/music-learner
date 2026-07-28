import {
  playPianoNote,
  attackPianoNote,
  releasePianoNote,
  playDrumHit,
  preloadSounds,
  isPianoLoaded,
  isDrumsLoaded,
} from './SoundEngine'

class NotePlayerClass {

  async preload() {
    await preloadSounds()
  }

  // Piano / Guitar — short tap (for practice feedback)
  play(midi: number, duration = 1.5, volume = 0.8) {
    const dur = duration > 1 ? '2n' : duration > 0.5 ? '4n' : '8n'
    playPianoNote(midi, dur, volume)
  }

  // Piano key held down
  attack(midi: number, volume = 0.8) {
    attackPianoNote(midi, volume)
  }

  // Piano key released
  stop(midi: number) {
    releasePianoNote(midi)
  }

  // Drum hit
  playDrum(midi: number) {
    playDrumHit(midi)
  }

  isPianoReady(): boolean { return isPianoLoaded() }
  isDrumsReady(): boolean { return isDrumsLoaded() }
}

export const NotePlayer = new NotePlayerClass()
