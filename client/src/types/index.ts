// Shared types that mirror what the backend API returns.

export type Role = 'admin' | 'teacher' | 'student'

export interface AuthUser {
  id: number
  fullName: string
  email: string
  role: Role
  phone?: string | null
}

export interface ClassItem {
  id: number
  name: string
  sections?: Section[]
  createdAt?: string
}

export interface Section {
  id: number
  name: string
  classId: number
  classTeacherId?: number | null
  classTeacher?: { id: number; fullName: string } | null
  class?: { id: number; name: string }
  _count?: { students: number }
}

export interface Subject {
  id: number
  name: string
}

export interface Teacher {
  id: number
  fullName: string
  email: string
  phone?: string | null
  isActive: boolean
  createdAt?: string
  _count?: { teachingAssignments: number; classTeacherOf: number }
}

export interface Student {
  id: number
  rollNo: number
  gender?: 'male' | 'female' | 'other' | null
  dob?: string | null
  guardianName?: string | null
  guardianPhone?: string | null
  address?: string | null
  sectionId: number
  admissionDate?: string
  user: { id: number; fullName: string; email: string; isActive: boolean }
  section: { id: number; name: string; class: { id: number; name: string } }
}

export interface Assignment {
  id: number
  teacher: { id: number; fullName: string }
  subject: { id: number; name: string }
  section: { id: number; name: string; class: { id: number; name: string } }
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  pagination: Pagination
}
