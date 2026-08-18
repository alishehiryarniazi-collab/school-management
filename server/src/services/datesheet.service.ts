// Business logic for the exam date sheet (one row per class + exam + subject).
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { notFound, badRequest } from '../utils/AppError.js'
import { startOfDayUTC } from '../utils/date.js'
import type {
  CreateDatesheetInput,
  UpdateDatesheetInput,
} from '../validators/datesheet.validators.js'

const include = {
  subject: { select: { id: true, name: true } },
  class: { select: { id: true, name: true } },
} satisfies Prisma.DatesheetInclude

export async function listDatesheet(filter: {
  classId?: number
  examName?: string
}) {
  return prisma.datesheet.findMany({
    where: {
      ...(filter.classId ? { classId: filter.classId } : {}),
      ...(filter.examName ? { examName: filter.examName } : {}),
    },
    include,
    orderBy: [{ examDate: 'asc' }, { startTime: 'asc' }],
  })
}

export async function createDatesheet(data: CreateDatesheetInput) {
  const [cls, subject] = await Promise.all([
    prisma.class.findUnique({ where: { id: data.classId } }),
    prisma.subject.findUnique({ where: { id: data.subjectId } }),
  ])
  if (!cls) throw badRequest('Selected class does not exist')
  if (!subject) throw badRequest('Selected subject does not exist')

  return prisma.datesheet.create({
    data: { ...data, examDate: startOfDayUTC(data.examDate) },
    include,
  })
}

export async function updateDatesheet(id: number, data: UpdateDatesheetInput) {
  const existing = await prisma.datesheet.findUnique({ where: { id } })
  if (!existing) throw notFound('Date sheet entry not found')

  return prisma.datesheet.update({
    where: { id },
    data: {
      ...data,
      ...(data.examDate ? { examDate: startOfDayUTC(data.examDate) } : {}),
    },
    include,
  })
}

export async function deleteDatesheet(id: number) {
  const existing = await prisma.datesheet.findUnique({ where: { id } })
  if (!existing) throw notFound('Date sheet entry not found')
  return prisma.datesheet.delete({ where: { id } })
}
