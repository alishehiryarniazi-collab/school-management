import { z } from 'zod'

export const createBookSchema = z.object({
  classId: z.coerce.number().int().positive('Choose a class'),
  title: z.string().trim().min(1, 'Book title is required').max(150),
  subject: z.string().trim().max(60).nullish(),
})

export const updateBookSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  subject: z.string().trim().max(60).nullable().optional(),
})

export const bookFilterSchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
})
