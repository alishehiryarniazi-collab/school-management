// Section routes: /api/sections
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as sectionController from '../controllers/section.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', sectionController.list)
router.get('/:id', sectionController.getOne)

router.post('/', requireRole('admin'), sectionController.create)
router.patch('/:id', requireRole('admin'), sectionController.update)
router.delete('/:id', requireRole('admin'), sectionController.remove)

export default router
