import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense }      from 'react'
import PageWrapper    from '@/components/layout/PageWrapper'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const w=(C:React.ComponentType)=><Suspense fallback={<LoadingSpinner fullScreen/>}><C/></Suspense>

const Home        = lazy(()=>import('@/pages/Home'))
const Dashboard   = lazy(()=>import('@/pages/Dashboard'))
const Lessons     = lazy(()=>import('@/pages/Lessons'))
const Practice    = lazy(()=>import('@/pages/Practice'))
const Profile     = lazy(()=>import('@/pages/Profile'))
const Leaderboard = lazy(()=>import('@/pages/Leaderboard'))
const Settings    = lazy(()=>import('@/pages/Settings'))
const Login       = lazy(()=>import('@/pages/Auth/Login'))
const Register    = lazy(()=>import('@/pages/Auth/Register'))
const NotFound    = lazy(()=>import('@/pages/NotFound'))

export const router = createBrowserRouter([
  { path:'/', element:<PageWrapper/>, children:[
    { index:true,         element:w(Home) },
    { path:'login',       element:w(Login) },
    { path:'register',    element:w(Register) },
    { path:'leaderboard', element:w(Leaderboard) },
    { element:<ProtectedRoute/>, children:[
      { path:'dashboard',              element:w(Dashboard) },
      { path:'lessons',                element:w(Lessons) },
      { path:'lessons/:instrument',    element:w(Lessons) },
      { path:'practice/:lessonId',     element:w(Practice) },
      { path:'profile',                element:w(Profile) },
      { path:'settings',               element:w(Settings) },
    ]},
  ]},
  { path:'*', element:w(NotFound) }
])
