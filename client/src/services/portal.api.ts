// Read-only API for the logged-in student's own data.
import { http } from './http'
import type {
  StudentProfile,
  AttendanceSummary,
  PortalMark,
  SyllabusEntry,
  DatesheetEntry,
  TimetableSlot,
  Notice,
} from '../types'

export const portalApi = {
  me: () => http.get<{ profile: StudentProfile }>('/portal/me'),
  attendance: () => http.get<AttendanceSummary>('/portal/attendance'),
  marks: () => http.get<{ marks: PortalMark[] }>('/portal/marks'),
  syllabus: () => http.get<{ syllabus: SyllabusEntry[] }>('/portal/syllabus'),
  datesheet: () =>
    http.get<{ datesheet: DatesheetEntry[] }>('/portal/datesheet'),
  timetable: () =>
    http.get<{ timetable: TimetableSlot[] }>('/portal/timetable'),
  notices: () => http.get<{ notices: Notice[] }>('/portal/notices'),
}
