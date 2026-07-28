import api from './api'
export const scoreService = {
  submit: (d: any) => api.post('/scores', d),
  getAll: (lessonId?: string) => api.get('/scores', { params: lessonId ? { lessonId } : {} })
}
