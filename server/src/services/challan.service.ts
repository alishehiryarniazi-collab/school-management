// Fee challans: generating bills, collecting payments, and reporting.
//
// Money model per challan:
//   itemsTotal = sum(item.amount)
//   payable    = itemsTotal + fine - discount   (stored as `total`)
//   remaining  = payable - paidAmount
// status: 'unpaid' (paid 0) | 'partial' (0 < paid < payable) | 'paid' (paid >= payable)
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { notFound, badRequest } from '../utils/AppError.js'
import { startOfDayUTC } from '../utils/date.js'
import type { GenerateChallansInput } from '../validators/fee.validators.js'

// Avoid floating-point drift on money.
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

const challanInclude = {
  items: true,
  student: {
    select: {
      id: true,
      rollNo: true,
      user: { select: { fullName: true } },
      section: {
        select: {
          id: true,
          name: true,
          class: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.FeeChallanInclude

// Generate one challan per active student in a section for a period.
export async function generateChallans(input: GenerateChallansInput) {
  const { sectionId, period, title, feeHeadIds, dueDate } = input

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { id: true, classId: true },
  })
  if (!section) throw badRequest('Section not found')

  // Fee amounts for this class + the chosen fee heads.
  const classFees = await prisma.classFee.findMany({
    where: { classId: section.classId, feeHeadId: { in: feeHeadIds } },
    include: { feeHead: { select: { name: true } } },
  })
  if (classFees.length === 0) {
    throw badRequest(
      'No fee amounts are set for this class yet. Set the class fees first.'
    )
  }

  const students = await prisma.student.findMany({
    where: { sectionId, user: { isActive: true } },
    select: { id: true },
  })

  const due = dueDate ? startOfDayUTC(dueDate) : null
  let created = 0
  let skipped = 0

  for (const s of students) {
    // Skip if this student already has a challan for this period.
    const existing = await prisma.feeChallan.findUnique({
      where: { studentId_period: { studentId: s.id, period } },
    })
    if (existing) {
      skipped++
      continue
    }

    const items = classFees.map((cf) => ({
      feeHeadId: cf.feeHeadId,
      label: cf.feeHead.name,
      amount: cf.amount,
    }))
    const total = round2(items.reduce((sum, i) => sum + i.amount, 0))

    await prisma.feeChallan.create({
      data: {
        studentId: s.id,
        period,
        title,
        dueDate: due,
        total,
        items: { create: items },
      },
    })
    created++
  }

  return { created, skipped, students: students.length }
}

// Auto: generate monthly challans (recurring fees only) for EVERY section.
// Sections whose class has no fee amounts set are simply skipped.
export async function generateMonthlyForSchool(input: {
  period: string
  title: string
  dueDate?: string
}) {
  const recurring = await prisma.feeHead.findMany({
    where: { isRecurring: true },
    select: { id: true },
  })
  if (recurring.length === 0) {
    throw badRequest('No monthly (recurring) fee type is set up yet.')
  }
  const feeHeadIds = recurring.map((h) => h.id)
  const sections = await prisma.section.findMany({ select: { id: true } })

  let created = 0
  let skipped = 0
  let students = 0
  let sectionsDone = 0
  for (const sec of sections) {
    try {
      const r = await generateChallans({
        sectionId: sec.id,
        period: input.period,
        title: input.title,
        feeHeadIds,
        dueDate: input.dueDate,
      })
      created += r.created
      skipped += r.skipped
      students += r.students
      sectionsDone++
    } catch {
      // this class has no fees set yet — skip it
    }
  }
  return { created, skipped, students, sections: sectionsDone }
}

export async function listChallans(filter: {
  studentId?: number
  sectionId?: number
  classId?: number
  status?: string
  period?: string
}) {
  const where: Prisma.FeeChallanWhereInput = {
    ...(filter.studentId ? { studentId: filter.studentId } : {}),
    ...(filter.status ? { status: filter.status } : {}),
    ...(filter.period ? { period: filter.period } : {}),
    ...(filter.sectionId || filter.classId
      ? {
          student: {
            ...(filter.sectionId ? { sectionId: filter.sectionId } : {}),
            ...(filter.classId ? { section: { classId: filter.classId } } : {}),
          },
        }
      : {}),
  }
  return prisma.feeChallan.findMany({
    where,
    include: challanInclude,
    orderBy: { issueDate: 'desc' },
  })
}

export async function getChallan(id: number) {
  const challan = await prisma.feeChallan.findUnique({
    where: { id },
    include: challanInclude,
  })
  if (!challan) throw notFound('Challan not found')
  return challan
}

// Record a payment (full or partial). Optionally adjust fine/discount.
export async function payChallan(
  id: number,
  input: { amount: number; fine?: number; discount?: number }
) {
  const challan = await getChallan(id)

  const itemsTotal = round2(challan.items.reduce((s, i) => s + i.amount, 0))
  const fine = input.fine ?? challan.fine
  const discount = input.discount ?? challan.discount
  if (discount > itemsTotal + fine) {
    throw badRequest('Discount cannot be more than the fee amount')
  }

  const payable = round2(itemsTotal + fine - discount)
  const newPaid = round2(challan.paidAmount + input.amount)
  if (newPaid > payable + 0.001) {
    const remaining = round2(payable - challan.paidAmount)
    throw badRequest(`Amount is more than the remaining balance (${remaining})`)
  }

  const status = newPaid >= payable - 0.001 ? 'paid' : 'partial'
  const receiptNo =
    challan.receiptNo ?? `RCP-${String(challan.id).padStart(5, '0')}`

  return prisma.feeChallan.update({
    where: { id },
    data: {
      fine,
      discount,
      total: payable,
      paidAmount: newPaid,
      status,
      paidDate: new Date(),
      receiptNo,
    },
    include: challanInclude,
  })
}

export async function deleteChallan(id: number) {
  const challan = await getChallan(id)
  if (challan.paidAmount > 0) {
    throw badRequest('This challan has payments and cannot be deleted')
  }
  return prisma.feeChallan.delete({ where: { id } })
}

// Collection / outstanding / defaulters summary.
export async function getReport(period?: string) {
  const challans = await prisma.feeChallan.findMany({
    where: period ? { period } : {},
    include: challanInclude,
  })

  let collected = 0
  let billed = 0
  let paidCount = 0
  let partialCount = 0
  let unpaidCount = 0
  const defaulters: Array<{
    challanId: number
    studentId: number
    name: string
    rollNo: number
    className: string
    sectionName: string
    title: string
    due: number
  }> = []

  for (const c of challans) {
    collected += c.paidAmount
    billed += c.total
    if (c.status === 'paid') paidCount++
    else if (c.status === 'partial') partialCount++
    else unpaidCount++

    const due = round2(c.total - c.paidAmount)
    if (due > 0.001) {
      defaulters.push({
        challanId: c.id,
        studentId: c.student.id,
        name: c.student.user.fullName,
        rollNo: c.student.rollNo,
        className: c.student.section.class.name,
        sectionName: c.student.section.name,
        title: c.title,
        due,
      })
    }
  }

  return {
    collected: round2(collected),
    billed: round2(billed),
    outstanding: round2(billed - collected),
    challanCount: challans.length,
    paidCount,
    partialCount,
    unpaidCount,
    defaulters,
  }
}

// A single student's challans (for the student/parent portal).
export async function getStudentChallans(studentId: number) {
  return prisma.feeChallan.findMany({
    where: { studentId },
    include: challanInclude, // items + student info (for the printable PDF)
    orderBy: { issueDate: 'desc' },
  })
}
