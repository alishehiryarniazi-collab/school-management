// Notice routes: /api/notices
// Admin + teacher can read and post; edit/delete is checked per-notice
// (admin or the original poster) inside the service.
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as noticeController from '../controllers/notice.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin', 'teacher'))

router.get('/', noticeController.list)
router.post('/', noticeController.create)
router.patch('/:id', noticeController.update)
router.delete('/:id', noticeController.remove)

export default router
