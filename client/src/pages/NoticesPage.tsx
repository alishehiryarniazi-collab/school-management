// List, post, edit, and delete notices. Edit/delete only shows for the admin
// or the person who posted the notice (the backend also enforces this).
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { noticesApi } from '../services/notices.api'
import { ApiError } from '../services/http'
import type { Notice } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'
import { NoticeForm } from '../components/notices/NoticeForm'

const audienceLabel: Record<Notice['audience'], string> = {
  all: 'Everyone',
  teachers: 'Teachers',
  students: 'Students',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function NoticesPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useApi(() => noticesApi.list(), [])
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)

  const notices = data?.notices ?? []

  function canManage(n: Notice) {
    return user?.role === 'admin' || n.postedById === user?.id
  }

  async function handleDelete(n: Notice) {
    if (!confirm(`Delete notice "${n.title}"?`)) return
    try {
      await noticesApi.remove(n.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Notices"
        subtitle="Post announcements for teachers and students."
        actions={
          <Button onClick={() => setCreating(true)}>
            <IconPlus /> Post notice
          </Button>
        }
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && notices.length === 0 && (
        <Card>
          <EmptyState
            title="No notices yet"
            hint="Post your first announcement."
            action={
              <Button onClick={() => setCreating(true)}>
                <IconPlus /> Post notice
              </Button>
            }
          />
        </Card>
      )}

      <div className="space-y-3">
        {notices.map((n) => (
          <Card key={n.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-heading">
                    {n.title}
                  </h2>
                  <Badge tone="primary">{audienceLabel[n.audience]}</Badge>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-body">
                  {n.body}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {n.postedBy?.fullName ?? 'Unknown'} •{' '}
                  {formatDate(n.createdAt)}
                </p>
              </div>
              {canManage(n) && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(n)}
                    aria-label="Edit"
                  >
                    <IconEdit />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(n)}
                    aria-label="Delete"
                    className="text-danger"
                  >
                    <IconTrash />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {(creating || editing) && (
        <NoticeForm
          notice={editing}
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
