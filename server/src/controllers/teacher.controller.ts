import type { Request, Response } from 'express'
import {
  idParamSchema,
  listQuerySchema,
  paginated,
} from '../validators/common.validators.js'
import {
  createTeacherSchema,
  updateTeacherSchema,
  resetPasswordSchema,
} from '../validators/teacher.validators.js'
import * as teacherService from '../services/teacher.service.js'

export async function list(req: Request, res: Response) {
  const { page, limit, search } = listQuerySchema.parse(req.query)
  const { rows, total } = await teacherService.listTeachers(page, limit, search)
  res.json(paginated(rows, total, page, limit))
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const teacher = await teacherService.getTeacher(id)
  res.json({ teacher })
}

export async function create(req: Request, res: Response) {
  const data = createTeacherSchema.parse(req.body)
  const teacher = await teacherService.createTeacher(data)
  res.status(201).json({ teacher })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateTeacherSchema.parse(req.body)
  const teacher = await teacherService.updateTeacher(id, data)
  res.json({ teacher })
}

export async function resetPassword(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const { password } = resetPasswordSchema.parse(req.body)
  await teacherService.resetTeacherPassword(id, password)
  res.json({ message: 'Password reset' })
}
