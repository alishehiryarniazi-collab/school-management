// Aggregated numbers for the admin/teacher dashboard.
import { prisma } from '../config/prisma.js'
import { startOfDayUTC } from '../utils/date.js'
import { getReport } from './challan.service.js'

const round = (n: number) => Math.round(n)

// includeFees = false for teachers (fees are admin-only).
export async function getDashboard(includeFees: boolean) {
  const today = startOfDayUTC(new Date())

  const [studentsActive, teachers, classes, sections, subjects, attRows] =
    await Promise.all([
      prisma.student.count({ where: { user: { isActive: true } } }),
      prisma.user.count({ where: { role: 'teacher', isActive: true } }),
      prisma.class.count(),
      prisma.section.count(),
      prisma.subject.count(),
      prisma.attendance.findMany({
        where: { date: today },
        select: { status: true },
      }),
    ])

  // Today's attendance breakdown.
  const attendance = { present: 0, absent: 0, late: 0, leave: 0 }
  for (const r of attRows) {
    if (r.status in attendance)
      attendance[r.status as keyof typeof attendance]++
  }
  const marked = attRows.length
  const attended = attendance.present + attendance.late

  let fees = null
  if (includeFees) {
    const r = await getReport() // all-time snapshot
    fees = {
      collected: r.collected,
      outstanding: r.outstanding,
      billed: r.billed,
      paidCount: r.paidCount,
      pendingCount: r.partialCount + r.unpaidCount,
      defaulters: r.defaulters.length,
      percentCollected:
        r.billed > 0 ? round((r.collected / r.billed) * 100) : 0,
    }
  }

  return {
    students: { total: studentsActive },
    structure: { teachers, classes, sections, subjects },
    attendanceToday: {
      ...attendance,
      total: studentsActive,
      marked,
      percentPresent: marked > 0 ? round((attended / marked) * 100) : 0,
    },
    fees,
  }
}
