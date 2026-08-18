// Business logic for classes (e.g. "Class 5").
import { prisma } from '../config/prisma.js'
import { notFound, conflict } from '../utils/AppError.js'
import type {
  CreateClassInput,
  UpdateClassInput,
} from '../validators/class.validators.js'

// List all classes with their sections and a student count per section.
export async function listClasses() {
  return prisma.class.findMany({
    orderBy: { name: 'asc' },
    include: {
      sections: {
        orderBy: { name: 'asc' },
        include: {
          classTeacher: { select: { id: true, fullName: true } },
          _count: { select: { students: true } },
        },
      },
    },
  })
}

export async function getClass(id: number) {
  const cls = await prisma.class.findUnique({
    where: { id },
    include: { sections: { orderBy: { name: 'asc' } } },
  })
  if (!cls) throw notFound('Class not found')
  return cls
}

export async function createClass(data: CreateClassInput) {
  // Unique constraint on name -> Prisma P2002 handled globally as 409.
  return prisma.class.create({ data })
}

export async function updateClass(id: number, data: UpdateClassInput) {
  await getClass(id) // 404 if missing
  return prisma.class.update({ where: { id }, data })
}

export async function deleteClass(id: number) {
  await getClass(id)

  // Safety guard: never wipe out enrolled students by deleting their class.
  // (Sections cascade with the class, but students are Restrict-protected;
  // we check explicitly to give a clear message instead of a DB error.)
  const studentCount = await prisma.student.count({
    where: { section: { classId: id } },
  })
  if (studentCount > 0) {
    throw conflict(
      `Cannot delete this class — ${studentCount} student(s) are still enrolled. Move or remove them first.`
    )
  }

  return prisma.class.delete({ where: { id } })
}
