// Dashboard: /api/dashboard  (admin + teacher; fees included for admin only)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { stats } from '../controllers/dashboard.controller.js'

const router = Router()

router.get('/', requireAuth, requireRole('admin', 'teacher'), stats)

export default router
