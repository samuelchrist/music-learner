import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@music-learner/shared'

interface S {
  user: User|null; accessToken:string|null; refreshToken:string|null; isAuth:boolean
  setAuth:(u:User,a:string,r:string)=>void
  setTokens:(a:string,r:string)=>void
  logout:()=>void
  updateUser:(d:Partial<User>)=>void
}

export const useAuthStore = create<S>()(persist(set => ({
  user:null, accessToken:null, refreshToken:null, isAuth:false,
  setAuth:(user,accessToken,refreshToken) => set({user,accessToken,refreshToken,isAuth:true}),
  setTokens:(accessToken,refreshToken) => set({accessToken,refreshToken}),
  logout:() => set({user:null,accessToken:null,refreshToken:null,isAuth:false}),
  updateUser:data => set(s => ({user: s.user ? {...s.user,...data} : null}))
}), { name:'auth-storage' }))
