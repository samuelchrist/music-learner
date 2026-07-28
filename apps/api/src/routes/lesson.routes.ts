import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getLessons, getLessonById } from '../controllers/lesson.controller'
const r = Router()
r.use(authenticate)
r.get('/', getLessons); r.get('/:id', getLessonById)
export default r
