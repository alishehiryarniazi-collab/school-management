// School profile: /api/school-profile
// GET is public (login screen + printouts show the school name/logo).
// PATCH is admin only.
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as ctrl from '../controllers/schoolProfile.controller.js'

const router = Router()

router.get('/', ctrl.get)
router.patch('/', requireAuth, requireRole('admin'), ctrl.update)

export default router
