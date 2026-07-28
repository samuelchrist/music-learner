import { motion }  from 'framer-motion'
import Button      from '@/components/ui/Button'
import type { ScoreResult } from '@music-learner/shared'
const GC: Record<string,string> = { S:'#a855f7','A+':'#f59e0b',A:'#f59e0b','B+':'#3b82f6',B:'#3b82f6',C:'#10b981',D:'#6b7280',F:'#ef4444' }
export default function ScoreBoard({ result, lessonName, feedback, unlocked, onRetry, onNext, onHome }: { result:ScoreResult; lessonName:string; feedback:string; unlocked:boolean; onRetry:()=>void; onNext:()=>void; onHome:()=>void }) {
  const gc=GC[result.grade]||'#7c3aed'
  const bars=[
    {label:'Notes Hit',          value:result.noteAccuracy,   color:'#a855f7'},
    {label:'Timing Accuracy',    value:result.timingAccuracy, color:'#3b82f6'},
    {label:'Rhythm Consistency', value:result.rhythmScore,    color:'#10b981'},
    {label:'Overall Score',      value:result.overall,        color:'#f59e0b'},
  ]
  return (
    <div className="flex flex-col items-center gap-8 py-12 px-6 max-w-lg mx-auto">
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200}}
        className="text-8xl font-black" style={{color:gc,textShadow:`0 0 40px ${gc}`}}>
        {result.grade}
      </motion.div>
      <div className="text-center">
        <h2 className="text-2xl font-bold">{lessonName}</h2>
        <p className="text-slate-400 mt-1">{feedback}</p>
      </div>
      <div className="w-full space-y-4">
        {bars.map((b,i)=>(
          <div key={b.label} className="flex items-center gap-3">
            <span className="w-44 text-sm text-slate-400 text-right">{b.label}</span>
            <div className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{background:b.color}} initial={{width:0}} animate={{width:`${b.value}%`}} transition={{duration:.8,delay:i*.1}}/>
            </div>
            <span className="w-10 text-sm font-bold text-right">{b.value}%</span>
          </div>
        ))}
      </div>
      <div className="flex gap-6 text-center">
        <div><p className="text-2xl font-bold text-success">{result.hits}</p><p className="text-xs text-slate-500">Hits</p></div>
        <div><p className="text-2xl font-bold text-danger">{result.misses}</p><p className="text-xs text-slate-500">Misses</p></div>
        <div><p className="text-2xl font-bold text-slate-300">{result.totalNotes}</p><p className="text-xs text-slate-500">Total</p></div>
      </div>
      {unlocked&&<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full py-3 px-5 bg-success/10 border border-success rounded-xl text-success font-bold text-center">🏆 Next lesson unlocked!</motion.div>}
      <div className="flex gap-3 flex-wrap justify-center">
        <Button variant="secondary" onClick={onRetry}>↺ Retry</Button>
        <Button variant="primary"   onClick={onNext}>Next Lesson →</Button>
        <Button variant="ghost"     onClick={onHome}>🏠 Home</Button>
      </div>
    </div>
  )
}
