// Class routes: /api/classes
// Any logged-in staff can read; only admins can create/update/delete.
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as classController from '../controllers/class.controller.js'

const router = Router()

router.use(requireAuth) // all class routes require login

router.get('/', classController.list)
router.get('/:id', classController.getOne)

router.post('/', requireRole('admin'), classController.create)
router.patch('/:id', requireRole('admin'), classController.update)
router.delete('/:id', requireRole('admin'), classController.remove)

export default router
