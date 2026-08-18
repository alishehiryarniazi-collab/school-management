// Manage students: search + class/section filters, paginated list, add/edit,
// move (arrange into a section), reset password, activate/deactivate.
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useDebounce } from '../hooks/useDebounce'
import { classesApi } from '../services/school.api'
import { studentsApi } from '../services/people.api'
import { ApiError } from '../services/http'
import type { Student, Section } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Pagination } from '../components/ui/Pagination'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconKey, IconLayers } from '../components/icons'
import { StudentForm } from '../components/students/StudentForm'
import { AssignSectionModal } from '../components/students/AssignSectionModal'
import { ResetPasswordModal } from '../components/ResetPasswordModal'

export function StudentsPage() {
  // Filters
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput)
  const [classId, setClassId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')

  // School structure (for filters + form dropdowns).
  const { data: structure } = useApi(() => classesApi.list(), [])
  const classes = structure?.classes ?? []

  // Flat list of sections enriched with their class, for the form dropdowns.
  const allSections: Section[] = classes.flatMap((c) =>
    (c.sections ?? []).map((s) => ({ ...s, class: { id: c.id, name: c.name } }))
  )

  // Sections available in the class-filter dropdown.
  const filterSections = classId
    ? (classes.find((c) => c.id === classId)?.sections ?? [])
    : []

  const { data, loading, error, reload } = useApi(
    () =>
      studentsApi.list({
        page,
        limit: 10,
        search,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
      }),
    [page, search, classId, sectionId]
  )

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [moving, setMoving] = useState<Student | null>(null)
  const [resetting, setResetting] = useState<Student | null>(null)

  const students = data?.data ?? []

  async function toggleActive(s: Student) {
    try {
      await studentsApi.update(s.id, { isActive: !s.user.isActive })
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Update failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Enroll and manage students."
        actions={
          <Button
            onClick={() => setCreating(true)}
            disabled={allSections.length === 0}
            title={
              allSections.length === 0
                ? 'Create a class & section first'
                : undefined
            }
          >
            <IconPlus /> Add student
          </Button>
        }
      />

      {allSections.length === 0 && (
        <Card className="mb-4 p-4">
          <p className="text-sm text-muted">
            You need at least one class &amp; section before adding students. Go
            to{' '}
            <span className="font-medium text-heading">
              Classes &amp; Sections
            </span>
            .
          </p>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by name or roll…"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
            setPage(1)
          }}
        />
        <Select
          value={classId}
          onChange={(e) => {
            setClassId(Number(e.target.value) || '')
            setSectionId('')
            setPage(1)
          }}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={sectionId}
          onChange={(e) => {
            setSectionId(Number(e.target.value) || '')
            setPage(1)
          }}
          disabled={!classId}
        >
          <option value="">All sections</option>
          {filterSections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && students.length === 0 && (
          <EmptyState
            title="No students found"
            hint={
              search || classId
                ? 'Try clearing the filters.'
                : 'Add your first student to get started.'
            }
          />
        )}

        {students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Roll</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Guardian</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-canvas/60">
                    <td className="px-4 py-3 text-muted">{s.rollNo}</td>
                    <td className="px-4 py-3 font-medium text-heading">
                      {s.user.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {s.section.class.name} — {s.section.name}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {s.guardianName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={s.user.isActive ? 'success' : 'danger'}>
                        {s.user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(s)}
                          aria-label="Edit"
                        >
                          <IconEdit />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMoving(s)}
                          aria-label="Move to another section"
                        >
                          <IconLayers />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResetting(s)}
                          aria-label="Reset password"
                        >
                          <IconKey />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(s)}
                        >
                          {s.user.isActive ? 'Deactivate' : 'Activate'}
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
        <StudentForm
          student={editing}
          sections={allSections}
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

      {moving && (
        <AssignSectionModal
          student={moving}
          sections={allSections}
          onClose={() => setMoving(null)}
          onSaved={() => {
            setMoving(null)
            reload()
          }}
        />
      )}

      {resetting && (
        <ResetPasswordModalForStudent
          student={resetting}
          onClose={() => setResetting(null)}
        />
      )}
    </div>
  )
}

// Thin wrapper so we can reuse the shared reset-password modal.
function ResetPasswordModalForStudent({
  student,
  onClose,
}: {
  student: Student
  onClose: () => void
}) {
  return (
    <ResetPasswordModal
      personName={student.user.fullName}
      onClose={onClose}
      onSubmit={(pw) => studentsApi.resetPassword(student.id, pw)}
    />
  )
}
