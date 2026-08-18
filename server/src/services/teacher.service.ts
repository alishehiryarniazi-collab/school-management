// Business logic for teacher accounts. Teachers are Users with role='teacher'.
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { notFound } from '../utils/AppError.js'
import { hashPassword } from '../utils/password.js'
import { getSkipTake } from '../validators/common.validators.js'
import type {
  CreateTeacherInput,
  UpdateTeacherInput,
} from '../validators/teacher.validators.js'

// Fields safe to return (never the password hash).
const teacherSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  isActive: true,
  createdAt: true,
  _count: { select: { teachingAssignments: true, classTeacherOf: true } },
} satisfies Prisma.UserSelect

// Paginated list with optional name/email search.
export async function listTeachers(
  page: number,
  limit: number,
  search?: string
) {
  const where: Prisma.UserWhereInput = {
    role: 'teacher',
    ...(search
      ? {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
  }

  const { skip, take } = getSkipTake(page, limit)
  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: teacherSelect,
      orderBy: { fullName: 'asc' },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ])
  return { rows, total }
}

export async function getTeacher(id: number) {
  const teacher = await prisma.user.findFirst({
    where: { id, role: 'teacher' },
    select: teacherSelect,
  })
  if (!teacher) throw notFound('Teacher not found')
  return teacher
}

export async function createTeacher(data: CreateTeacherInput) {
  const passwordHash = await hashPassword(data.password)
  return prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: 'teacher',
      passwordHash,
    },
    select: teacherSelect,
  })
}

export async function updateTeacher(id: number, data: UpdateTeacherInput) {
  await getTeacher(id) // 404 if not a teacher
  return prisma.user.update({
    where: { id },
    data,
    select: teacherSelect,
  })
}

// Reset a teacher's password (admin action).
export async function resetTeacherPassword(id: number, newPassword: string) {
  await getTeacher(id)
  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id }, data: { passwordHash } })
}
