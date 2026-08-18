// "Arrange / move" a student into a different class-section (and optionally
// change their roll number). This is the dedicated enrollment action.
import { useState } from 'react'
import { studentsApi } from '../../services/people.api'
import { ApiError } from '../../services/http'
import type { Student, Section } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'

function sectionLabel(s: Section) {
  return `${s.class?.name ?? 'Class'} — ${s.name}`
}

export function AssignSectionModal({
  student,
  sections,
  onClose,
  onSaved,
}: {
  student: Student
  sections: Section[]
  onClose: () => void
  onSaved: () => void
}) {
  const [sectionId, setSectionId] = useState<number | ''>(student.sectionId)
  const [rollNo, setRollNo] = useState(String(student.rollNo))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      await studentsApi.assign(student.id, Number(sectionId), Number(rollNo))
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not move student')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Move ${student.user.fullName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            loading={saving}
            disabled={!sectionId || !rollNo}
          >
            Move student
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
          label="New class & section"
          value={sectionId}
          onChange={(e) => setSectionId(Number(e.target.value) || '')}
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {sectionLabel(s)}
            </option>
          ))}
        </Select>
        <Input
          label="Roll number"
          type="number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
        />
      </div>
    </Modal>
  )
}
