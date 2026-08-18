// Manage the weekly timetable for a section (slots per day/period).
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi, subjectsApi } from '../services/school.api'
import { teachersApi } from '../services/people.api'
import { timetableApi } from '../services/academics.api'
import { ApiError } from '../services/http'
import type { TimetableSlot } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function TimetablePage() {
  const [classId, setClassId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const { data: structure } = useApi(() => classesApi.list(), [])
  const classes = structure?.classes ?? []
  const sections = classId
    ? (classes.find((c) => c.id === classId)?.sections ?? [])
    : []

  const { data, loading, error, reload } = useApi(
    () =>
      sectionId
        ? timetableApi.list(Number(sectionId))
        : Promise.resolve(null),
    [sectionId]
  )
  const slots = data?.slots ?? []

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<TimetableSlot | null>(null)

  async function handleDelete(s: TimetableSlot) {
    if (!confirm(`Delete ${s.dayOfWeek} period ${s.periodNo}?`)) return
    try {
      await timetableApi.remove(s.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  // Group slots by day.
  const byDay = DAYS.map((day) => ({
    day,
    slots: slots
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.periodNo - b.periodNo),
  })).filter((d) => d.slots.length > 0)

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle="Build the weekly schedule for a section."
        actions={
          <Button onClick={() => setCreating(true)} disabled={!sectionId}>
            <IconPlus /> Add slot
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
        <Select
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
      </div>

      {!sectionId && (
        <Card>
          <EmptyState title="Pick a class and section" />
        </Card>
      )}
      {sectionId && loading && <LoadingState />}
      {sectionId && error && <ErrorState message={error} onRetry={reload} />}
      {sectionId && !loading && !error && slots.length === 0 && (
        <Card>
          <EmptyState title="No slots yet" hint="Add the first timetable slot." />
        </Card>
      )}

      <div className="space-y-4">
        {byDay.map(({ day, slots }) => (
          <Card key={day} className="p-4">
            <h3 className="mb-2 font-semibold text-heading">{day}</h3>
            <ul className="divide-y divide-border">
              {slots.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-body">
                    <span className="mr-2 text-muted">P{s.periodNo}</span>
                    {s.subject.name}
                    <span className="ml-2 text-xs text-muted">
                      {s.startTime && s.endTime
                        ? `${s.startTime}–${s.endTime}`
                        : ''}
                      {s.teacher ? ` · ${s.teacher.fullName}` : ''}
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(s)}
                    >
                      <IconEdit />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      onClick={() => handleDelete(s)}
                    >
                      <IconTrash />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {(creating || editing) && sectionId && (
        <TimetableForm
          slot={editing}
          sectionId={Number(sectionId)}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={() => {
            setCreating(false)
            setEditing(null)
            reload()
          }}
        />
      )}
    </div>
  )
}

function TimetableForm({
  slot,
  sectionId,
  onClose,
  onSaved,
}: {
  slot: TimetableSlot | null
  sectionId: number
  onClose: () => void
  onSaved: () => void
}) {
  const { data: subjectData } = useApi(() => subjectsApi.list(), [])
  const { data: teacherData } = useApi(() => teachersApi.list({ limit: 100 }), [])
  const subjects = subjectData?.subjects ?? []
  const teachers = teacherData?.data ?? []

  const [dayOfWeek, setDayOfWeek] = useState(slot?.dayOfWeek ?? 'Monday')
  const [periodNo, setPeriodNo] = useState(slot ? String(slot.periodNo) : '')
  const [subjectId, setSubjectId] = useState<number | ''>(slot?.subjectId ?? '')
  const [teacherId, setTeacherId] = useState<number | ''>(slot?.teacherId ?? '')
  const [startTime, setStartTime] = useState(slot?.startTime ?? '')
  const [endTime, setEndTime] = useState(slot?.endTime ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const payload = {
        dayOfWeek,
        periodNo: Number(periodNo),
        subjectId: Number(subjectId),
        teacherId: teacherId === '' ? null : Number(teacherId),
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      }
      if (slot) await timetableApi.update(slot.id, payload)
      else await timetableApi.create({ sectionId, ...payload })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const canSave = periodNo && subjectId

  return (
    <Modal
      open
      onClose={onClose}
      title={slot ? 'Edit slot' : 'Add slot'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!canSave}>
            Save
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Day"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Input
          label="Period no."
          type="number"
          min={1}
          value={periodNo}
          onChange={(e) => setPeriodNo(e.target.value)}
        />
        <Select
          label="Subject"
          value={subjectId}
          onChange={(e) => setSubjectId(Number(e.target.value) || '')}
        >
          <option value="">Select…</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          label="Teacher (optional)"
          value={teacherId}
          onChange={(e) => setTeacherId(Number(e.target.value) || '')}
        >
          <option value="">None</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </Select>
        <Input
          label="Start time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          label="End time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
    </Modal>
  )
}
