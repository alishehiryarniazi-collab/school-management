// Manage teaching assignments (which teacher teaches which subject in which
// section). Admin only.
import { useMemo, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi, subjectsApi, assignmentsApi } from '../services/school.api'
import { teachersApi } from '../services/people.api'
import { ApiError } from '../services/http'
import type { Assignment, Section } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconTrash } from '../components/icons'

export function AssignmentsPage() {
  const { data, loading, error, reload } = useApi(
    () => assignmentsApi.list(),
    []
  )
  const assignments = data?.assignments ?? []
  const [creating, setCreating] = useState(false)

  async function handleDelete(a: Assignment) {
    if (
      !confirm(
        `Remove ${a.teacher.fullName} from ${a.subject.name} (${a.section.class.name}-${a.section.name})?`
      )
    )
      return
    try {
      await assignmentsApi.remove(a.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Teaching Assignments"
        subtitle="Assign teachers to subjects in each section."
        actions={
          <Button onClick={() => setCreating(true)}>
            <IconPlus /> Add assignment
          </Button>
        }
      />

      <Card>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && assignments.length === 0 && (
          <EmptyState
            title="No assignments yet"
            hint="Assign a teacher to a subject in a section."
          />
        )}
        {assignments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Teacher</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Class / Section</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-canvas/60">
                    <td className="px-4 py-3 font-medium text-heading">
                      {a.teacher.fullName}
                    </td>
                    <td className="px-4 py-3 text-body">{a.subject.name}</td>
                    <td className="px-4 py-3 text-muted">
                      {a.section.class.name} — {a.section.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        onClick={() => handleDelete(a)}
                      >
                        <IconTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {creating && (
        <AssignmentForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            reload()
          }}
        />
      )}
    </div>
  )
}

function AssignmentForm({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const { data: structure } = useApi(() => classesApi.list(), [])
  const { data: teacherData } = useApi(() => teachersApi.list({ limit: 100 }), [])
  const { data: subjectData } = useApi(() => subjectsApi.list(), [])

  const classes = structure?.classes ?? []
  const teachers = teacherData?.data ?? []
  const subjects = subjectData?.subjects ?? []

  // Flatten sections with their class name for a single dropdown.
  const sections: Section[] = useMemo(
    () =>
      classes.flatMap((c) =>
        (c.sections ?? []).map((s) => ({
          ...s,
          class: { id: c.id, name: c.name },
        }))
      ),
    [classes]
  )

  const [teacherId, setTeacherId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      await assignmentsApi.create({
        teacherId: Number(teacherId),
        sectionId: Number(sectionId),
        subjectId: Number(subjectId),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const canSave = teacherId && sectionId && subjectId

  return (
    <Modal
      open
      onClose={onClose}
      title="Add assignment"
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
        <Select
          label="Teacher"
          value={teacherId}
          onChange={(e) => setTeacherId(Number(e.target.value) || '')}
        >
          <option value="">Select teacher…</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </Select>
        <Select
          label="Class & section"
          value={sectionId}
          onChange={(e) => setSectionId(Number(e.target.value) || '')}
        >
          <option value="">Select section…</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.class?.name} — {s.name}
            </option>
          ))}
        </Select>
        <Select
          label="Subject"
          value={subjectId}
          onChange={(e) => setSubjectId(Number(e.target.value) || '')}
        >
          <option value="">Select subject…</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  )
}
