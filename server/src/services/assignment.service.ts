// Business logic for teaching assignments (teacher ↔ section ↔ subject).
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { badRequest, notFound } from '../utils/AppError.js'
import type { CreateAssignmentInput } from '../validators/assignment.validators.js'

const assignmentInclude = {
  teacher: { select: { id: true, fullName: true } },
  subject: { select: { id: true, name: true } },
  section: {
    select: {
      id: true,
      name: true,
      class: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.TeachingAssignmentInclude

export async function listAssignments(filter: {
  teacherId?: number
  sectionId?: number
  subjectId?: number
}) {
  return prisma.teachingAssignment.findMany({
    where: {
      ...(filter.teacherId ? { teacherId: filter.teacherId } : {}),
      ...(filter.sectionId ? { sectionId: filter.sectionId } : {}),
      ...(filter.subjectId ? { subjectId: filter.subjectId } : {}),
    },
    include: assignmentInclude,
    orderBy: { id: 'desc' },
  })
}

export async function createAssignment(data: CreateAssignmentInput) {
  // Validate all three references exist and the teacher really is a teacher.
  const [teacher, section, subject] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.teacherId } }),
    prisma.section.findUnique({ where: { id: data.sectionId } }),
    prisma.subject.findUnique({ where: { id: data.subjectId } }),
  ])
  if (!teacher || teacher.role !== 'teacher') {
    throw badRequest('Selected teacher is not valid')
  }
  if (!section) throw badRequest('Selected section does not exist')
  if (!subject) throw badRequest('Selected subject does not exist')

  // Duplicate (same teacher+section+subject) -> P2002 -> 409 via error handler.
  return prisma.teachingAssignment.create({
    data,
    include: assignmentInclude,
  })
}

export async function deleteAssignment(id: number) {
  const existing = await prisma.teachingAssignment.findUnique({ where: { id } })
  if (!existing) throw notFound('Assignment not found')
  return prisma.teachingAssignment.delete({ where: { id } })
}
