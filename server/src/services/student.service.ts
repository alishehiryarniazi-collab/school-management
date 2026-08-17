// Business logic for students. A student = a User (role='student') + a Student
// profile row. We keep them in sync using transactions.
import { randomUUID } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { notFound, badRequest, conflict } from '../utils/AppError.js'
import { hashPassword } from '../utils/password.js'
import { env } from '../config/env.js'
import { getSkipTake } from '../validators/common.validators.js'
import type {
  CreateStudentInput,
  UpdateStudentInput,
  AssignSectionInput,
} from '../validators/student.validators.js'

// Shape returned to the client for a student (no password hash).
const studentInclude = {
  user: { select: { id: true, fullName: true, email: true, isActive: true } },
  section: {
    select: {
      id: true,
      name: true,
      class: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.StudentInclude

// Students never log in with email, but User.email is unique+required, so we
// generate a unique synthetic one. The random suffix keeps it unique even if a
// section+roll is later reused by a different student.
function syntheticEmail(sectionId: number, rollNo: number) {
  return `student.${sectionId}.${rollNo}.${randomUUID().slice(0, 8)}@school.local`
}

async function assertSectionExists(sectionId: number) {
  const section = await prisma.section.findUnique({ where: { id: sectionId } })
  if (!section) throw badRequest('Selected section does not exist')
}

// Ensure a roll number is free within a section (nice message before hitting
// the DB unique constraint). excludeStudentId skips the student being edited.
async function assertRollAvailable(
  sectionId: number,
  rollNo: number,
  excludeStudentId?: number
) {
  const existing = await prisma.student.findUnique({
    where: { sectionId_rollNo: { sectionId, rollNo } },
  })
  if (existing && existing.id !== excludeStudentId) {
    throw conflict(`Roll number ${rollNo} is already used in this section`)
  }
}

export async function listStudents(opts: {
  page: number
  limit: number
  search?: string
  classId?: number
  sectionId?: number
}) {
  const { page, limit, search, classId, sectionId } = opts

  const where: Prisma.StudentWhereInput = {
    ...(sectionId ? { sectionId } : {}),
    ...(classId ? { section: { classId } } : {}),
    ...(search
      ? {
          OR: [
            { user: { fullName: { contains: search } } },
            // allow searching by roll number typed as text
            ...(Number.isNaN(Number(search))
              ? []
              : [{ rollNo: Number(search) }]),
          ],
        }
      : {}),
  }

  const { skip, take } = getSkipTake(page, limit)
  const [rows, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: studentInclude,
      orderBy: [{ sectionId: 'asc' }, { rollNo: 'asc' }],
      skip,
      take,
    }),
    prisma.student.count({ where }),
  ])
  return { rows, total }
}

export async function getStudent(id: number) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: studentInclude,
  })
  if (!student) throw notFound('Student not found')
  return student
}

export async function createStudent(data: CreateStudentInput) {
  await assertSectionExists(data.sectionId)
  await assertRollAvailable(data.sectionId, data.rollNo)

  const email = data.email ?? syntheticEmail(data.sectionId, data.rollNo)
  const passwordHash = await hashPassword(
    data.password ?? env.DEFAULT_STUDENT_PASSWORD
  )

  // Create the login (User) and profile (Student) together, atomically.
  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email,
      role: 'student',
      passwordHash,
      student: {
        create: {
          rollNo: data.rollNo,
          sectionId: data.sectionId,
          gender: data.gender,
          dob: data.dob,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          address: data.address,
        },
      },
    },
    select: { student: { include: studentInclude } },
  })
  return user.student
}

export async function updateStudent(id: number, data: UpdateStudentInput) {
  const current = await getStudent(id)

  // If moving section or changing roll, verify the new combo is free.
  const nextSection = data.sectionId ?? current.sectionId
  const nextRoll = data.rollNo ?? current.rollNo
  if (data.sectionId !== undefined) await assertSectionExists(data.sectionId)
  if (data.sectionId !== undefined || data.rollNo !== undefined) {
    await assertRollAvailable(nextSection, nextRoll, id)
  }

  // Split fields between the User table and the Student table.
  const userData: Prisma.UserUpdateInput = {
    fullName: data.fullName,
    isActive: data.isActive,
  }
  // Unchecked lets us set the sectionId foreign key directly (vs section.connect).
  const studentData: Prisma.StudentUncheckedUpdateInput = {
    rollNo: data.rollNo,
    sectionId: data.sectionId,
    gender: data.gender,
    dob: data.dob,
    guardianName: data.guardianName,
    guardianPhone: data.guardianPhone,
    address: data.address,
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: current.user.id }, data: userData }),
    prisma.student.update({ where: { id }, data: studentData }),
  ])
  return getStudent(id)
}

// The "arrange student into a class/section" action.
export async function assignSection(id: number, data: AssignSectionInput) {
  const current = await getStudent(id)
  await assertSectionExists(data.sectionId)

  const nextRoll = data.rollNo ?? current.rollNo
  await assertRollAvailable(data.sectionId, nextRoll, id)

  await prisma.student.update({
    where: { id },
    data: { sectionId: data.sectionId, rollNo: nextRoll },
  })
  return getStudent(id)
}

export async function resetStudentPassword(id: number, newPassword: string) {
  const student = await getStudent(id)
  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: student.user.id },
    data: { passwordHash },
  })
}
