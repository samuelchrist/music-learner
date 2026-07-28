import { useSettingsStore } from '@/store/settingsStore'
export default function Settings() {
  const { volume, keyboardEnabled, showNoteNames, setVolume, toggleKeyboard, toggleNoteNames } = useSettingsStore()
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8">Settings ⚙️</h1>
      <div className="card space-y-6">
        {[{l:'Keyboard Fallback',d:'Use A-K keys when no MIDI device connected',v:keyboardEnabled,t:toggleKeyboard},{l:'Show Note Names',d:'Display note names on piano roll',v:showNoteNames,t:toggleNoteNames}].map(s=>(
          <div key={s.l} className="flex items-center justify-between">
            <div><p className="font-medium">{s.l}</p><p className="text-sm text-slate-400 mt-0.5">{s.d}</p></div>
            <button onClick={s.t} className={`w-12 h-6 rounded-full transition-colors relative ${s.v?'bg-accent':'bg-slate-700'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${s.v?'left-7':'left-1'}`}/>
            </button>
          </div>
        ))}
        <div>
          <div className="flex justify-between mb-2"><p className="font-medium">Volume</p><span className="text-sm text-slate-400">{Math.round(volume*100)}%</span></div>
          <input type="range" min={0} max={1} step={.05} value={volume} onChange={e=>setVolume(parseFloat(e.target.value))} className="w-full accent-accent-light"/>
        </div>
      </div>
    </div>
  )
}
