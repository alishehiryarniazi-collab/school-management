// Teaching assignment routes: /api/assignments
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as assignmentController from '../controllers/assignment.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', assignmentController.list)
router.post('/', requireRole('admin'), assignmentController.create)
router.delete('/:id', requireRole('admin'), assignmentController.remove)

export default router
