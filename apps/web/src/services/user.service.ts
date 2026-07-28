import api from './api'
export const userService = {
  getMe:         () => api.get('/users/me'),
  updateProfile: (d: any) => api.patch('/users/me', d)
}
