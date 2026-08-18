// Date sheet routes: /api/datesheet  (admin + teacher)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as datesheetController from '../controllers/datesheet.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin', 'teacher'))

router.get('/', datesheetController.list)
router.post('/', datesheetController.create)
router.patch('/:id', datesheetController.update)
router.delete('/:id', datesheetController.remove)

export default router
