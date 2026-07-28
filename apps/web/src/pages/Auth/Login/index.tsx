import { useState }  from 'react'
import { Link }      from 'react-router-dom'
import { useAuth }   from '@/hooks/useAuth'
import Button        from '@/components/ui/Button'
import { ROUTES }    from '@/constants/routes'

export default function Login() {
  const [form,setForm]=useState({email:'',password:''})
  const { login, isLoading } = useAuth()
  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back 🎵</h2>
        <form onSubmit={e=>{e.preventDefault();login(form)}} className="space-y-4">
          <div><label className="text-sm text-slate-400 block mb-1.5">Email</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
          <div><label className="text-sm text-slate-400 block mb-1.5">Password</label><input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required/></div>
          <Button type="submit" loading={isLoading} className="w-full mt-2">Sign In</Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-5">No account? <Link to={ROUTES.REGISTER} className="text-accent-light hover:underline">Sign up free</Link></p>
      </div>
    </div>
  )
}
