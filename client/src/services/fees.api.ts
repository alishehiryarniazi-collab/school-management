import { http } from './http'
import type {
  SchoolProfile,
  FeeHead,
  ClassFee,
  Challan,
  FeeReport,
} from '../types'

export const schoolProfileApi = {
  get: () => http.get<{ profile: SchoolProfile }>('/school-profile'),
  update: (data: Partial<Omit<SchoolProfile, 'id'>>) =>
    http.patch<{ profile: SchoolProfile }>('/school-profile', data),
}

export const feeHeadsApi = {
  list: () => http.get<{ feeHeads: FeeHead[] }>('/fees/heads'),
  create: (data: { name: string; isRecurring: boolean }) =>
    http.post<{ feeHead: FeeHead }>('/fees/heads', data),
  update: (id: number, data: { name?: string; isRecurring?: boolean }) =>
    http.patch<{ feeHead: FeeHead }>(`/fees/heads/${id}`, data),
  remove: (id: number) => http.del<{ message: string }>(`/fees/heads/${id}`),
}

export const classFeesApi = {
  list: (classId?: number) =>
    http.get<{ classFees: ClassFee[] }>(
      `/fees/class-fees${classId ? `?classId=${classId}` : ''}`
    ),
  set: (data: { classId: number; feeHeadId: number; amount: number }) =>
    http.post<{ classFee: ClassFee }>('/fees/class-fees', data),
  remove: (id: number) =>
    http.del<{ message: string }>(`/fees/class-fees/${id}`),
}

export interface GenerateChallansInput {
  sectionId: number
  period: string
  title: string
  feeHeadIds: number[]
  dueDate?: string
}

export const challansApi = {
  generate: (data: GenerateChallansInput) =>
    http.post<{ created: number; skipped: number; students: number }>(
      '/fees/challans/generate',
      data
    ),
  // Auto: whole-school monthly challans (recurring fees).
  generateMonthly: (data: {
    period: string
    title: string
    dueDate?: string
  }) =>
    http.post<{
      created: number
      skipped: number
      students: number
      sections: number
    }>('/fees/challans/generate-monthly', data),
  list: (filter: {
    studentId?: number
    sectionId?: number
    classId?: number
    status?: string
    period?: string
  }) => {
    const sp = new URLSearchParams()
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== '') sp.set(k, String(v))
    })
    const q = sp.toString()
    return http.get<{ challans: Challan[] }>(
      `/fees/challans${q ? `?${q}` : ''}`
    )
  },
  get: (id: number) => http.get<{ challan: Challan }>(`/fees/challans/${id}`),
  pay: (
    id: number,
    data: { amount: number; fine?: number; discount?: number }
  ) => http.patch<{ challan: Challan }>(`/fees/challans/${id}/pay`, data),
  remove: (id: number) => http.del<{ message: string }>(`/fees/challans/${id}`),
}

export const feeReportsApi = {
  get: (period?: string) =>
    http.get<FeeReport>(`/fees/reports${period ? `?period=${period}` : ''}`),
}
