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

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave'

export interface RosterEntry {
  studentId: number
  rollNo: number
  fullName: string
  status: AttendanceStatus | null
}

export interface AttendanceRoster {
  section: { id: number; name: string; class: { id: number; name: string } }
  date: string
  roster: RosterEntry[]
}

export interface Notice {
  id: number
  title: string
  body: string
  audience: 'all' | 'teachers' | 'students'
  postedById: number | null
  createdAt: string
  postedBy?: { id: number; fullName: string; role: Role } | null
}

// ---- Student portal ----
export interface StudentProfile {
  id: number
  fullName: string
  rollNo: number
  gender: string | null
  className: string
  sectionName: string
  classTeacher: string | null
}

export interface AttendanceSummary {
  summary: {
    present: number
    absent: number
    late: number
    leave: number
    total: number
  }
  percentage: number
  records: { date: string; status: AttendanceStatus }[]
}

export interface PortalMark {
  id: number
  examName: string
  marksObtained: number
  totalMarks: number
  subject: { id: number; name: string }
}

export interface SyllabusEntry {
  id: number
  title: string
  details: string
  classId?: number
  subjectId?: number
  subject: { id: number; name: string }
  class?: { id: number; name: string }
}

export interface DatesheetEntry {
  id: number
  examName: string
  examDate: string
  startTime: string | null
  endTime: string | null
  classId?: number
  subjectId?: number
  subject: { id: number; name: string }
  class?: { id: number; name: string }
}

export interface TimetableSlot {
  id: number
  dayOfWeek: string
  periodNo: number
  startTime: string | null
  endTime: string | null
  subjectId?: number
  teacherId?: number | null
  subject: { id: number; name: string }
  teacher: { id: number; fullName: string } | null
}

export interface MarksRosterEntry {
  studentId: number
  rollNo: number
  fullName: string
  marksObtained: number | null
  totalMarks: number | null
}

export interface MarksRoster {
  section: { id: number; name: string; class: { id: number; name: string } }
  subjectId: number
  examName: string
  roster: MarksRosterEntry[]
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
