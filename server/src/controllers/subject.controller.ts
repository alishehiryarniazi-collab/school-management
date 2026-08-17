import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  createSubjectSchema,
  updateSubjectSchema,
} from '../validators/subject.validators.js'
import * as subjectService from '../services/subject.service.js'

export async function list(_req: Request, res: Response) {
  const subjects = await subjectService.listSubjects()
  res.json({ subjects })
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const subject = await subjectService.getSubject(id)
  res.json({ subject })
}

export async function create(req: Request, res: Response) {
  const data = createSubjectSchema.parse(req.body)
  const subject = await subjectService.createSubject(data)
  res.status(201).json({ subject })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateSubjectSchema.parse(req.body)
  const subject = await subjectService.updateSubject(id, data)
  res.json({ subject })
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await subjectService.deleteSubject(id)
  res.json({ message: 'Subject deleted' })
}
