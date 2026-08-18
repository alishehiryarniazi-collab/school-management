// Syllabus routes: /api/syllabus  (admin + teacher)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as syllabusController from '../controllers/syllabus.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin', 'teacher'))

router.get('/', syllabusController.list)
router.post('/', syllabusController.create)
router.patch('/:id', syllabusController.update)
router.delete('/:id', syllabusController.remove)

export default router
