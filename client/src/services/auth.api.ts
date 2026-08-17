import { http } from './http'
import type { AuthUser, ClassItem } from '../types'

export const authApi = {
  staffLogin: (email: string, password: string) =>
    http.post<{ user: AuthUser }>('/auth/login', { email, password }),

  studentLogin: (sectionId: number, rollNo: number, password: string) =>
    http.post<{ user: AuthUser }>('/auth/student-login', {
      sectionId,
      rollNo,
      password,
    }),

  me: () => http.get<{ user: AuthUser }>('/auth/me'),

  logout: () => http.post<{ message: string }>('/auth/logout'),

  // Public: classes + sections for the student login dropdowns.
  schoolStructure: () =>
    http.get<{ classes: ClassItem[] }>('/auth/school-structure'),
}
