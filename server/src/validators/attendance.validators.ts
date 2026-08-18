import { z } from 'zod'

// The four attendance states.
export const attendanceStatus = z.enum(['present', 'absent', 'late', 'leave'])

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

// Query: which section + which day.
export const attendanceQuerySchema = z.object({
  sectionId: z.coerce.number().int().positive('Choose a section'),
  date: dateString,
})

// Body: mark/update attendance for many students at once.
export const markAttendanceSchema = z.object({
  sectionId: z.coerce.number().int().positive(),
  date: dateString,
  records: z
    .array(
      z.object({
        studentId: z.coerce.number().int().positive(),
        status: attendanceStatus,
      })
    )
    .min(1, 'No attendance records provided'),
})

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>
