import { z } from 'zod'

// --- School profile (branding) ---
export const updateSchoolProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  tagline: z.string().trim().max(120).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().max(120).nullable().optional(),
  logoUrl: z.string().trim().max(300).nullable().optional(),
})

// --- Fee heads ---
export const createFeeHeadSchema = z.object({
  name: z.string().trim().min(1, 'Fee name is required').max(60),
  isRecurring: z.boolean().default(true),
})
export const updateFeeHeadSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  isRecurring: z.boolean().optional(),
})

// --- Class fee amounts ---
export const setClassFeeSchema = z.object({
  classId: z.coerce.number().int().positive('Choose a class'),
  feeHeadId: z.coerce.number().int().positive('Choose a fee head'),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
})
export const classFeeQuerySchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
})

// --- Challans ---
export const generateChallansSchema = z.object({
  sectionId: z.coerce.number().int().positive('Choose a section'),
  period: z.string().trim().min(1, 'Period is required').max(30), // e.g. "2026-09"
  title: z.string().trim().min(1, 'Title is required').max(60), // e.g. "September 2026"
  feeHeadIds: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Select at least one fee'),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

// Auto: generate this month's challans for the WHOLE school (recurring fees).
export const generateMonthlySchema = z.object({
  period: z.string().trim().min(1, 'Month is required').max(30),
  title: z.string().trim().min(1, 'Title is required').max(60),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

export const challanFilterSchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
  sectionId: z.coerce.number().int().positive().optional(),
  classId: z.coerce.number().int().positive().optional(),
  status: z.enum(['unpaid', 'partial', 'paid']).optional(),
  period: z.string().trim().optional(),
})

export const payChallanSchema = z.object({
  amount: z.coerce.number().positive('Enter a valid amount'),
  fine: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
})

export const reportQuerySchema = z.object({
  period: z.string().trim().optional(),
})

export type GenerateChallansInput = z.infer<typeof generateChallansSchema>
