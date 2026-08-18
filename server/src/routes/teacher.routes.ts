// Teacher routes: /api/teachers  (admin only — admin manages teacher accounts)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as teacherController from '../controllers/teacher.controller.js'

const router = Router()

router.use(requireAuth)

// Reading the teacher list is allowed for staff (needed for dropdowns, e.g.
// assigning a class teacher or a timetable slot).
router.get('/', requireRole('admin', 'teacher'), teacherController.list)
router.get('/:id', requireRole('admin', 'teacher'), teacherController.getOne)

// Managing teacher accounts stays admin-only.
router.post('/', requireRole('admin'), teacherController.create)
router.patch('/:id', requireRole('admin'), teacherController.update)
router.patch(
  '/:id/reset-password',
  requireRole('admin'),
  teacherController.resetPassword
)

export default router
