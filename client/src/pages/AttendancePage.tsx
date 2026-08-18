// Mark attendance: pick a class + section + date, set each student's status,
// and save. Statuses: present / absent / late / leave.
import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi } from '../services/school.api'
import { attendanceApi } from '../services/attendance.api'
import { ApiError } from '../services/http'
import type { AttendanceStatus } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'

const STATUSES: { value: AttendanceStatus; label: string; active: string }[] = [
  { value: 'present', label: 'Present', active: 'bg-success text-white' },
  { value: 'absent', label: 'Absent', active: 'bg-danger text-white' },
  { value: 'late', label: 'Late', active: 'bg-warning text-white' },
  { value: 'leave', label: 'Leave', active: 'bg-primary text-white' },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function AttendancePage() {
  const [classId, setClassId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [date, setDate] = useState(todayStr())

  // Local edits: studentId -> status.
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const { data: structure } = useApi(() => classesApi.list(), [])
  const classes = structure?.classes ?? []
  const sections = classId
    ? (classes.find((c) => c.id === classId)?.sections ?? [])
    : []

  const {
    data: roster,
    loading,
    error,
    reload,
  } = useApi(
    () =>
      sectionId
        ? attendanceApi.getRoster(Number(sectionId), date)
        : Promise.resolve(null),
    [sectionId, date]
  )

  // Seed local statuses from the loaded roster.
  useEffect(() => {
    if (!roster) return
    const seed: Record<number, AttendanceStatus> = {}
    for (const r of roster.roster) if (r.status) seed[r.studentId] = r.status
    setStatuses(seed)
    setSaved(false)
  }, [roster])

  const rosterList = roster?.roster ?? []
  const markedCount = rosterList.filter((r) => statuses[r.studentId]).length

  function setStatus(studentId: number, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }))
    setSaved(false)
  }

  function markAllPresent() {
    const next: Record<number, AttendanceStatus> = {}
    for (const r of rosterList) next[r.studentId] = 'present'
    setStatuses(next)
    setSaved(false)
  }

  async function save() {
    if (!sectionId) return
    setSaveError(null)
    setSaving(true)
    try {
      const records = rosterList
        .filter((r) => statuses[r.studentId])
        .map((r) => ({
          studentId: r.studentId,
          status: statuses[r.studentId]!,
        }))
      await attendanceApi.mark(Number(sectionId), date, records)
      setSaved(true)
      reload()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance for a class section."
      />

      {/* Controls */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          label="Class"
          value={classId}
          onChange={(e) => {
            setClassId(Number(e.target.value) || '')
            setSectionId('')
          }}
        >
          <option value="">Select class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Section"
          value={sectionId}
          onChange={(e) => setSectionId(Number(e.target.value) || '')}
          disabled={!classId}
        >
          <option value="">Select section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={todayStr()}
        />
      </div>

      <Card>
        {!sectionId && (
          <EmptyState
            title="Pick a class and section"
            hint="Choose a class, section, and date to mark attendance."
          />
        )}
        {sectionId && loading && <LoadingState />}
        {sectionId && error && <ErrorState message={error} onRetry={reload} />}
        {sectionId && !loading && !error && rosterList.length === 0 && (
          <EmptyState
            title="No students in this section"
            hint="Add students to this section first."
          />
        )}

        {sectionId && rosterList.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <span className="text-sm text-muted">
                {markedCount} of {rosterList.length} marked
              </span>
              <Button variant="secondary" size="sm" onClick={markAllPresent}>
                Mark all present
              </Button>
            </div>

            <ul className="divide-y divide-border">
              {rosterList.map((r) => (
                <li
                  key={r.studentId}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="text-sm">
                    <span className="mr-2 inline-block w-8 text-muted">
                      #{r.rollNo}
                    </span>
                    <span className="font-medium text-heading">
                      {r.fullName}
                    </span>
                  </span>
                  <div className="flex gap-1">
                    {STATUSES.map((s) => {
                      const isActive = statuses[r.studentId] === s.value
                      return (
                        <button
                          key={s.value}
                          onClick={() => setStatus(r.studentId, s.value)}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                            isActive
                              ? s.active
                              : 'bg-canvas text-muted hover:text-heading'
                          }`}
                        >
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-3">
              {saved && <span className="text-sm text-success">✓ Saved</span>}
              <Button
                onClick={save}
                loading={saving}
                disabled={markedCount === 0}
              >
                Save attendance
              </Button>
            </div>
          </>
        )}
      </Card>

      {saveError && (
        <div className="mt-3">
          <Alert>{saveError}</Alert>
        </div>
      )}
    </div>
  )
}
