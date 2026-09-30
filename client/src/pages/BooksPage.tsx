// Manage the book list for each class (shown to students/parents).
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi } from '../services/school.api'
import { booksApi } from '../services/books.api'
import { ApiError } from '../services/http'
import type { Book } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'

export function BooksPage() {
  const { data: classData } = useApi(() => classesApi.list(), [])
  const classes = classData?.classes ?? []
  const [classId, setClassId] = useState<number | ''>('')

  const { data, loading, error, reload } = useApi(
    () => booksApi.list(classId || undefined),
    [classId]
  )
  const books = data?.books ?? []

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)

  async function handleDelete(b: Book) {
    if (!confirm(`Remove "${b.title}"?`)) return
    try {
      await booksApi.remove(b.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Books"
        subtitle="Har class ki book list — students/parents ise dekhte hain."
        actions={
          <Button
            onClick={() => setCreating(true)}
            disabled={classes.length === 0}
          >
            <IconPlus /> Add book
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select
          value={classId}
          onChange={(e) => setClassId(Number(e.target.value) || '')}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && books.length === 0 && (
          <EmptyState
            title="No books yet"
            hint="Add the books required for a class."
          />
        )}
        {books.length > 0 && (
          <ul className="divide-y divide-border">
            {books.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-heading">{b.title}</span>
                  {b.subject && <Badge tone="primary">{b.subject}</Badge>}
                  {!classId && b.class && <Badge>{b.class.name}</Badge>}
                </span>
                <span className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(b)}
                    aria-label="Edit"
                  >
                    <IconEdit />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={() => handleDelete(b)}
                    aria-label="Delete"
                  >
                    <IconTrash />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {(creating || editing) && (
        <BookForm
          book={editing}
          classes={classes}
          defaultClassId={classId || ''}
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

function BookForm({
  book,
  classes,
  defaultClassId,
  onClose,
  onSaved,
}: {
  book: Book | null
  classes: { id: number; name: string }[]
  defaultClassId: number | ''
  onClose: () => void
  onSaved: () => void
}) {
  const [classId, setClassId] = useState<number | ''>(
    book?.class?.id ?? book?.classId ?? defaultClassId
  )
  const [title, setTitle] = useState(book?.title ?? '')
  const [subject, setSubject] = useState(book?.subject ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      if (book) {
        await booksApi.update(book.id, {
          title: title.trim(),
          subject: subject.trim() || null,
        })
      } else {
        await booksApi.create({
          classId: Number(classId),
          title: title.trim(),
          subject: subject.trim() || undefined,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const canSave = title.trim() && (book || classId)

  return (
    <Modal
      open
      onClose={onClose}
      title={book ? 'Edit book' : 'Add book'}
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
        {/* Class is fixed after creation. */}
        {!book && (
          <Select
            label="Class"
            value={classId}
            onChange={(e) => setClassId(Number(e.target.value) || '')}
          >
            <option value="">Select class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
        <Input
          label="Book title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Mathematics 5"
          autoFocus
        />
        <Input
          label="Subject (optional)"
          value={subject ?? ''}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Mathematics"
        />
      </div>
    </Modal>
  )
}
