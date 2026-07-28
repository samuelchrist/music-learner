import axios from 'axios'
import toast  from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({ baseURL:'/api/v1', timeout:10000 })

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(res => res, async error => {
  const orig = error.config
  if (error.response?.status === 401 && !orig._retry) {
    orig._retry = true
    try {
      const refresh = useAuthStore.getState().refreshToken
      const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken: refresh })
      useAuthStore.getState().setTokens(data.data.accessToken, refresh)
      orig.headers.Authorization = `Bearer ${data.data.accessToken}`
      return api(orig)
    } catch { useAuthStore.getState().logout(); window.location.href = '/login' }
  }
  toast.error(error.response?.data?.error || 'Something went wrong')
  return Promise.reject(error)
})

export default api
