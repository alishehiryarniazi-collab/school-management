// Business logic for subjects (Math, English…).
import { prisma } from '../config/prisma.js'
import { notFound, conflict } from '../utils/AppError.js'
import type {
  CreateSubjectInput,
  UpdateSubjectInput,
} from '../validators/subject.validators.js'

export async function listSubjects() {
  return prisma.subject.findMany({ orderBy: { name: 'asc' } })
}

export async function getSubject(id: number) {
  const subject = await prisma.subject.findUnique({ where: { id } })
  if (!subject) throw notFound('Subject not found')
  return subject
}

export async function createSubject(data: CreateSubjectInput) {
  return prisma.subject.create({ data })
}

export async function updateSubject(id: number, data: UpdateSubjectInput) {
  await getSubject(id)
  return prisma.subject.update({ where: { id }, data })
}

export async function deleteSubject(id: number) {
  await getSubject(id)

  // The subject's relations cascade-delete, so removing a subject that's in
  // use would silently wipe marks/syllabus/etc. Guard against that: only
  // allow deletion when the subject is not referenced anywhere.
  const [assignments, marks, syllabus, datesheet, timetable] =
    await Promise.all([
      prisma.teachingAssignment.count({ where: { subjectId: id } }),
      prisma.mark.count({ where: { subjectId: id } }),
      prisma.syllabus.count({ where: { subjectId: id } }),
      prisma.datesheet.count({ where: { subjectId: id } }),
      prisma.timetable.count({ where: { subjectId: id } }),
    ])
  const inUse = assignments + marks + syllabus + datesheet + timetable
  if (inUse > 0) {
    throw conflict(
      'Cannot delete this subject — it is still used in assignments, marks, syllabus, date sheet, or timetable.'
    )
  }

  return prisma.subject.delete({ where: { id } })
}
