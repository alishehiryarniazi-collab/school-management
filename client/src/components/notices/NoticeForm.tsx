// Create/edit a notice. "Send to" lets you target everyone, teachers, all
// students, one class, or one section.
import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { noticesApi, type NoticeInput } from '../../services/notices.api'
import { classesApi } from '../../services/school.api'
import { ApiError } from '../../services/http'
import type { Notice } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'

type SendTo = 'all' | 'teachers' | 'students' | 'class' | 'section'

function initialSendTo(n: Notice | null): SendTo {
  if (!n) return 'all'
  if (n.sectionId) return 'section'
  if (n.classId) return 'class'
  return n.audience
}

export function NoticeForm({
  notice,
  onClose,
  onSaved,
}: {
  notice: Notice | null
  onClose: () => void
  onSaved: () => void
}) {
  const { data: classData } = useApi(() => classesApi.list(), [])
  const classes = classData?.classes ?? []

  const [title, setTitle] = useState(notice?.title ?? '')
  const [body, setBody] = useState(notice?.body ?? '')
  const [sendTo, setSendTo] = useState<SendTo>(initialSendTo(notice))
  const [classId, setClassId] = useState<number | ''>(
    notice?.section?.class.id ?? notice?.classId ?? ''
  )
  const [sectionId, setSectionId] = useState<number | ''>(
    notice?.sectionId ?? ''
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const sections = classId
    ? (classes.find((c) => c.id === classId)?.sections ?? [])
    : []

  async function save() {
    setError(null)
    setSaving(true)
    try {
      let payload: NoticeInput
      const base = { title: title.trim(), body: body.trim() }
      if (sendTo === 'class') {
        payload = {
          ...base,
          audience: 'students',
          classId: Number(classId),
          sectionId: null,
        }
      } else if (sendTo === 'section') {
        payload = {
          ...base,
          audience: 'students',
          classId: null,
          sectionId: Number(sectionId),
        }
      } else {
        payload = { ...base, audience: sendTo, classId: null, sectionId: null }
      }

      if (notice) await noticesApi.update(notice.id, payload)
      else await noticesApi.create(payload)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const canSave =
    title.trim() &&
    body.trim() &&
    (sendTo !== 'class' || classId) &&
    (sendTo !== 'section' || sectionId)

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
          <Button onClick={save} loading={saving} disabled={!canSave}>
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
          label="Send to"
          value={sendTo}
          onChange={(e) => setSendTo(e.target.value as SendTo)}
        >
          <option value="all">Everyone</option>
          <option value="teachers">Teachers only</option>
          <option value="students">All students</option>
          <option value="class">A specific class</option>
          <option value="section">A specific section</option>
        </Select>

        {(sendTo === 'class' || sendTo === 'section') && (
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Class"
              value={classId}
              onChange={(e) => {
                setClassId(Number(e.target.value) || '')
                setSectionId('')
              }}
            >
              <option value="">Select…</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {sendTo === 'section' && (
              <Select
                label="Section"
                value={sectionId}
                onChange={(e) => setSectionId(Number(e.target.value) || '')}
                disabled={!classId}
              >
                <option value="">Select…</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
