import { useEffect, useRef, useState } from 'react'
import { MidiManager }      from '@/lib/midi/MidiManager'
import { KeyboardFallback } from '@/lib/midi/KeyboardFallback'
import { NotePlayer }       from '@/lib/audio/NotePlayer'
import { useSettingsStore } from '@/store/settingsStore'

export function useMidi({
  onNoteOn,
  onNoteOff,
}: {
  onNoteOn?:  (n: number, v: number) => void
  onNoteOff?: (n: number) => void
} = {}) {
  const [connected,  setConnected]  = useState(false)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [allDevices, setAllDevices] = useState<string[]>([])
  const { keyboardEnabled } = useSettingsStore()

  // Always-fresh refs — no stale closure problem
  const onRef  = useRef(onNoteOn)
  const offRef = useRef(onNoteOff)
  useEffect(() => { onRef.current  = onNoteOn  }, [onNoteOn])
  useEffect(() => { offRef.current = onNoteOff }, [onNoteOff])

  useEffect(() => {
    // Wire MIDI callbacks via refs — always calls latest version
    MidiManager.onNoteOn((n, v) => {
      NotePlayer.play(n, 0.3)
      onRef.current?.(n, v)
    })
    MidiManager.onNoteOff(n => offRef.current?.(n))

    MidiManager.onStateChange((conn, name) => {
      setConnected(conn)
      setDeviceName(MidiManager.deviceName)
      setAllDevices(MidiManager.allDevices.filter(Boolean) as string[])
    })

    MidiManager.init().then(ok => {
      setConnected(ok)
      setDeviceName(MidiManager.deviceName)
      setAllDevices(MidiManager.allDevices.filter(Boolean) as string[])
    })

    // Keyboard fallback
    KeyboardFallback.init()
    KeyboardFallback.onNoteOn((n, v) => {
      if (!keyboardEnabled) return
      NotePlayer.play(n, 0.3)
      onRef.current?.(n, v)
    })
    KeyboardFallback.onNoteOff(n => offRef.current?.(n))
  }, [])

  useEffect(() => {
    KeyboardFallback.setEnabled(keyboardEnabled)
  }, [keyboardEnabled])

  return { connected, deviceName, allDevices }
}
