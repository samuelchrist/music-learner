import { useNavigate }  from 'react-router-dom'
import { motion }       from 'framer-motion'
import Button           from '@/components/ui/Button'
import { ROUTES }       from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const nav=useNavigate(), isAuth=useAuthStore(s=>s.isAuth)
  return (
    <div className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center px-6">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center max-w-2xl">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-accent-light to-blue-400 bg-clip-text text-transparent">Learn Music.<br/>Beat by Beat.</h1>
        <p className="text-xl text-slate-400 mb-10">Practice piano, guitar and drums with real MIDI support, intelligent scoring and progressive lessons.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          {isAuth ? <>
            <Button size="lg" onClick={()=>nav(ROUTES.LESSONS)}>Browse Lessons →</Button>
            <Button size="lg" variant="secondary" onClick={()=>nav(ROUTES.DASHBOARD)}>My Dashboard</Button>
          </> : <>
            <Button size="lg" onClick={()=>nav(ROUTES.REGISTER)}>Get Started Free →</Button>
            <Button size="lg" variant="secondary" onClick={()=>nav(ROUTES.LOGIN)}>Sign In</Button>
          </>}
        </div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
        {[{icon:'🎹',title:'MIDI Support',desc:'Connect any MIDI instrument or use keyboard fallback'},{icon:'📊',title:'Smart Scoring',desc:'Graded on notes, timing accuracy and rhythm'},{icon:'🏆',title:'Progression',desc:'Score 60%+ to unlock next lesson with higher tempo'}].map((f,i)=>(
          <motion.div key={f.title} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.2+i*.1}} className="card text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
