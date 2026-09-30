// Compiles a student's marks for one exam into a result card (grades,
// percentage, total, position in class, pass/fail).
import { prisma } from '../config/prisma.js'
import { notFound, badRequest } from '../utils/AppError.js'
import { gradeFor, PASS_PERCENT } from '../utils/grade.js'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export interface SubjectResult {
  subject: string
  obtained: number
  total: number
  percent: number
  grade: string
}
export interface StudentResult {
  studentId: number
  name: string
  rollNo: number
  guardianName: string | null
  subjects: SubjectResult[]
  totalObtained: number
  totalMax: number
  percent: number
  grade: string
  result: 'Pass' | 'Fail' | 'N/A'
  position: number
}

// Distinct exam names recorded for a section (for the dropdown).
export async function listSectionExams(sectionId: number): Promise<string[]> {
  const rows = await prisma.mark.findMany({
    where: { student: { sectionId } },
    distinct: ['examName'],
    select: { examName: true },
    orderBy: { examName: 'asc' },
  })
  return rows.map((r) => r.examName)
}

// Everyone in a section, compiled + ranked for one exam.
export async function compileClassResults(sectionId: number, examName: string) {
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
      guardianName: true,
      user: { select: { fullName: true } },
      marks: {
        where: { examName },
        select: {
          marksObtained: true,
          totalMarks: true,
          subject: { select: { name: true } },
        },
      },
    },
  })

  const results: StudentResult[] = students.map((s) => {
    const subjects: SubjectResult[] = s.marks.map((m) => {
      const percent =
        m.totalMarks > 0 ? (m.marksObtained / m.totalMarks) * 100 : 0
      return {
        subject: m.subject.name,
        obtained: m.marksObtained,
        total: m.totalMarks,
        percent: round2(percent),
        grade: gradeFor(percent),
      }
    })
    const totalObtained = round2(subjects.reduce((a, b) => a + b.obtained, 0))
    const totalMax = round2(subjects.reduce((a, b) => a + b.total, 0))
    const percent = totalMax > 0 ? round2((totalObtained / totalMax) * 100) : 0
    return {
      studentId: s.id,
      name: s.user.fullName,
      rollNo: s.rollNo,
      guardianName: s.guardianName,
      subjects,
      totalObtained,
      totalMax,
      percent,
      grade: subjects.length ? gradeFor(percent) : '—',
      result:
        subjects.length === 0
          ? 'N/A'
          : percent >= PASS_PERCENT
            ? 'Pass'
            : 'Fail',
      position: 0,
    }
  })

  // Rank by total obtained (students with marks only). Ties get the next number.
  const ranked = [...results]
    .filter((r) => r.subjects.length > 0)
    .sort((a, b) => b.totalObtained - a.totalObtained)
  ranked.forEach((r, i) => {
    r.position = i + 1
  })

  return { section, examName, students: results, classSize: ranked.length }
}

// One student's full result card (with position + school-relative class size).
export async function getResultCard(studentId: number, examName: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { sectionId: true },
  })
  if (!student) throw notFound('Student not found')

  const cls = await compileClassResults(student.sectionId, examName)
  const card = cls.students.find((s) => s.studentId === studentId)
  if (!card) throw badRequest('No result found for this student/exam')

  return {
    section: cls.section,
    examName,
    classSize: cls.classSize,
    ...card,
  }
}
