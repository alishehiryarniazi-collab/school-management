// Fees: /api/fees/*  (admin only — the owner/accountant handles fees)
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as fee from '../controllers/fee.controller.js'

const router = Router()

router.use(requireAuth, requireRole('admin'))

// Fee heads (types of fee)
router.get('/heads', fee.listHeads)
router.post('/heads', fee.createHead)
router.patch('/heads/:id', fee.updateHead)
router.delete('/heads/:id', fee.deleteHead)

// Per-class fee amounts
router.get('/class-fees', fee.listClassFees)
router.post('/class-fees', fee.setClassFee)
router.delete('/class-fees/:id', fee.deleteClassFee)

// Challans (bills)
router.post('/challans/generate', fee.generate)
router.post('/challans/generate-monthly', fee.generateMonthly)
router.get('/challans', fee.list)
router.get('/challans/:id', fee.getOne)
router.patch('/challans/:id/pay', fee.pay)
router.delete('/challans/:id', fee.remove)

// Reports (collection / outstanding / defaulters)
router.get('/reports', fee.report)

export default router
