import { z } from 'zod'

export const createAssignmentSchema = z.object({
  teacherId: z.coerce.number().int().positive('Choose a teacher'),
  sectionId: z.coerce.number().int().positive('Choose a section'),
  subjectId: z.coerce.number().int().positive('Choose a subject'),
})

export const assignmentFilterSchema = z.object({
  teacherId: z.coerce.number().int().positive().optional(),
  sectionId: z.coerce.number().int().positive().optional(),
  subjectId: z.coerce.number().int().positive().optional(),
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
