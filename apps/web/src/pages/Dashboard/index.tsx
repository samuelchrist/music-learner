import { useQuery }        from '@tanstack/react-query'
import { useNavigate }     from 'react-router-dom'
import { motion }          from 'framer-motion'
import { progressService } from '@/services/progress.service'
import { useAuthStore }    from '@/store/authStore'
import LoadingSpinner      from '@/components/ui/LoadingSpinner'
import Button              from '@/components/ui/Button'
import { ROUTES }          from '@/constants/routes'

export default function Dashboard() {
  const user=useAuthStore(s=>s.user), nav=useNavigate()
  const { data, isLoading } = useQuery({ queryKey:['progress'], queryFn:async()=>{ const {data}=await progressService.getAll(); return data.data } })
  if(isLoading) return <LoadingSpinner fullScreen/>
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-black">Welcome back, {user?.username}! 🎵</h1><p className="text-slate-400 mt-1">Keep up the practice streak!</p></div>
        <Button onClick={()=>nav(ROUTES.LESSONS)}>Continue →</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[{l:'Total XP',v:user?.totalXP||0,c:'#f59e0b',i:'⭐'},{l:'Level',v:user?.level||1,c:'#a855f7',i:'🏆'},{l:'Streak',v:`${user?.streak||0}d`,c:'#10b981',i:'🔥'},{l:'Completed',v:data?.stats?.totalCompleted||0,c:'#3b82f6',i:'✅'}].map((s,i)=>(
          <motion.div key={s.l} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.1}} className="card text-center">
            <div className="text-3xl mb-2">{s.i}</div>
            <p className="text-2xl font-black" style={{color:s.c}}>{s.v}</p>
            <p className="text-xs text-slate-500 mt-1">{s.l}</p>
          </motion.div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-bold text-lg mb-4">Progress by Instrument</h2>
        <div className="space-y-4">
          {[{n:'Piano',i:'🎹',c:data?.stats?.byInstrument?.piano||0,t:10},{n:'Guitar',i:'🎸',c:data?.stats?.byInstrument?.guitar||0,t:8},{n:'Drums',i:'🥁',c:data?.stats?.byInstrument?.drums||0,t:8}].map(x=>(
            <div key={x.n} className="flex items-center gap-4">
              <span className="text-2xl">{x.i}</span>
              <span className="w-16 text-sm font-medium">{x.n}</span>
              <div className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent rounded-full" initial={{width:0}} animate={{width:`${(x.c/x.t)*100}%`}} transition={{duration:.8}}/>
              </div>
              <span className="text-sm text-slate-400 w-12 text-right">{x.c}/{x.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
