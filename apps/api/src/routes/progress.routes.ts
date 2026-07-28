import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getProgress }  from '../controllers/progress.controller'
const r = Router()
r.use(authenticate); r.get('/', getProgress)
export default r
