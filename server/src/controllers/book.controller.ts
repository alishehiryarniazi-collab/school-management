import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  createBookSchema,
  updateBookSchema,
  bookFilterSchema,
} from '../validators/book.validators.js'
import * as service from '../services/book.service.js'

export async function list(req: Request, res: Response) {
  const { classId } = bookFilterSchema.parse(req.query)
  res.json({ books: await service.listBooks(classId) })
}

export async function create(req: Request, res: Response) {
  const data = createBookSchema.parse(req.body)
  res.status(201).json({ book: await service.createBook(data) })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateBookSchema.parse(req.body)
  res.json({ book: await service.updateBook(id, data) })
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await service.deleteBook(id)
  res.json({ message: 'Book removed' })
}
