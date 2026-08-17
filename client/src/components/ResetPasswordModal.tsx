// Reusable "set a new password" dialog. Used for both teachers and students.
import { useState } from 'react'
import { ApiError } from '../services/http'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Alert } from './ui/Alert'

export function ResetPasswordModal({
  personName,
  onClose,
  onSubmit,
}: {
  personName: string
  onClose: () => void
  onSubmit: (password: string) => Promise<unknown>
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      await onSubmit(password)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Reset password — ${personName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={password.length < 6}>
            Reset password
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
        label="New password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
        autoFocus
      />
    </Modal>
  )
}
