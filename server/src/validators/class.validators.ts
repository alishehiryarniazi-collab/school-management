import { z } from 'zod'

export const createClassSchema = z.object({
  name: z.string().trim().min(1, 'Class name is required').max(50),
})

// All fields optional on update (partial edit).
export const updateClassSchema = createClassSchema.partial()

export type CreateClassInput = z.infer<typeof createClassSchema>
export type UpdateClassInput = z.infer<typeof updateClassSchema>
