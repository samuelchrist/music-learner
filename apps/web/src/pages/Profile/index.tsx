import { useAuthStore }     from '@/store/authStore'
import { LEVEL_THRESHOLDS } from '@music-learner/shared'

export default function Profile() {
  const user=useAuthStore(s=>s.user); if(!user) return null
  const xp=user.totalXP, tl=LEVEL_THRESHOLDS[user.level]||0, nl=LEVEL_THRESHOLDS[user.level+1]||xp
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent-light flex items-center justify-center text-3xl mx-auto mb-4">🎵</div>
        <h1 className="text-2xl font-black">{user.username}</h1>
        <p className="text-slate-400 text-sm mt-1">{user.email}</p>
        <p className="text-accent-light font-bold mt-2">Level {user.level}</p>
        <div className="mt-4 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{xp} XP</span><span>{nl} XP</span></div>
          <div className="h-2 bg-surface2 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full" style={{width:`${Math.min(100,((xp-tl)/(nl-tl))*100)}%`}}/></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{i:'🔥',l:'Streak',v:user.streak},{i:'⭐',l:'Total XP',v:user.totalXP},{i:'🏆',l:'Level',v:user.level}].map(s=>(
          <div key={s.l} className="card text-center"><div className="text-2xl mb-1">{s.i}</div><p className="text-xl font-black">{s.v}</p><p className="text-xs text-slate-500">{s.l}</p></div>
        ))}
      </div>
    </div>
  )
}
