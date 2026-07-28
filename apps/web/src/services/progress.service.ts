import api from './api'
export const progressService = { getAll: () => api.get('/progress') }
