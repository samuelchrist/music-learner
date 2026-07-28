import api from './api'
export const lessonService = {
  getAll:   (instrument?: string) => api.get('/lessons', { params: instrument ? { instrument } : {} }),
  getById:  (id: string) => api.get(`/lessons/${id}`)
}
