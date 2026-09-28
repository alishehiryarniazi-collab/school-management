import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  createFeeHeadSchema,
  updateFeeHeadSchema,
  setClassFeeSchema,
  classFeeQuerySchema,
  generateChallansSchema,
  challanFilterSchema,
  payChallanSchema,
  reportQuerySchema,
} from '../validators/fee.validators.js'
import * as setup from '../services/feeSetup.service.js'
import * as challans from '../services/challan.service.js'

// --- Fee heads ---
export async function listHeads(_req: Request, res: Response) {
  res.json({ feeHeads: await setup.listFeeHeads() })
}
export async function createHead(req: Request, res: Response) {
  const data = createFeeHeadSchema.parse(req.body)
  res.status(201).json({ feeHead: await setup.createFeeHead(data) })
}
export async function updateHead(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateFeeHeadSchema.parse(req.body)
  res.json({ feeHead: await setup.updateFeeHead(id, data) })
}
export async function deleteHead(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await setup.deleteFeeHead(id)
  res.json({ message: 'Fee head deleted' })
}

// --- Class fees ---
export async function listClassFees(req: Request, res: Response) {
  const { classId } = classFeeQuerySchema.parse(req.query)
  res.json({ classFees: await setup.listClassFees(classId) })
}
export async function setClassFee(req: Request, res: Response) {
  const data = setClassFeeSchema.parse(req.body)
  res.json({ classFee: await setup.setClassFee(data) })
}
export async function deleteClassFee(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await setup.deleteClassFee(id)
  res.json({ message: 'Class fee removed' })
}

// --- Challans ---
export async function generate(req: Request, res: Response) {
  const data = generateChallansSchema.parse(req.body)
  res.status(201).json(await challans.generateChallans(data))
}
export async function list(req: Request, res: Response) {
  const filter = challanFilterSchema.parse(req.query)
  res.json({ challans: await challans.listChallans(filter) })
}
export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  res.json({ challan: await challans.getChallan(id) })
}
export async function pay(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = payChallanSchema.parse(req.body)
  res.json({ challan: await challans.payChallan(id, data) })
}
export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await challans.deleteChallan(id)
  res.json({ message: 'Challan deleted' })
}

// --- Reports ---
export async function report(req: Request, res: Response) {
  const { period } = reportQuerySchema.parse(req.query)
  res.json(await challans.getReport(period))
}
