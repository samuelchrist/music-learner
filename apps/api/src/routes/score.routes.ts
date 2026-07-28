import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { submitScore, getScores } from '../controllers/score.controller'
const r = Router()
r.use(authenticate)
r.post('/', submitScore); r.get('/', getScores)
export default r
