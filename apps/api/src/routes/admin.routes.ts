import { Router }         from 'express'
import { authenticate }   from '../middleware/auth.middleware'
import { requireAdmin }   from '../middleware/admin.middleware'
import {
  getAllUsers,
  getUser,
  updateUserRole,
  updateSubscription,
  setLessonAccess,
  bulkUnlockLessons,
  getDashboardStats,
  updateLessonPlan,
} from '../controllers/admin.controller'

const r = Router()

// All admin routes require auth + admin role
r.use(authenticate, requireAdmin)

// Dashboard
r.get('/stats',                    getDashboardStats)

// Users
r.get('/users',                    getAllUsers)
r.get('/users/:id',                getUser)
r.patch('/users/:id/role',         updateUserRole)
r.patch('/users/:id/subscription', updateSubscription)

// Lessons
r.patch('/lessons/:id',            updateLessonPlan)
r.post('/lessons/access',          setLessonAccess)
r.post('/lessons/bulk-unlock',     bulkUnlockLessons)

export default r
