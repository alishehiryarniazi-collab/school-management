// Auth routes: /api/auth/*
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  staffLogin,
  studentLogin,
  me,
  logout,
  schoolStructure,
} from '../controllers/auth.controller.js'

const router = Router()

router.post('/login', staffLogin) // admin & teacher
router.post('/student-login', studentLogin) // students
router.post('/logout', logout)
router.get('/me', requireAuth, me)
router.get('/school-structure', schoolStructure) // public (for student login dropdowns)

export default router
