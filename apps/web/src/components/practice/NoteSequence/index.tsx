import { clsx } from 'clsx'
import type { Note } from '@music-learner/shared'
type Status='pending'|'active'|'hit'|'miss'
export default function NoteSequence({ notes, activeIdx, states }: { notes:Note[]; activeIdx:number; states:{status:Status}[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1">
      {notes.map((n,i)=>{
        const s=states[i]?.status||'pending'
        return <div key={i} className="flex flex-col items-center gap-1 min-w-[52px]">
          <span className="text-xs text-slate-500 font-medium">{n.beat}</span>
          <div className={clsx('w-11 h-11 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-150',
            n.isRest&&'border-dashed opacity-50',
            s==='pending'&&'border-slate-700 bg-surface text-slate-400',
            s==='active' &&'border-accent-light bg-accent/20 text-accent-light scale-110 shadow-[0_0_16px_#7c3aed]',
            s==='hit'    &&'border-success bg-success/20 text-success',
            s==='miss'   &&'border-danger bg-danger/10 text-danger',
          )}>{n.isRest?'—':n.label}</div>
          <div className={clsx('w-1.5 h-1.5 rounded-full',s==='active'?'bg-accent-light':'bg-slate-700')}/>
        </div>
      })}
    </div>
  )
}
