// Teacher routes: /api/teachers  (admin only — admin manages teacher accounts)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as teacherController from '../controllers/teacher.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin'))

router.get('/', teacherController.list)
router.get('/:id', teacherController.getOne)
router.post('/', teacherController.create)
router.patch('/:id', teacherController.update)
router.patch('/:id/reset-password', teacherController.resetPassword)

export default router
