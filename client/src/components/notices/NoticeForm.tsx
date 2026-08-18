// Create/edit a notice (title, message, audience).
import { useState } from 'react'
import { noticesApi } from '../../services/notices.api'
import { ApiError } from '../../services/http'
import type { Notice } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'

type Audience = 'all' | 'teachers' | 'students'

export function NoticeForm({
  notice,
  onClose,
  onSaved,
}: {
  notice: Notice | null
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(notice?.title ?? '')
  const [body, setBody] = useState(notice?.body ?? '')
  const [audience, setAudience] = useState<Audience>(notice?.audience ?? 'all')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const data = { title: title.trim(), body: body.trim(), audience }
      if (notice) await noticesApi.update(notice.id, data)
      else await noticesApi.create(data)
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
      title={notice ? 'Edit notice' : 'Post a notice'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            loading={saving}
            disabled={!title.trim() || !body.trim()}
          >
            {notice ? 'Save' : 'Post'}
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
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Parent-Teacher Meeting"
          autoFocus
        />
        <Textarea
          label="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Write the announcement…"
        />
        <Select
          label="Audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value as Audience)}
        >
          <option value="all">Everyone</option>
          <option value="teachers">Teachers only</option>
          <option value="students">Students only</option>
        </Select>
      </div>
    </Modal>
  )
}
