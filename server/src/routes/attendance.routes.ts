// Attendance routes: /api/attendance  (admin + teacher)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as attendanceController from '../controllers/attendance.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin', 'teacher'))

router.get('/', attendanceController.getRoster)
router.post('/', attendanceController.mark)

export default router
