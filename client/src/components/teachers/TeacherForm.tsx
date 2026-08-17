// Create/edit teacher dialog. Password is only set when creating.
import { useState } from 'react'
import { teachersApi } from '../../services/people.api'
import { ApiError } from '../../services/http'
import type { Teacher } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'

export function TeacherForm({
  teacher,
  onClose,
  onSaved,
}: {
  teacher: Teacher | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = Boolean(teacher)
  const [fullName, setFullName] = useState(teacher?.fullName ?? '')
  const [email, setEmail] = useState(teacher?.email ?? '')
  const [phone, setPhone] = useState(teacher?.phone ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      if (isEdit && teacher) {
        await teachersApi.update(teacher.id, {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        })
      } else {
        await teachersApi.create({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
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
    fullName.trim() && email.trim() && (isEdit || password.length >= 6)

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit teacher' : 'Add teacher'}
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
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Phone (optional)"
          value={phone ?? ''}
          onChange={(e) => setPhone(e.target.value)}
        />
        {!isEdit && (
          <Input
            label="Initial password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        )}
      </div>
    </Modal>
  )
}
