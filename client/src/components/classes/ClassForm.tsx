// Create/rename a class.
import { useState } from 'react'
import { classesApi } from '../../services/school.api'
import { ApiError } from '../../services/http'
import type { ClassItem } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'

export function ClassForm({
  classItem,
  onClose,
  onSaved,
}: {
  classItem: ClassItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(classItem?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      if (classItem) await classesApi.update(classItem.id, name.trim())
      else await classesApi.create(name.trim())
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
      title={classItem ? 'Rename class' : 'Add class'}
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
        label="Class name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Class 5"
        autoFocus
      />
    </Modal>
  )
}
