import type { Request, Response } from 'express'
import {
  idParamSchema,
  listQuerySchema,
  paginated,
} from '../validators/common.validators.js'
import {
  createStudentSchema,
  updateStudentSchema,
  assignSectionSchema,
  studentFilterSchema,
  resetPasswordSchema,
} from '../validators/student.validators.js'
import * as studentService from '../services/student.service.js'

export async function list(req: Request, res: Response) {
  const { page, limit, search } = listQuerySchema.parse(req.query)
  const { classId, sectionId } = studentFilterSchema.parse(req.query)
  const { rows, total } = await studentService.listStudents({
    page,
    limit,
    search,
    classId,
    sectionId,
  })
  res.json(paginated(rows, total, page, limit))
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const student = await studentService.getStudent(id)
  res.json({ student })
}

export async function create(req: Request, res: Response) {
  const data = createStudentSchema.parse(req.body)
  const student = await studentService.createStudent(data)
  res.status(201).json({ student })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateStudentSchema.parse(req.body)
  const student = await studentService.updateStudent(id, data)
  res.json({ student })
}

// PATCH /students/:id/assign — arrange a student into a class/section.
export async function assign(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = assignSectionSchema.parse(req.body)
  const student = await studentService.assignSection(id, data)
  res.json({ student })
}

export async function resetPassword(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const { password } = resetPasswordSchema.parse(req.body)
  await studentService.resetStudentPassword(id, password)
  res.json({ message: 'Password reset' })
}
