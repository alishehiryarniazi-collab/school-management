// Create/edit a section within a class, with an optional class teacher.
import { useState } from 'react'
import { sectionsApi } from '../../services/school.api'
import { ApiError } from '../../services/http'
import type { Section, Teacher } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'

export function SectionForm({
  classId,
  className,
  section,
  teachers,
  onClose,
  onSaved,
}: {
  classId: number
  className: string
  section: Section | null // null => creating
  teachers: Teacher[]
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(section?.name ?? '')
  const [classTeacherId, setClassTeacherId] = useState<number | ''>(
    section?.classTeacherId ?? ''
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const teacherId = classTeacherId === '' ? null : Number(classTeacherId)
      if (section) {
        await sectionsApi.update(section.id, {
          name: name.trim(),
          classTeacherId: teacherId,
        })
      } else {
        await sectionsApi.create({
          name: name.trim(),
          classId,
          classTeacherId: teacherId,
        })
      }
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
      title={
        section ? `Edit section — ${className}` : `Add section to ${className}`
      }
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
      <div className="flex flex-col gap-3">
        <Input
          label="Section name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. A"
          autoFocus
        />
        <Select
          label="Class teacher (optional)"
          value={classTeacherId}
          onChange={(e) => setClassTeacherId(Number(e.target.value) || '')}
        >
          <option value="">No class teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  )
}
