// Subject routes: /api/subjects
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as subjectController from '../controllers/subject.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', subjectController.list)
router.get('/:id', subjectController.getOne)

router.post('/', requireRole('admin'), subjectController.create)
router.patch('/:id', requireRole('admin'), subjectController.update)
router.delete('/:id', requireRole('admin'), subjectController.remove)

export default router
