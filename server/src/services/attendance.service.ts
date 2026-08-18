// Business logic for attendance. Teachers pick a section + day, see the roster,
// and mark each student. We store one row per student per day (midnight UTC).
import { prisma } from '../config/prisma.js'
import { notFound, badRequest } from '../utils/AppError.js'
import { startOfDayUTC, toDateStr } from '../utils/date.js'
import type { MarkAttendanceInput } from '../validators/attendance.validators.js'

// Load the active students of a section plus their status for the given day.
export async function getSectionAttendance(sectionId: number, dateStr: string) {
  const date = startOfDayUTC(dateStr)

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      name: true,
      class: { select: { id: true, name: true } },
    },
  })
  if (!section) throw notFound('Section not found')

  const students = await prisma.student.findMany({
    where: { sectionId, user: { isActive: true } },
    orderBy: { rollNo: 'asc' },
    select: {
      id: true,
      rollNo: true,
      user: { select: { fullName: true } },
    },
  })

  // Existing attendance for these students on this date.
  const existing = await prisma.attendance.findMany({
    where: { date, studentId: { in: students.map((s) => s.id) } },
    select: { studentId: true, status: true },
  })
  const statusByStudent = new Map(existing.map((a) => [a.studentId, a.status]))

  const roster = students.map((s) => ({
    studentId: s.id,
    rollNo: s.rollNo,
    fullName: s.user.fullName,
    status: statusByStudent.get(s.id) ?? null, // null = not marked yet
  }))

  return { section, date: toDateStr(date), roster }
}

// Bulk create/update attendance for a section on a day.
export async function markAttendance(
  input: MarkAttendanceInput,
  markedById: number
) {
  const { sectionId, records } = input
  const date = startOfDayUTC(input.date)

  const section = await prisma.section.findUnique({ where: { id: sectionId } })
  if (!section) throw badRequest('Section not found')

  // Make sure every student in the payload actually belongs to this section.
  const sectionStudentIds = new Set(
    (
      await prisma.student.findMany({
        where: { sectionId },
        select: { id: true },
      })
    ).map((s) => s.id)
  )
  for (const r of records) {
    if (!sectionStudentIds.has(r.studentId)) {
      throw badRequest('A student in the list does not belong to this section')
    }
  }

  // Upsert each record atomically (one row per student per day).
  await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date } },
        update: { status: r.status, markedById },
        create: {
          studentId: r.studentId,
          date,
          status: r.status,
          markedById,
        },
      })
    )
  )

  return getSectionAttendance(sectionId, input.date)
}
