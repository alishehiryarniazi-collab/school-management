// Books: /api/books  (read: admin+teacher, manage: admin)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as book from '../controllers/book.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', requireRole('admin', 'teacher'), book.list)
router.post('/', requireRole('admin'), book.create)
router.patch('/:id', requireRole('admin'), book.update)
router.delete('/:id', requireRole('admin'), book.remove)

export default router
