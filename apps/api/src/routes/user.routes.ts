import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getMe, updateProfile } from '../controllers/user.controller'
const r = Router()
r.use(authenticate); r.get('/me', getMe); r.patch('/me', updateProfile)
export default r
