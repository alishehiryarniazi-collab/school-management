// Student routes: /api/students
// Admin AND teachers manage students. (Students themselves can't list/edit here.)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as studentController from '../controllers/student.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin', 'teacher'))

router.get('/', studentController.list)
router.get('/:id', studentController.getOne)
router.post('/', studentController.create)
router.patch('/:id', studentController.update)
router.patch('/:id/assign', studentController.assign)
router.patch('/:id/reset-password', studentController.resetPassword)

export default router
