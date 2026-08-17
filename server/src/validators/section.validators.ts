import { z } from 'zod'

export const createSectionSchema = z.object({
  name: z.string().trim().min(1, 'Section name is required').max(30),
  classId: z.coerce.number().int().positive('Choose a class'),
  // Optional class teacher. null clears it.
  classTeacherId: z.coerce.number().int().positive().nullish(),
})

// classId is not editable after creation (a section belongs to one class).
export const updateSectionSchema = z.object({
  name: z.string().trim().min(1).max(30).optional(),
  classTeacherId: z.coerce.number().int().positive().nullable().optional(),
})

export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>
