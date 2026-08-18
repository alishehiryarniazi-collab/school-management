// Business logic for notices/announcements.
import { prisma } from '../config/prisma.js'
import { notFound, forbidden } from '../utils/AppError.js'
import type { Role } from '../types/auth.js'
import type {
  CreateNoticeInput,
  UpdateNoticeInput,
} from '../validators/notice.validators.js'

const noticeInclude = {
  postedBy: { select: { id: true, fullName: true, role: true } },
}

// Staff see all notices, newest first.
export async function listNotices() {
  return prisma.notice.findMany({
    orderBy: { createdAt: 'desc' },
    include: noticeInclude,
  })
}

// Notices a student should see: addressed to everyone or to students.
export async function listNoticesForStudents() {
  return prisma.notice.findMany({
    where: { audience: { in: ['all', 'students'] } },
    orderBy: { createdAt: 'desc' },
    include: noticeInclude,
  })
}

export async function createNotice(
  data: CreateNoticeInput,
  postedById: number
) {
  return prisma.notice.create({
    data: { ...data, postedById },
    include: noticeInclude,
  })
}

// Only an admin or the original poster may edit/delete a notice.
async function getEditable(id: number, user: { id: number; role: Role }) {
  const notice = await prisma.notice.findUnique({ where: { id } })
  if (!notice) throw notFound('Notice not found')
  if (user.role !== 'admin' && notice.postedById !== user.id) {
    throw forbidden('You can only edit notices you posted')
  }
  return notice
}

export async function updateNotice(
  id: number,
  data: UpdateNoticeInput,
  user: { id: number; role: Role }
) {
  await getEditable(id, user)
  return prisma.notice.update({
    where: { id },
    data,
    include: noticeInclude,
  })
}

export async function deleteNotice(
  id: number,
  user: { id: number; role: Role }
) {
  await getEditable(id, user)
  return prisma.notice.delete({ where: { id } })
}
