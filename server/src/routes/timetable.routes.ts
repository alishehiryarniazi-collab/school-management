// Timetable routes: /api/timetable  (admin + teacher)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as timetableController from '../controllers/timetable.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin', 'teacher'))

router.get('/', timetableController.list)
router.post('/', timetableController.create)
router.patch('/:id', timetableController.update)
router.delete('/:id', timetableController.remove)

export default router
