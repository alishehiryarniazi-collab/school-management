// Fee setup: the fee heads (types of fee) and their amounts per class.
import { prisma } from '../config/prisma.js'
import { notFound, conflict } from '../utils/AppError.js'

// --- Fee heads ---
export function listFeeHeads() {
  return prisma.feeHead.findMany({ orderBy: { id: 'asc' } })
}

export function createFeeHead(data: { name: string; isRecurring: boolean }) {
  return prisma.feeHead.create({ data })
}

export async function updateFeeHead(
  id: number,
  data: { name?: string; isRecurring?: boolean }
) {
  const head = await prisma.feeHead.findUnique({ where: { id } })
  if (!head) throw notFound('Fee head not found')
  return prisma.feeHead.update({ where: { id }, data })
}

export async function deleteFeeHead(id: number) {
  const head = await prisma.feeHead.findUnique({ where: { id } })
  if (!head) throw notFound('Fee head not found')
  // Block deletion if it's already used on issued challans (keeps history intact).
  const used = await prisma.feeChallanItem.count({ where: { feeHeadId: id } })
  if (used > 0) {
    throw conflict(
      'This fee is already used on challans and cannot be deleted.'
    )
  }
  return prisma.feeHead.delete({ where: { id } }) // its ClassFee rows cascade
}

// --- Class fee amounts ---
export function listClassFees(classId?: number) {
  return prisma.classFee.findMany({
    where: classId ? { classId } : undefined,
    include: {
      class: { select: { id: true, name: true } },
      feeHead: { select: { id: true, name: true, isRecurring: true } },
    },
    orderBy: [{ classId: 'asc' }, { feeHeadId: 'asc' }],
  })
}

// Create or update the amount for one class + fee head.
export async function setClassFee(data: {
  classId: number
  feeHeadId: number
  amount: number
}) {
  const [cls, head] = await Promise.all([
    prisma.class.findUnique({ where: { id: data.classId } }),
    prisma.feeHead.findUnique({ where: { id: data.feeHeadId } }),
  ])
  if (!cls) throw notFound('Class not found')
  if (!head) throw notFound('Fee head not found')

  return prisma.classFee.upsert({
    where: {
      classId_feeHeadId: {
        classId: data.classId,
        feeHeadId: data.feeHeadId,
      },
    },
    update: { amount: data.amount },
    create: data,
    include: {
      class: { select: { id: true, name: true } },
      feeHead: { select: { id: true, name: true, isRecurring: true } },
    },
  })
}

export async function deleteClassFee(id: number) {
  const cf = await prisma.classFee.findUnique({ where: { id } })
  if (!cf) throw notFound('Class fee not found')
  return prisma.classFee.delete({ where: { id } })
}
