// Manage subjects: list + add + rename + delete. The simplest CRUD screen —
// it's the template the other management pages follow.
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { subjectsApi } from '../services/school.api'
import { ApiError } from '../services/http'
import type { Subject } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'

export function SubjectsPage() {
  const { data, loading, error, reload } = useApi(() => subjectsApi.list(), [])
  const [editing, setEditing] = useState<Subject | null>(null)
  const [creating, setCreating] = useState(false)

  const subjects = data?.subjects ?? []

  async function handleDelete(s: Subject) {
    if (!confirm(`Delete subject "${s.name}"?`)) return
    try {
      await subjectsApi.remove(s.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle="Subjects taught across the school."
        actions={
          <Button onClick={() => setCreating(true)}>
            <IconPlus /> Add subject
          </Button>
        }
      />

      <Card className="p-2">
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && subjects.length === 0 && (
          <EmptyState
            title="No subjects yet"
            hint="Add subjects like Mathematics, English, or Science."
            action={
              <Button onClick={() => setCreating(true)}>
                <IconPlus /> Add subject
              </Button>
            }
          />
        )}
        {subjects.length > 0 && (
          <ul className="divide-y divide-border">
            {subjects.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-3 py-3"
              >
                <span className="text-sm font-medium text-heading">
                  {s.name}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(s)}
                    aria-label="Edit"
                  >
                    <IconEdit />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(s)}
                    aria-label="Delete"
                    className="text-danger"
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
        <SubjectForm
          subject={editing}
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

function SubjectForm({
  subject,
  onClose,
  onSaved,
}: {
  subject: Subject | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(subject?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      if (subject) await subjectsApi.update(subject.id, name.trim())
      else await subjectsApi.create(name.trim())
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={subject ? 'Rename subject' : 'Add subject'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!name.trim()}>
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
      <Input
        label="Subject name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Mathematics"
        autoFocus
      />
    </Modal>
  )
}
