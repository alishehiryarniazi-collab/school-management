// Marks routes: /api/marks  (admin + teacher)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as markController from '../controllers/mark.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin', 'teacher'))

router.get('/exams', markController.exams)
router.get('/', markController.getRoster)
router.post('/', markController.save)

export default router
