// Read-only data for the logged-in student's portal. Everything here is scoped
// to the student's own record / section / class — a student can only see their
// own information.
import { prisma } from '../config/prisma.js'
import { notFound } from '../utils/AppError.js'
import { listNoticesForStudents } from './notice.service.js'

// Resolve the Student row (with section + class) from the logged-in user id.
async function getStudentByUser(userId: number) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: { select: { fullName: true, email: true } },
      section: {
        select: {
          id: true,
          name: true,
          classId: true,
          class: { select: { id: true, name: true } },
          classTeacher: { select: { id: true, fullName: true } },
        },
      },
    },
  })
  if (!student) throw notFound('Student record not found')
  return student
}

export async function getProfile(userId: number) {
  const s = await getStudentByUser(userId)
  return {
    id: s.id,
    fullName: s.user.fullName,
    rollNo: s.rollNo,
    gender: s.gender,
    className: s.section.class.name,
    sectionName: s.section.name,
    classTeacher: s.section.classTeacher?.fullName ?? null,
  }
}

export async function getAttendance(userId: number) {
  const s = await getStudentByUser(userId)
  const rows = await prisma.attendance.findMany({
    where: { studentId: s.id },
    orderBy: { date: 'desc' },
    select: { date: true, status: true },
  })

  // Summary counts + attendance percentage (present+late counts as attended).
  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    total: rows.length,
  }
  for (const r of rows) summary[r.status as keyof typeof summary]++
  const attended = summary.present + summary.late
  const percentage =
    summary.total > 0 ? Math.round((attended / summary.total) * 100) : 0

  return { summary, percentage, records: rows }
}

export async function getMarks(userId: number) {
  const s = await getStudentByUser(userId)
  return prisma.mark.findMany({
    where: { studentId: s.id },
    include: { subject: { select: { id: true, name: true } } },
    orderBy: [{ examName: 'asc' }, { subject: { name: 'asc' } }],
  })
}

export async function getSyllabus(userId: number) {
  const s = await getStudentByUser(userId)
  return prisma.syllabus.findMany({
    where: { classId: s.section.classId },
    include: { subject: { select: { id: true, name: true } } },
    orderBy: { subject: { name: 'asc' } },
  })
}

export async function getDatesheet(userId: number) {
  const s = await getStudentByUser(userId)
  return prisma.datesheet.findMany({
    where: { classId: s.section.classId },
    include: { subject: { select: { id: true, name: true } } },
    orderBy: [{ examDate: 'asc' }, { startTime: 'asc' }],
  })
}

export async function getTimetable(userId: number) {
  const s = await getStudentByUser(userId)
  return prisma.timetable.findMany({
    where: { sectionId: s.section.id },
    include: {
      subject: { select: { id: true, name: true } },
      teacher: { select: { id: true, fullName: true } },
    },
    orderBy: { periodNo: 'asc' },
  })
}

export async function getNotices() {
  return listNoticesForStudents()
}
