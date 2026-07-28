import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore }      from '@/store/authStore'
import { ROUTES }            from '@/constants/routes'
export default function ProtectedRoute() {
  return useAuthStore(s=>s.isAuth) ? <Outlet/> : <Navigate to={ROUTES.LOGIN} replace/>
}
