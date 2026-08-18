// API clients for the school-structure resources: classes, sections, subjects,
// and teaching assignments. Grouped in one file since they're closely related.
import { http } from './http'
import type { ClassItem, Section, Subject, Assignment } from '../types'

export const classesApi = {
  list: () => http.get<{ classes: ClassItem[] }>('/classes'),
  create: (name: string) =>
    http.post<{ class: ClassItem }>('/classes', { name }),
  update: (id: number, name: string) =>
    http.patch<{ class: ClassItem }>(`/classes/${id}`, { name }),
  remove: (id: number) => http.del<{ message: string }>(`/classes/${id}`),
}

export interface SectionInput {
  name: string
  classId: number
  classTeacherId?: number | null
}

export const sectionsApi = {
  list: (classId?: number) =>
    http.get<{ sections: Section[] }>(
      `/sections${classId ? `?classId=${classId}` : ''}`
    ),
  create: (data: SectionInput) =>
    http.post<{ section: Section }>('/sections', data),
  update: (id: number, data: Partial<SectionInput>) =>
    http.patch<{ section: Section }>(`/sections/${id}`, data),
  remove: (id: number) => http.del<{ message: string }>(`/sections/${id}`),
}

export const subjectsApi = {
  list: () => http.get<{ subjects: Subject[] }>('/subjects'),
  create: (name: string) =>
    http.post<{ subject: Subject }>('/subjects', { name }),
  update: (id: number, name: string) =>
    http.patch<{ subject: Subject }>(`/subjects/${id}`, { name }),
  remove: (id: number) => http.del<{ message: string }>(`/subjects/${id}`),
}

export const assignmentsApi = {
  list: (filter?: {
    teacherId?: number
    sectionId?: number
    subjectId?: number
  }) => {
    const sp = new URLSearchParams()
    if (filter?.teacherId) sp.set('teacherId', String(filter.teacherId))
    if (filter?.sectionId) sp.set('sectionId', String(filter.sectionId))
    if (filter?.subjectId) sp.set('subjectId', String(filter.subjectId))
    const q = sp.toString()
    return http.get<{ assignments: Assignment[] }>(
      `/assignments${q ? `?${q}` : ''}`
    )
  },
  create: (data: { teacherId: number; sectionId: number; subjectId: number }) =>
    http.post<{ assignment: Assignment }>('/assignments', data),
  remove: (id: number) => http.del<{ message: string }>(`/assignments/${id}`),
}
