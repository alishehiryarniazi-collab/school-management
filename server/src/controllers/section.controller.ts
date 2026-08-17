import type { Request, Response } from 'express'
import { z } from 'zod'
import { idParamSchema } from '../validators/common.validators.js'
import {
  createSectionSchema,
  updateSectionSchema,
} from '../validators/section.validators.js'
import * as sectionService from '../services/section.service.js'

// Optional ?classId= filter for the list endpoint.
const listQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
})

export async function list(req: Request, res: Response) {
  const { classId } = listQuerySchema.parse(req.query)
  const sections = await sectionService.listSections(classId)
  res.json({ sections })
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const section = await sectionService.getSection(id)
  res.json({ section })
}

export async function create(req: Request, res: Response) {
  const data = createSectionSchema.parse(req.body)
  const section = await sectionService.createSection(data)
  res.status(201).json({ section })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateSectionSchema.parse(req.body)
  const section = await sectionService.updateSection(id, data)
  res.json({ section })
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await sectionService.deleteSection(id)
  res.json({ message: 'Section deleted' })
}
