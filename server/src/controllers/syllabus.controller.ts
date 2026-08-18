import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  syllabusFilterSchema,
  createSyllabusSchema,
  updateSyllabusSchema,
} from '../validators/syllabus.validators.js'
import * as syllabusService from '../services/syllabus.service.js'

export async function list(req: Request, res: Response) {
  const { classId } = syllabusFilterSchema.parse(req.query)
  const syllabus = await syllabusService.listSyllabus(classId)
  res.json({ syllabus })
}

export async function create(req: Request, res: Response) {
  const data = createSyllabusSchema.parse(req.body)
  const entry = await syllabusService.createSyllabus(data)
  res.status(201).json({ syllabus: entry })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateSyllabusSchema.parse(req.body)
  const entry = await syllabusService.updateSyllabus(id, data)
  res.json({ syllabus: entry })
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await syllabusService.deleteSyllabus(id)
  res.json({ message: 'Syllabus deleted' })
}
