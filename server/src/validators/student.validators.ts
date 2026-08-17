import { z } from 'zod'

// Shared profile fields.
const genderEnum = z.enum(['male', 'female', 'other'])

export const createStudentSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(100),
  rollNo: z.coerce.number().int().positive('Roll number is required'),
  sectionId: z.coerce.number().int().positive('Choose a class & section'),
  gender: genderEnum.optional(),
  dob: z.coerce.date().optional(),
  guardianName: z.string().trim().max(100).optional(),
  guardianPhone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
  // Optional: a real login email. If omitted we generate a synthetic unique one
  // (students log in by section + roll number, not email).
  email: z.string().trim().toLowerCase().email().optional(),
  // Optional: custom initial password. Defaults to DEFAULT_STUDENT_PASSWORD.
  password: z.string().min(6).optional(),
})

// Update: all profile fields optional; sectionId change moves the student.
export const updateStudentSchema = z.object({
  fullName: z.string().trim().min(1).max(100).optional(),
  rollNo: z.coerce.number().int().positive().optional(),
  sectionId: z.coerce.number().int().positive().optional(),
  gender: genderEnum.nullable().optional(),
  dob: z.coerce.date().nullable().optional(),
  guardianName: z.string().trim().max(100).nullable().optional(),
  guardianPhone: z.string().trim().max(30).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
})

// Dedicated "arrange student into a class/section" action.
export const assignSectionSchema = z.object({
  sectionId: z.coerce.number().int().positive('Choose a section'),
  rollNo: z.coerce.number().int().positive().optional(), // optionally set new roll no
})

// List filters: by class or section, plus search/pagination (via listQuery).
export const studentFilterSchema = z.object({
  classId: z.coerce.number().int().positive().optional(),
  sectionId: z.coerce.number().int().positive().optional(),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type AssignSectionInput = z.infer<typeof assignSectionSchema>
