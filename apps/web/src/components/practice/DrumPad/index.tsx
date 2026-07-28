import { clsx }             from 'clsx'
import { DRUM_COLORS, DRUM_NAMES } from '@/constants/drumMap'
const PADS=[36,38,42,46,50,47,45,49]
export default function DrumPad({ activeNotes, expectedNote }: { activeNotes:Set<number>; expectedNote?:number }) {
  return (
    <div className="grid grid-cols-4 gap-3 p-4 max-w-lg mx-auto">
      {PADS.map(m=>{
        const a=activeNotes.has(m),e=m===expectedNote,c=DRUM_COLORS[m]||'#7c3aed'
        return <div key={m} className={clsx('h-16 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all select-none',a&&'scale-95',e&&'scale-105')}
          style={{background:a?c:`${c}22`,borderColor:a||e?c:`${c}66`,color:c,boxShadow:a?`0 0 20px ${c}`:'none'}}>
          {DRUM_NAMES[m]}
        </div>
      })}
    </div>
  )
}
