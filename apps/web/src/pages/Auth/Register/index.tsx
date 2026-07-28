import { useState }  from 'react'
import { Link }      from 'react-router-dom'
import { useAuth }   from '@/hooks/useAuth'
import Button        from '@/components/ui/Button'
import { ROUTES }    from '@/constants/routes'

export default function Register() {
  const [form,setForm]=useState({email:'',username:'',password:''})
  const { register, isLoading } = useAuth()
  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account 🎶</h2>
        <form onSubmit={e=>{e.preventDefault();register(form)}} className="space-y-4">
          {[{k:'email',l:'Email',t:'email',p:'you@example.com'},{k:'username',l:'Username',t:'text',p:'rockstar99'},{k:'password',l:'Password',t:'password',p:'••••••••'}].map(f=>(
            <div key={f.k}><label className="text-sm text-slate-400 block mb-1.5">{f.l}</label><input className="input" type={f.t} placeholder={f.p} value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} required/></div>
          ))}
          <Button type="submit" loading={isLoading} className="w-full mt-2">Create Account</Button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-5">Have an account? <Link to={ROUTES.LOGIN} className="text-accent-light hover:underline">Sign in</Link></p>
      </div>
    </div>
  )
}
