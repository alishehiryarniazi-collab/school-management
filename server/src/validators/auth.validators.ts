// Zod schemas that validate & clean login input before it reaches the DB.
import { z } from 'zod'

// Admin & Teacher log in with email + password.
export const staffLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

// Students log in with Section (which pins down class+section) + roll no + password.
// The frontend picks Class -> Section from dropdowns and sends the sectionId.
export const studentLoginSchema = z.object({
  sectionId: z.coerce.number().int().positive('Choose your class & section'),
  rollNo: z.coerce.number().int().positive('Enter your roll number'),
  password: z.string().min(1, 'Password is required'),
})

export type StaffLoginInput = z.infer<typeof staffLoginSchema>
export type StudentLoginInput = z.infer<typeof studentLoginSchema>
