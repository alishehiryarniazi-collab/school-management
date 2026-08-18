// Create/edit a student. On create you can optionally set a password
// (otherwise the school default is used). Section can be changed here too.
import { useState } from 'react'
import { studentsApi } from '../../services/people.api'
import { ApiError } from '../../services/http'
import type { Student, Section } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'

// "Class 5 — A"
function sectionLabel(s: Section) {
  return `${s.class?.name ?? 'Class'} — ${s.name}`
}

// yyyy-mm-dd for <input type="date"> from an ISO string.
function toDateInput(iso?: string | null) {
  return iso ? iso.slice(0, 10) : ''
}

export function StudentForm({
  student,
  sections,
  onClose,
  onSaved,
}: {
  student: Student | null
  sections: Section[]
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = Boolean(student)
  const [fullName, setFullName] = useState(student?.user.fullName ?? '')
  const [rollNo, setRollNo] = useState(student ? String(student.rollNo) : '')
  const [sectionId, setSectionId] = useState<number | ''>(
    student?.sectionId ?? ''
  )
  const [gender, setGender] = useState(student?.gender ?? '')
  const [dob, setDob] = useState(toDateInput(student?.dob))
  const [guardianName, setGuardianName] = useState(student?.guardianName ?? '')
  const [guardianPhone, setGuardianPhone] = useState(
    student?.guardianPhone ?? ''
  )
  const [address, setAddress] = useState(student?.address ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const payload = {
        fullName: fullName.trim(),
        rollNo: Number(rollNo),
        sectionId: Number(sectionId),
        gender: (gender || undefined) as
          'male' | 'female' | 'other' | undefined,
        dob: dob || undefined,
        guardianName: guardianName.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
        address: address.trim() || undefined,
      }
      if (isEdit && student) {
        await studentsApi.update(student.id, payload)
      } else {
        await studentsApi.create({
          ...payload,
          password: password || undefined,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const canSave = fullName.trim() && rollNo && sectionId

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit student' : 'Add student'}
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoFocus
        />
        <Input
          label="Roll number"
          type="number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
        />
        <Select
          label="Class & section"
          value={sectionId}
          onChange={(e) => setSectionId(Number(e.target.value) || '')}
        >
          <option value="">Select…</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {sectionLabel(s)}
            </option>
          ))}
        </Select>
        <Select
          label="Gender (optional)"
          value={gender ?? ''}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">—</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
        <Input
          label="Date of birth (optional)"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        <Input
          label="Guardian name (optional)"
          value={guardianName ?? ''}
          onChange={(e) => setGuardianName(e.target.value)}
        />
        <Input
          label="Guardian phone (optional)"
          value={guardianPhone ?? ''}
          onChange={(e) => setGuardianPhone(e.target.value)}
        />
        {!isEdit && (
          <Input
            label="Password (optional)"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Default: school123"
          />
        )}
        <div className="sm:col-span-2">
          <Input
            label="Address (optional)"
            value={address ?? ''}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
