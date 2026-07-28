import { Router } from 'express'
import { register, login, refresh, logout } from '../controllers/auth.controller'
import { authLimiter } from '../middleware/rateLimit.middleware'
const r = Router()
r.post('/register', authLimiter, register)
r.post('/login',    authLimiter, login)
r.post('/refresh',  refresh)
r.post('/logout',   logout)
export default r
