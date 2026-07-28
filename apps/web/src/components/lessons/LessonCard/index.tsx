import { clsx }          from 'clsx'
import { motion }        from 'framer-motion'
import DifficultyBadge   from '@/components/ui/Badge'

export default function LessonCard({ lesson, index, onClick }: { lesson:any; index:number; onClick:()=>void }) {
  const { progress } = lesson
  const locked=!progress?.unlocked, completed=!!progress?.bestScore
  return (
    <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:index*.05}}
      onClick={()=>!locked&&onClick()}
      className={clsx('card flex items-center gap-5 transition-all',
        !locked&&'hover:border-accent/50 hover:translate-x-1 cursor-pointer',
        locked&&'opacity-40 cursor-not-allowed',
        completed&&'border-success/40'
      )}>
      <div className={clsx('w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0',completed?'bg-success text-black':'bg-surface2 text-slate-300')}>
        {completed?'✓':index+1}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{lesson.name}{locked?' 🔒':''}</h3>
        <p className="text-sm text-slate-500 truncate mt-0.5">{lesson.description}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <DifficultyBadge difficulty={lesson.difficulty}/>
        <span className="text-xs text-slate-500">♩ {lesson.bpm} BPM</span>
        {progress?.bestScore&&<span className="text-xs font-bold text-warning">Best: {progress.bestScore}%</span>}
      </div>
    </motion.div>
  )
}
