import { useMutation }  from '@tanstack/react-query'
import { useNavigate }  from 'react-router-dom'
import toast            from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { authService }  from '@/services/auth.service'
import { ROUTES }       from '@/constants/routes'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuth, setAuth, logout: sl } = useAuthStore()

  const loginMut = useMutation({ mutationFn: authService.login, onSuccess:({data})=>{
    const { user, accessToken, refreshToken } = data.data
    setAuth(user,accessToken,refreshToken)
    toast.success(`Welcome back, ${user.username}!`)
    navigate(ROUTES.DASHBOARD)
  }})

  const regMut = useMutation({ mutationFn: authService.register, onSuccess:({data})=>{
    const { user, accessToken, refreshToken } = data.data
    setAuth(user,accessToken,refreshToken)
    toast.success('Account created! 🎵')
    navigate(ROUTES.DASHBOARD)
  }})

  const logout = async () => {
    try { const t=useAuthStore.getState().refreshToken; if(t) await authService.logout(t) }
    finally { sl(); navigate(ROUTES.LOGIN) }
  }

  return { user, isAuth, logout, login:loginMut.mutate, register:regMut.mutate, isLoading:loginMut.isPending||regMut.isPending }
}
