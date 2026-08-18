import { z } from 'zod'

// View marks for a section + subject + exam.
export const marksQuerySchema = z.object({
  sectionId: z.coerce.number().int().positive('Choose a section'),
  subjectId: z.coerce.number().int().positive('Choose a subject'),
  examName: z.string().trim().min(1, 'Choose an exam'),
})

// List existing exam names for a section + subject (for the dropdown/datalist).
export const examsQuerySchema = z.object({
  sectionId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
})

// Bulk save marks for one exam.
export const saveMarksSchema = z.object({
  sectionId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  examName: z.string().trim().min(1, 'Exam name is required').max(60),
  totalMarks: z.coerce.number().positive('Total marks must be greater than 0'),
  records: z
    .array(
      z.object({
        studentId: z.coerce.number().int().positive(),
        marksObtained: z.coerce.number().min(0, 'Marks cannot be negative'),
      })
    )
    .min(1, 'No marks provided'),
})

export type SaveMarksInput = z.infer<typeof saveMarksSchema>
