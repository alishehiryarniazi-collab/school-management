import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  datesheetFilterSchema,
  createDatesheetSchema,
  updateDatesheetSchema,
} from '../validators/datesheet.validators.js'
import * as datesheetService from '../services/datesheet.service.js'

export async function list(req: Request, res: Response) {
  const filter = datesheetFilterSchema.parse(req.query)
  const datesheet = await datesheetService.listDatesheet(filter)
  res.json({ datesheet })
}

export async function create(req: Request, res: Response) {
  const data = createDatesheetSchema.parse(req.body)
  const entry = await datesheetService.createDatesheet(data)
  res.status(201).json({ entry })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateDatesheetSchema.parse(req.body)
  const entry = await datesheetService.updateDatesheet(id, data)
  res.json({ entry })
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await datesheetService.deleteDatesheet(id)
  res.json({ message: 'Date sheet entry deleted' })
}
