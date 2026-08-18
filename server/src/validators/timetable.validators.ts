import { z } from 'zod'

export const dayOfWeek = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM')
  .optional()

export const timetableQuerySchema = z.object({
  sectionId: z.coerce.number().int().positive('Choose a section'),
})

export const createTimetableSchema = z.object({
  sectionId: z.coerce.number().int().positive(),
  dayOfWeek,
  periodNo: z.coerce.number().int().positive('Period number is required'),
  subjectId: z.coerce.number().int().positive('Choose a subject'),
  teacherId: z.coerce.number().int().positive().nullish(),
  startTime: timeString,
  endTime: timeString,
})

export const updateTimetableSchema = z.object({
  dayOfWeek: dayOfWeek.optional(),
  periodNo: z.coerce.number().int().positive().optional(),
  subjectId: z.coerce.number().int().positive().optional(),
  teacherId: z.coerce.number().int().positive().nullable().optional(),
  startTime: timeString,
  endTime: timeString,
})

export type CreateTimetableInput = z.infer<typeof createTimetableSchema>
export type UpdateTimetableInput = z.infer<typeof updateTimetableSchema>
