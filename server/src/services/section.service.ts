// Business logic for sections (e.g. "5-A").
import { prisma } from '../config/prisma.js'
import { notFound, badRequest, conflict } from '../utils/AppError.js'
import type {
  CreateSectionInput,
  UpdateSectionInput,
} from '../validators/section.validators.js'

// Make sure a referenced class exists.
async function assertClassExists(classId: number) {
  const cls = await prisma.class.findUnique({ where: { id: classId } })
  if (!cls) throw badRequest('Selected class does not exist')
}

// Make sure a class-teacher, if provided, is a real teacher account.
async function assertTeacher(teacherId: number) {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } })
  if (!teacher || teacher.role !== 'teacher') {
    throw badRequest('Selected class teacher is not a valid teacher')
  }
}

// List sections, optionally filtered to one class.
export async function listSections(classId?: number) {
  return prisma.section.findMany({
    where: classId ? { classId } : undefined,
    orderBy: [{ classId: 'asc' }, { name: 'asc' }],
    include: {
      class: { select: { id: true, name: true } },
      classTeacher: { select: { id: true, fullName: true } },
      _count: { select: { students: true } },
    },
  })
}

export async function getSection(id: number) {
  const section = await prisma.section.findUnique({
    where: { id },
    include: {
      class: { select: { id: true, name: true } },
      classTeacher: { select: { id: true, fullName: true } },
    },
  })
  if (!section) throw notFound('Section not found')
  return section
}

export async function createSection(data: CreateSectionInput) {
  await assertClassExists(data.classId)
  if (data.classTeacherId) await assertTeacher(data.classTeacherId)
  return prisma.section.create({ data })
}

export async function updateSection(id: number, data: UpdateSectionInput) {
  await getSection(id)
  if (data.classTeacherId) await assertTeacher(data.classTeacherId)
  return prisma.section.update({ where: { id }, data })
}

export async function deleteSection(id: number) {
  await getSection(id)

  // Don't delete a section that still has students enrolled.
  const studentCount = await prisma.student.count({ where: { sectionId: id } })
  if (studentCount > 0) {
    throw conflict(
      `Cannot delete this section — ${studentCount} student(s) are enrolled. Move or remove them first.`
    )
  }

  return prisma.section.delete({ where: { id } })
}
