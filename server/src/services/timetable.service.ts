// Business logic for the weekly timetable (one slot per section/day/period).
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { notFound, badRequest } from '../utils/AppError.js'
import type {
  CreateTimetableInput,
  UpdateTimetableInput,
} from '../validators/timetable.validators.js'

const include = {
  subject: { select: { id: true, name: true } },
  teacher: { select: { id: true, fullName: true } },
} satisfies Prisma.TimetableInclude

export async function listTimetable(sectionId: number) {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      name: true,
      class: { select: { id: true, name: true } },
    },
  })
  if (!section) throw notFound('Section not found')

  const slots = await prisma.timetable.findMany({
    where: { sectionId },
    include,
    orderBy: [{ periodNo: 'asc' }],
  })
  return { section, slots }
}

async function assertRefs(subjectId: number, teacherId?: number | null) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) throw badRequest('Selected subject does not exist')
  if (teacherId) {
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } })
    if (!teacher || teacher.role !== 'teacher') {
      throw badRequest('Selected teacher is not valid')
    }
  }
}

export async function createTimetableSlot(data: CreateTimetableInput) {
  const section = await prisma.section.findUnique({
    where: { id: data.sectionId },
  })
  if (!section) throw badRequest('Section not found')
  await assertRefs(data.subjectId, data.teacherId)
  // Unique(sectionId, dayOfWeek, periodNo) -> duplicate = 409.
  return prisma.timetable.create({ data, include })
}

export async function updateTimetableSlot(
  id: number,
  data: UpdateTimetableInput
) {
  const existing = await prisma.timetable.findUnique({ where: { id } })
  if (!existing) throw notFound('Timetable slot not found')
  if (data.subjectId || data.teacherId) {
    await assertRefs(
      data.subjectId ?? existing.subjectId,
      data.teacherId ?? existing.teacherId
    )
  }
  return prisma.timetable.update({ where: { id }, data, include })
}

export async function deleteTimetableSlot(id: number) {
  const existing = await prisma.timetable.findUnique({ where: { id } })
  if (!existing) throw notFound('Timetable slot not found')
  return prisma.timetable.delete({ where: { id } })
}
