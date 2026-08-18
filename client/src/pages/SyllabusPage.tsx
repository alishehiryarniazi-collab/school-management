// Manage syllabus (one entry per class + subject).
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi, subjectsApi } from '../services/school.api'
import { syllabusApi } from '../services/academics.api'
import { ApiError } from '../services/http'
import type { SyllabusEntry } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'

export function SyllabusPage() {
  const [classId, setClassId] = useState<number | ''>('')
  const { data: structure } = useApi(() => classesApi.list(), [])
  const classes = structure?.classes ?? []

  const { data, loading, error, reload } = useApi(
    () => syllabusApi.list(classId || undefined),
    [classId]
  )
  const items = data?.syllabus ?? []

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<SyllabusEntry | null>(null)

  async function handleDelete(s: SyllabusEntry) {
    if (!confirm(`Delete syllabus "${s.title}"?`)) return
    try {
      await syllabusApi.remove(s.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Syllabus"
        subtitle="Publish the syllabus for each subject."
        actions={
          <Button onClick={() => setCreating(true)}>
            <IconPlus /> Add syllabus
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

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && items.length === 0 && (
        <Card>
          <EmptyState title="No syllabus yet" hint="Add the first syllabus entry." />
        </Card>
      )}

      <div className="space-y-3">
        {items.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {s.class && <Badge>{s.class.name}</Badge>}
                  <Badge tone="primary">{s.subject.name}</Badge>
                  <h3 className="font-semibold text-heading">{s.title}</h3>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-body">
                  {s.details}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>
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
            </div>
          </Card>
        ))}
      </div>

      {(creating || editing) && (
        <SyllabusForm
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

function SyllabusForm({
  entry,
  classes,
  onClose,
  onSaved,
}: {
  entry: SyllabusEntry | null
  classes: { id: number; name: string }[]
  onClose: () => void
  onSaved: () => void
}) {
  const { data: subjectData } = useApi(() => subjectsApi.list(), [])
  const subjects = subjectData?.subjects ?? []
  const [classId, setClassId] = useState<number | ''>(entry?.classId ?? '')
  const [subjectId, setSubjectId] = useState<number | ''>(entry?.subjectId ?? '')
  const [title, setTitle] = useState(entry?.title ?? '')
  const [details, setDetails] = useState(entry?.details ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      if (entry) {
        await syllabusApi.update(entry.id, {
          title: title.trim(),
          details: details.trim(),
        })
      } else {
        await syllabusApi.create({
          classId: Number(classId),
          subjectId: Number(subjectId),
          title: title.trim(),
          details: details.trim(),
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const canSave =
    title.trim() && details.trim() && (entry || (classId && subjectId))

  return (
    <Modal
      open
      onClose={onClose}
      title={entry ? 'Edit syllabus' : 'Add syllabus'}
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
      <div className="flex flex-col gap-3">
        {/* Class + subject are fixed after creation. */}
        {!entry && (
          <div className="grid grid-cols-2 gap-3">
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
          </div>
        )}
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Term 1 syllabus"
          autoFocus
        />
        <Textarea
          label="Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          placeholder="Chapters, topics, etc."
        />
      </div>
    </Modal>
  )
}
