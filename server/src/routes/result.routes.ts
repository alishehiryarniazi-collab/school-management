// Result cards: /api/results/*  (admin + teacher)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as ctrl from '../controllers/result.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin', 'teacher'))

router.get('/exams', ctrl.exams)
router.get('/class', ctrl.classResults)
router.get('/card', ctrl.card)

export default router
