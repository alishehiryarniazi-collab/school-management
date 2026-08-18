import { z } from 'zod'

export const syllabusFilterSchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
})

export const createSyllabusSchema = z.object({
  classId: z.coerce.number().int().positive('Choose a class'),
  subjectId: z.coerce.number().int().positive('Choose a subject'),
  title: z.string().trim().min(1, 'Title is required').max(150),
  details: z.string().trim().min(1, 'Details are required').max(5000),
})

// Class + subject are fixed after creation; only content can change.
export const updateSyllabusSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  details: z.string().trim().min(1).max(5000).optional(),
})

export type CreateSyllabusInput = z.infer<typeof createSyllabusSchema>
export type UpdateSyllabusInput = z.infer<typeof updateSyllabusSchema>
