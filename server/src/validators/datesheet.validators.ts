import { z } from 'zod'

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM')
  .optional()

export const datesheetFilterSchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
  examName: z.string().trim().optional(),
})

export const createDatesheetSchema = z.object({
  classId: z.coerce.number().int().positive('Choose a class'),
  examName: z.string().trim().min(1, 'Exam name is required').max(60),
  subjectId: z.coerce.number().int().positive('Choose a subject'),
  examDate: dateString,
  startTime: timeString,
  endTime: timeString,
})

export const updateDatesheetSchema = z.object({
  examName: z.string().trim().min(1).max(60).optional(),
  subjectId: z.coerce.number().int().positive().optional(),
  examDate: dateString.optional(),
  startTime: timeString,
  endTime: timeString,
})

export type CreateDatesheetInput = z.infer<typeof createDatesheetSchema>
export type UpdateDatesheetInput = z.infer<typeof updateDatesheetSchema>
