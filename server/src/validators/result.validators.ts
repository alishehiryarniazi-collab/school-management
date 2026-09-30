import { z } from 'zod'

export const sectionExamQuerySchema = z.object({
  sectionId: z.coerce.number().int().positive('Choose a section'),
})

export const classResultQuerySchema = z.object({
  sectionId: z.coerce.number().int().positive('Choose a section'),
  examName: z.string().trim().min(1, 'Choose an exam'),
})

export const cardQuerySchema = z.object({
  studentId: z.coerce.number().int().positive(),
  examName: z.string().trim().min(1, 'Choose an exam'),
})

export const portalResultQuerySchema = z.object({
  examName: z.string().trim().min(1, 'Choose an exam'),
})
