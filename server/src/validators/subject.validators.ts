import { z } from 'zod'

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, 'Subject name is required').max(60),
})

export const updateSubjectSchema = createSubjectSchema.partial()

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>
