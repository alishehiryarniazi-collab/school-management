// Business logic for the per-class book list.
import { prisma } from '../config/prisma.js'
import { notFound, badRequest } from '../utils/AppError.js'

const include = { class: { select: { id: true, name: true } } }

export function listBooks(classId?: number) {
  return prisma.book.findMany({
    where: classId ? { classId } : undefined,
    include,
    orderBy: [{ classId: 'asc' }, { title: 'asc' }],
  })
}

export async function createBook(data: {
  classId: number
  title: string
  subject?: string | null
}) {
  const cls = await prisma.class.findUnique({ where: { id: data.classId } })
  if (!cls) throw badRequest('Selected class does not exist')
  return prisma.book.create({ data, include })
}

export async function updateBook(
  id: number,
  data: { title?: string; subject?: string | null }
) {
  const book = await prisma.book.findUnique({ where: { id } })
  if (!book) throw notFound('Book not found')
  return prisma.book.update({ where: { id }, data, include })
}

export async function deleteBook(id: number) {
  const book = await prisma.book.findUnique({ where: { id } })
  if (!book) throw notFound('Book not found')
  return prisma.book.delete({ where: { id } })
}

// Books for a student's class (portal).
export function listBooksForClass(classId: number) {
  return prisma.book.findMany({
    where: { classId },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, subject: true },
  })
}
