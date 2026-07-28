import api from './api'
export const authService = {
  register: (d: any) => api.post('/auth/register', d),
  login:    (d: any) => api.post('/auth/login', d),
  logout:   (t: string) => api.post('/auth/logout', { refreshToken:t }),
  refresh:  (t: string) => api.post('/auth/refresh', { refreshToken:t })
}
