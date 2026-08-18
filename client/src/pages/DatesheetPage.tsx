// Manage the exam date sheet (rows per class + exam + subject).
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi, subjectsApi } from '../services/school.api'
import { datesheetApi } from '../services/academics.api'
import { ApiError } from '../services/http'
import type { DatesheetEntry } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function DatesheetPage() {
  const [classId, setClassId] = useState<number | ''>('')
  const { data: structure } = useApi(() => classesApi.list(), [])
  const classes = structure?.classes ?? []

  const { data, loading, error, reload } = useApi(
    () => datesheetApi.list(classId || undefined),
    [classId]
  )
  const entries = data?.datesheet ?? []

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<DatesheetEntry | null>(null)

  async function handleDelete(e: DatesheetEntry) {
    if (!confirm(`Delete "${e.subject.name}" (${e.examName})?`)) return
    try {
      await datesheetApi.remove(e.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Date Sheet"
        subtitle="Publish exam schedules."
        actions={
          <Button onClick={() => setCreating(true)}>
            <IconPlus /> Add exam
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select
          value={classId}
          onChange={(e) => setClassId(Number(e.target.value) || '')}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && entries.length === 0 && (
          <EmptyState title="No exams scheduled" hint="Add the first exam." />
        )}
        {entries.length > 0 && (
          <ul className="divide-y divide-border">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {e.class && <Badge>{e.class.name}</Badge>}
                    <span className="font-medium text-heading">
                      {e.subject.name}
                    </span>
                    <span className="text-xs text-muted">{e.examName}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {fmtDate(e.examDate)}
                    {e.startTime ? ` · ${e.startTime}` : ''}
                    {e.endTime ? `–${e.endTime}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(e)}
                  >
                    <IconEdit />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={() => handleDelete(e)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {(creating || editing) && (
        <DatesheetForm
          entry={editing}
          classes={classes}
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

function DatesheetForm({
  entry,
  classes,
  onClose,
  onSaved,
}: {
  entry: DatesheetEntry | null
  classes: { id: number; name: string }[]
  onClose: () => void
  onSaved: () => void
}) {
  const { data: subjectData } = useApi(() => subjectsApi.list(), [])
  const subjects = subjectData?.subjects ?? []

  const [classId, setClassId] = useState<number | ''>(entry?.classId ?? '')
  const [examName, setExamName] = useState(entry?.examName ?? '')
  const [subjectId, setSubjectId] = useState<number | ''>(
    entry?.subjectId ?? ''
  )
  const [examDate, setExamDate] = useState(entry?.examDate?.slice(0, 10) ?? '')
  const [startTime, setStartTime] = useState(entry?.startTime ?? '')
  const [endTime, setEndTime] = useState(entry?.endTime ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const payload = {
        examName: examName.trim(),
        subjectId: Number(subjectId),
        examDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      }
      if (entry) await datesheetApi.update(entry.id, payload)
      else await datesheetApi.create({ classId: Number(classId), ...payload })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const canSave = examName.trim() && subjectId && examDate && (entry || classId)

  return (
    <Modal
      open
      onClose={onClose}
      title={entry ? 'Edit exam' : 'Add exam'}
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
        {!entry && (
          <Select
            label="Class"
            value={classId}
            onChange={(e) => setClassId(Number(e.target.value) || '')}
          >
            <option value="">Select…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
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
        <Input
          label="Exam name"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="e.g. Midterm"
        />
        <Input
          label="Date"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
        />
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
