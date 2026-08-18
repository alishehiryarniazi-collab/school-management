// Business logic for syllabus (one entry per class + subject).
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { notFound, badRequest } from '../utils/AppError.js'
import type {
  CreateSyllabusInput,
  UpdateSyllabusInput,
} from '../validators/syllabus.validators.js'

const include = {
  subject: { select: { id: true, name: true } },
  class: { select: { id: true, name: true } },
} satisfies Prisma.SyllabusInclude

export async function listSyllabus(classId?: number) {
  return prisma.syllabus.findMany({
    where: classId ? { classId } : undefined,
    include,
    orderBy: [{ classId: 'asc' }, { subject: { name: 'asc' } }],
  })
}

export async function createSyllabus(data: CreateSyllabusInput) {
  const [cls, subject] = await Promise.all([
    prisma.class.findUnique({ where: { id: data.classId } }),
    prisma.subject.findUnique({ where: { id: data.subjectId } }),
  ])
  if (!cls) throw badRequest('Selected class does not exist')
  if (!subject) throw badRequest('Selected subject does not exist')
  // Unique(classId, subjectId) -> duplicate returns 409 via error handler.
  return prisma.syllabus.create({ data, include })
}

export async function updateSyllabus(id: number, data: UpdateSyllabusInput) {
  const existing = await prisma.syllabus.findUnique({ where: { id } })
  if (!existing) throw notFound('Syllabus not found')
  return prisma.syllabus.update({ where: { id }, data, include })
}

export async function deleteSyllabus(id: number) {
  const existing = await prisma.syllabus.findUnique({ where: { id } })
  if (!existing) throw notFound('Syllabus not found')
  return prisma.syllabus.delete({ where: { id } })
}
