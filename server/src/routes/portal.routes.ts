// Student portal routes: /api/portal/*  (student only, read-only)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as portalController from '../controllers/portal.controller.js'

const router = Router()

router.use(requireAuth, requireRole('student'))

router.get('/me', portalController.profile)
router.get('/attendance', portalController.attendance)
router.get('/marks', portalController.marks)
router.get('/syllabus', portalController.syllabus)
router.get('/datesheet', portalController.datesheet)
router.get('/timetable', portalController.timetable)
router.get('/notices', portalController.notices)

export default router
