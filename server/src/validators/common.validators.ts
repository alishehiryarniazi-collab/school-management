// Small shared validation helpers reused across resources.
import { z } from 'zod'

// Validates a numeric ":id" route param (e.g. /classes/5).
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid id'),
})

// Common list query: ?page=1&limit=20&search=ali
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
})

export type ListQuery = z.infer<typeof listQuerySchema>

// Turns page/limit into Prisma's skip/take.
export function getSkipTake(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit }
}

// Standard shape for paginated responses so the frontend is consistent.
export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  }
}
