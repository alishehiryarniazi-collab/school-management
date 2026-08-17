// Business logic for authentication. Controllers stay thin and call these.
import type { User } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { comparePassword } from '../utils/password.js'
import { unauthorized } from '../utils/AppError.js'

// We use the SAME vague message for "no such user" and "wrong password" on
// purpose — so an attacker can't tell which emails/accounts exist.
const INVALID_STAFF = 'Invalid email or password'
const INVALID_STUDENT = 'Invalid class, roll number, or password'

// Admin / Teacher login by email.
export async function loginStaff(
  email: string,
  password: string
): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email } })

  // Must exist, be staff (not a student using this route), and be active.
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    throw unauthorized(INVALID_STAFF)
  }
  if (!user.isActive) throw unauthorized('Your account is disabled')

  const ok = await comparePassword(password, user.passwordHash)
  if (!ok) throw unauthorized(INVALID_STAFF)

  return user
}

// Student login by section + roll number.
export async function loginStudent(
  sectionId: number,
  rollNo: number,
  password: string
): Promise<User> {
  // (sectionId, rollNo) is unique, so this finds exactly one student.
  const student = await prisma.student.findUnique({
    where: { sectionId_rollNo: { sectionId, rollNo } },
    include: { user: true },
  })

  if (!student) throw unauthorized(INVALID_STUDENT)
  if (!student.user.isActive) throw unauthorized('Your account is disabled')

  const ok = await comparePassword(password, student.user.passwordHash)
  if (!ok) throw unauthorized(INVALID_STUDENT)

  return student.user
}

// Public: classes + their sections, for the student login dropdowns.
// Safe to expose (no personal data) — just the school's class/section names.
export async function getSchoolStructure() {
  return prisma.class.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      sections: {
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      },
    },
  })
}
