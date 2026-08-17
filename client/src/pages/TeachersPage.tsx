// Manage teacher accounts: search, paginated list, add/edit, activate/deactivate,
// and reset password.
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useDebounce } from '../hooks/useDebounce'
import { teachersApi } from '../services/people.api'
import { ApiError } from '../services/http'
import type { Teacher } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Pagination } from '../components/ui/Pagination'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconKey, IconSearch } from '../components/icons'
import { TeacherForm } from '../components/teachers/TeacherForm'
import { ResetPasswordModal } from '../components/ResetPasswordModal'

export function TeachersPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput)

  const { data, loading, error, reload } = useApi(
    () => teachersApi.list({ page, limit: 10, search }),
    [page, search]
  )

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [resetting, setResetting] = useState<Teacher | null>(null)

  const teachers = data?.data ?? []

  async function toggleActive(t: Teacher) {
    try {
      await teachersApi.update(t.id, { isActive: !t.isActive })
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Update failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Teachers"
        subtitle="Create and manage teacher accounts."
        actions={
          <Button onClick={() => setCreating(true)}>
            <IconPlus /> Add teacher
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <IconSearch />
          </span>
          <Input
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && teachers.length === 0 && (
          <EmptyState
            title="No teachers found"
            hint={
              search
                ? 'Try a different search.'
                : 'Add your first teacher to get started.'
            }
          />
        )}

        {teachers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Classes</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-canvas/60">
                    <td className="px-4 py-3 font-medium text-heading">
                      {t.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted">{t.email}</td>
                    <td className="px-4 py-3 text-muted">{t.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted">
                      {t._count?.teachingAssignments ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={t.isActive ? 'success' : 'danger'}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(t)}
                          aria-label="Edit"
                        >
                          <IconEdit />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResetting(t)}
                          aria-label="Reset password"
                        >
                          <IconKey />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(t)}
                        >
                          {t.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && <Pagination info={data.pagination} onPage={setPage} />}
      </Card>

      {(creating || editing) && (
        <TeacherForm
          teacher={editing}
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

      {resetting && (
        <ResetPasswordModal
          personName={resetting.fullName}
          onClose={() => setResetting(null)}
          onSubmit={(pw) => teachersApi.resetPassword(resetting.id, pw)}
        />
      )}
    </div>
  )
}
