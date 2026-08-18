import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  timetableQuerySchema,
  createTimetableSchema,
  updateTimetableSchema,
} from '../validators/timetable.validators.js'
import * as timetableService from '../services/timetable.service.js'

export async function list(req: Request, res: Response) {
  const { sectionId } = timetableQuerySchema.parse(req.query)
  const result = await timetableService.listTimetable(sectionId)
  res.json(result)
}

export async function create(req: Request, res: Response) {
  const data = createTimetableSchema.parse(req.body)
  const slot = await timetableService.createTimetableSlot(data)
  res.status(201).json({ slot })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateTimetableSchema.parse(req.body)
  const slot = await timetableService.updateTimetableSlot(id, data)
  res.json({ slot })
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await timetableService.deleteTimetableSlot(id)
  res.json({ message: 'Timetable slot deleted' })
}
