// API clients for people: teachers and students.
import { http } from './http'
import { toQuery } from '../utils/query'
import type { Teacher, Student, Paginated } from '../types'

export interface TeacherInput {
  fullName: string
  email: string
  password?: string
  phone?: string
}

export const teachersApi = {
  list: (params: { page?: number; limit?: number; search?: string }) =>
    http.get<Paginated<Teacher>>(`/teachers${toQuery(params)}`),
  get: (id: number) => http.get<{ teacher: Teacher }>(`/teachers/${id}`),
  create: (data: TeacherInput) =>
    http.post<{ teacher: Teacher }>('/teachers', data),
  update: (id: number, data: Partial<TeacherInput> & { isActive?: boolean }) =>
    http.patch<{ teacher: Teacher }>(`/teachers/${id}`, data),
  resetPassword: (id: number, password: string) =>
    http.patch<{ message: string }>(`/teachers/${id}/reset-password`, {
      password,
    }),
}

export interface StudentInput {
  fullName: string
  rollNo: number
  sectionId: number
  gender?: 'male' | 'female' | 'other'
  dob?: string
  guardianName?: string
  guardianPhone?: string
  address?: string
  email?: string
  password?: string
}

export const studentsApi = {
  list: (params: {
    page?: number
    limit?: number
    search?: string
    classId?: number
    sectionId?: number
  }) => http.get<Paginated<Student>>(`/students${toQuery(params)}`),
  get: (id: number) => http.get<{ student: Student }>(`/students/${id}`),
  create: (data: StudentInput) =>
    http.post<{ student: Student }>('/students', data),
  update: (id: number, data: Partial<StudentInput> & { isActive?: boolean }) =>
    http.patch<{ student: Student }>(`/students/${id}`, data),
  assign: (id: number, sectionId: number, rollNo?: number) =>
    http.patch<{ student: Student }>(`/students/${id}/assign`, {
      sectionId,
      rollNo,
    }),
  resetPassword: (id: number, password: string) =>
    http.patch<{ message: string }>(`/students/${id}/reset-password`, {
      password,
    }),
}
