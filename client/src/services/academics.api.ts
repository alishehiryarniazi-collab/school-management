// API clients for the academic content teachers manage: marks, syllabus,
// date sheet, and timetable.
import { http } from './http'
import type {
  MarksRoster,
  SyllabusEntry,
  DatesheetEntry,
  TimetableSlot,
} from '../types'

export const marksApi = {
  exams: (sectionId: number, subjectId: number) =>
    http.get<{ exams: string[] }>(
      `/marks/exams?sectionId=${sectionId}&subjectId=${subjectId}`
    ),
  getRoster: (sectionId: number, subjectId: number, examName: string) =>
    http.get<MarksRoster>(
      `/marks?sectionId=${sectionId}&subjectId=${subjectId}&examName=${encodeURIComponent(examName)}`
    ),
  save: (payload: {
    sectionId: number
    subjectId: number
    examName: string
    totalMarks: number
    records: { studentId: number; marksObtained: number }[]
  }) => http.post<MarksRoster>('/marks', payload),
}

export interface SyllabusInput {
  classId: number
  subjectId: number
  title: string
  details: string
}

export const syllabusApi = {
  list: (classId?: number) =>
    http.get<{ syllabus: SyllabusEntry[] }>(
      `/syllabus${classId ? `?classId=${classId}` : ''}`
    ),
  create: (data: SyllabusInput) =>
    http.post<{ syllabus: SyllabusEntry }>('/syllabus', data),
  update: (id: number, data: { title: string; details: string }) =>
    http.patch<{ syllabus: SyllabusEntry }>(`/syllabus/${id}`, data),
  remove: (id: number) => http.del<{ message: string }>(`/syllabus/${id}`),
}

export interface DatesheetInput {
  classId: number
  examName: string
  subjectId: number
  examDate: string
  startTime?: string
  endTime?: string
}

export const datesheetApi = {
  list: (classId?: number) =>
    http.get<{ datesheet: DatesheetEntry[] }>(
      `/datesheet${classId ? `?classId=${classId}` : ''}`
    ),
  create: (data: DatesheetInput) =>
    http.post<{ entry: DatesheetEntry }>('/datesheet', data),
  update: (id: number, data: Partial<DatesheetInput>) =>
    http.patch<{ entry: DatesheetEntry }>(`/datesheet/${id}`, data),
  remove: (id: number) => http.del<{ message: string }>(`/datesheet/${id}`),
}

export interface TimetableInput {
  sectionId: number
  dayOfWeek: string
  periodNo: number
  subjectId: number
  teacherId?: number | null
  startTime?: string
  endTime?: string
}

export const timetableApi = {
  list: (sectionId: number) =>
    http.get<{
      section: { id: number; name: string; class: { id: number; name: string } }
      slots: TimetableSlot[]
    }>(`/timetable?sectionId=${sectionId}`),
  create: (data: TimetableInput) =>
    http.post<{ slot: TimetableSlot }>('/timetable', data),
  update: (id: number, data: Partial<TimetableInput>) =>
    http.patch<{ slot: TimetableSlot }>(`/timetable/${id}`, data),
  remove: (id: number) => http.del<{ message: string }>(`/timetable/${id}`),
}
