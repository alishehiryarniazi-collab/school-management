// The student's read-only portal. A header with their details + a set of tabs
// (attendance, marks, timetable, date sheet, syllabus, notices). Mobile-first.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { portalApi } from '../services/portal.api'
import { LoadingState } from '../components/ui/States'
import { IconLogout } from '../components/icons'
import {
  AttendanceView,
  MarksView,
  TimetableView,
  DatesheetView,
  SyllabusView,
  NoticesView,
} from '../components/portal/PortalViews'

const TABS = [
  { key: 'attendance', label: 'Attendance', View: AttendanceView },
  { key: 'marks', label: 'Marks', View: MarksView },
  { key: 'timetable', label: 'Timetable', View: TimetableView },
  { key: 'datesheet', label: 'Date Sheet', View: DatesheetView },
  { key: 'syllabus', label: 'Syllabus', View: SyllabusView },
  { key: 'notices', label: 'Notices', View: NoticesView },
] as const

export function StudentPortalPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { data, loading } = useApi(() => portalApi.me(), [])
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('attendance')

  const profile = data?.profile
  const ActiveView = TABS.find((t) => t.key === tab)!.View

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-sidebar text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
          <div>
            <p className="text-lg font-semibold">
              {profile?.fullName ?? 'Student'}
            </p>
            {profile && (
              <p className="text-sm text-slate-300">
                {profile.className} — {profile.sectionName} · Roll #
                {profile.rollNo}
                {profile.classTeacher
                  ? ` · Class teacher: ${profile.classTeacher}`
                  : ''}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-sm transition hover:bg-white/10"
          >
            <IconLogout />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-3xl overflow-x-auto px-2">
          <div className="flex gap-1 pb-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition ${
                  tab === t.key
                    ? 'bg-canvas text-heading'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl p-4">
        {loading ? <LoadingState /> : <ActiveView />}
      </main>
    </div>
  )
}
