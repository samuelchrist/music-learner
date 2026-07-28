import { useState }         from 'react'
import { useNavigate }      from 'react-router-dom'
import { useLessons }       from '@/hooks/useLesson'
import LessonCard           from '@/components/lessons/LessonCard'
import LoadingSpinner       from '@/components/ui/LoadingSpinner'
import { ROUTES }           from '@/constants/routes'

const INSTS=[{id:'piano',icon:'🎹'},{id:'guitar',icon:'🎸'},{id:'drums',icon:'🥁'}]

export default function Lessons() {
  const [sel,setSel]=useState('piano')
  const nav=useNavigate()
  const { data:lessons, isLoading } = useLessons(sel)
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-6">Lessons</h1>
      <div className="flex gap-3 mb-8">
        {INSTS.map(i=>(
          <button key={i.id} onClick={()=>setSel(i.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold border-2 transition-all text-sm capitalize ${sel===i.id?'border-accent-light bg-accent/20 text-accent-light':'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
            <span className="text-xl">{i.icon}</span>{i.id}
          </button>
        ))}
      </div>
      {isLoading ? <div className="flex justify-center py-20"><LoadingSpinner size="lg"/></div> :
        <div className="space-y-3">
          {lessons?.map((l:any,i:number)=>(
            <LessonCard key={l.id} lesson={l} index={i} onClick={()=>nav(ROUTES.PRACTICE(l.id))}/>
          ))}
        </div>
      }
    </div>
  )
}
