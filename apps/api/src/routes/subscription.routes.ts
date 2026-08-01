import { Router }       from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { PlanTier }     from '@prisma/client'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest }  from '../middleware/auth.middleware'
import {
  upgradePlan,
  cancelSubscription,
  getUserPlan,
  PLAN_NAMES,
} from '../services/subscription.service'

const r = Router()

// Get current plan
r.get('/current', authenticate, async (req: AuthRequest, res) => {
  try {
    const plan = await getUserPlan(req.user!.userId)
    return sendSuccess(res, {
      currentPlan: plan,
      planName:    PLAN_NAMES[plan],
    })
  } catch { return sendError(res, 'Failed', 500) }
})

// Get available plans
r.get('/plans', async (_, res) => {
  return sendSuccess(res, {
    plans: [
      {
        id:          'FREE',
        name:        'Free',
        price:       0,
        grades:      [1],
        features:    ['Grade 1 lessons only', 'Basic scoring', 'Keyboard support'],
      },
      {
        id:          'BASIC',
        name:        'Basic',
        price:       4.99,
        grades:      [1, 2, 3],
        features:    ['Grade 1-3 lessons', 'Full scoring', 'Progress tracking', 'Leaderboard'],
      },
      {
        id:          'PRO',
        name:        'Pro',
        price:       9.99,
        grades:      [1, 2, 3, 4, 5],
        features:    ['All Grade 1-5 lessons', 'MIDI support', 'Advanced analytics', 'Priority support'],
      },
    ]
  })
})

// Upgrade plan (mock payment for now)
r.post('/upgrade', authenticate, async (req: AuthRequest, res) => {
  try {
    const { plan }: { plan: PlanTier } = req.body
    if (!Object.values(PlanTier).includes(plan)) {
      return sendError(res, 'Invalid plan', 400)
    }
    await upgradePlan(req.user!.userId, plan)
    return sendSuccess(res, null, `Upgraded to ${PLAN_NAMES[plan]}!`)
  } catch { return sendError(res, 'Failed to upgrade', 500) }
})

// Cancel subscription
r.post('/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    await cancelSubscription(req.user!.userId)
    return sendSuccess(res, null, 'Subscription cancelled')
  } catch { return sendError(res, 'Failed to cancel', 500) }
})

export default r
