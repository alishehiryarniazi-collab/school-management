import { http } from './http'
import type { AttendanceRoster, AttendanceStatus } from '../types'

export const attendanceApi = {
  // Roster + each student's status for a section on a date (YYYY-MM-DD).
  getRoster: (sectionId: number, date: string) =>
    http.get<AttendanceRoster>(
      `/attendance?sectionId=${sectionId}&date=${date}`
    ),

  // Bulk save.
  mark: (
    sectionId: number,
    date: string,
    records: { studentId: number; status: AttendanceStatus }[]
  ) => http.post<AttendanceRoster>('/attendance', { sectionId, date, records }),
}
