import { z } from 'zod'

export const noticeAudience = z.enum(['all', 'teachers', 'students'])

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  body: z.string().trim().min(1, 'Message is required').max(5000),
  audience: noticeAudience.default('all'),
})

export const updateNoticeSchema = createNoticeSchema.partial()

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>
