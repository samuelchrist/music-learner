import { Link, useNavigate } from 'react-router-dom'
import { useAuth }            from '@/hooks/useAuth'
import { ROUTES }             from '@/constants/routes'
import Button                 from '@/components/ui/Button'

export default function Navbar() {
  const { user, isAuth, logout } = useAuth()
  const nav = useNavigate()
  return (
    <nav className="bg-surface border-b border-slate-800 px-6 py-3 flex items-center gap-6">
      <Link to={ROUTES.HOME} className="text-xl font-black text-accent-light">🎵 MusicLearner</Link>
      <div className="flex gap-1 ml-4">
        <Link to={ROUTES.LESSONS}     className="btn-ghost">Lessons</Link>
        <Link to={ROUTES.LEADERBOARD} className="btn-ghost">Leaderboard</Link>
        {isAuth&&<Link to={ROUTES.DASHBOARD} className="btn-ghost">Dashboard</Link>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        {isAuth ? <>
          <span className="text-sm text-slate-400">⭐{user?.totalXP} XP • Lv.{user?.level}</span>
          <Link to={ROUTES.PROFILE} className="text-sm font-medium text-accent-light hover:underline">{user?.username}</Link>
          <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
        </> : <>
          <Button variant="ghost"   size="sm" onClick={()=>nav(ROUTES.LOGIN)}>Login</Button>
          <Button variant="primary" size="sm" onClick={()=>nav(ROUTES.REGISTER)}>Sign Up</Button>
        </>}
      </div>
    </nav>
  )
}
