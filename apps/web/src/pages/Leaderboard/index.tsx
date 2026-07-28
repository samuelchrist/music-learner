import { useQuery }   from '@tanstack/react-query'
import { motion }     from 'framer-motion'
import api            from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Leaderboard() {
  const { data, isLoading } = useQuery({ queryKey:['leaderboard'], queryFn:async()=>{ const {data}=await api.get('/leaderboard'); return data.data } })
  if(isLoading) return <LoadingSpinner fullScreen/>
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8">🏆 Leaderboard</h1>
      <div className="space-y-3">
        {data?.map((e:any,i:number)=>(
          <motion.div key={e.userId} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*.05}} className="card flex items-center gap-4">
            <span className={`text-2xl font-black w-10 text-center ${i===0?'text-yellow-400':i===1?'text-slate-300':i===2?'text-amber-600':'text-slate-500'}`}>{i<3?['🥇','🥈','🥉'][i]:e.rank}</span>
            <div className="flex-1"><p className="font-bold">{e.username}</p><p className="text-xs text-slate-500">Level {e.level}</p></div>
            <span className="text-warning font-black text-lg">{e.totalXP} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
