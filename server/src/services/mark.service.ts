// Business logic for marks. A teacher picks a section + subject + exam, enters
// each student's marks out of a total, and saves. One row per
// (student, subject, exam).
import { prisma } from '../config/prisma.js'
import { notFound, badRequest } from '../utils/AppError.js'
import type { SaveMarksInput } from '../validators/mark.validators.js'

// Distinct exam names already recorded for a section + subject.
export async function listExams(sectionId: number, subjectId: number) {
  const rows = await prisma.mark.findMany({
    where: { subjectId, student: { sectionId } },
    distinct: ['examName'],
    select: { examName: true },
    orderBy: { examName: 'asc' },
  })
  return rows.map((r) => r.examName)
}

// Roster of a section with each student's marks for a subject + exam.
export async function getMarks(
  sectionId: number,
  subjectId: number,
  examName: string
) {
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
    select: { id: true, rollNo: true, user: { select: { fullName: true } } },
  })

  const marks = await prisma.mark.findMany({
    where: {
      subjectId,
      examName,
      studentId: { in: students.map((s) => s.id) },
    },
    select: { studentId: true, marksObtained: true, totalMarks: true },
  })
  const byStudent = new Map(marks.map((m) => [m.studentId, m]))

  const roster = students.map((s) => {
    const m = byStudent.get(s.id)
    return {
      studentId: s.id,
      rollNo: s.rollNo,
      fullName: s.user.fullName,
      marksObtained: m?.marksObtained ?? null,
      totalMarks: m?.totalMarks ?? null,
    }
  })

  return { section, subjectId, examName, roster }
}

export async function saveMarks(input: SaveMarksInput) {
  const { sectionId, subjectId, examName, totalMarks, records } = input

  const [section, subject] = await Promise.all([
    prisma.section.findUnique({ where: { id: sectionId } }),
    prisma.subject.findUnique({ where: { id: subjectId } }),
  ])
  if (!section) throw badRequest('Section not found')
  if (!subject) throw badRequest('Subject not found')

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
    if (r.marksObtained > totalMarks) {
      throw badRequest(
        `Marks (${r.marksObtained}) cannot be more than total (${totalMarks})`
      )
    }
  }

  await prisma.$transaction(
    records.map((r) =>
      prisma.mark.upsert({
        where: {
          studentId_subjectId_examName: {
            studentId: r.studentId,
            subjectId,
            examName,
          },
        },
        update: { marksObtained: r.marksObtained, totalMarks },
        create: {
          studentId: r.studentId,
          subjectId,
          examName,
          marksObtained: r.marksObtained,
          totalMarks,
        },
      })
    )
  )

  return getMarks(sectionId, subjectId, examName)
}
