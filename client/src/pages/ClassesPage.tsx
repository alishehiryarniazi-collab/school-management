// Manage classes and their sections. Each class is a card listing its sections
// (with student count + class teacher). Admin can add/edit/delete both.
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi, sectionsApi } from '../services/school.api'
import { teachersApi } from '../services/people.api'
import { ApiError } from '../services/http'
import type { ClassItem, Section } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'
import { ClassForm } from '../components/classes/ClassForm'
import { SectionForm } from '../components/classes/SectionForm'

export function ClassesPage() {
  const { data, loading, error, reload } = useApi(() => classesApi.list(), [])
  // Teachers for the "class teacher" dropdown (fetch a generous page).
  const { data: teacherData } = useApi(
    () => teachersApi.list({ limit: 100 }),
    []
  )
  const teachers = teacherData?.data ?? []

  const [classForm, setClassForm] = useState<{ open: boolean; item: ClassItem | null }>(
    { open: false, item: null }
  )
  const [sectionForm, setSectionForm] = useState<{
    cls: ClassItem
    section: Section | null
  } | null>(null)

  const classes = data?.classes ?? []

  async function deleteClass(c: ClassItem) {
    if (!confirm(`Delete "${c.name}" and its sections?`)) return
    try {
      await classesApi.remove(c.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  async function deleteSection(s: Section) {
    if (!confirm(`Delete section "${s.name}"?`)) return
    try {
      await sectionsApi.remove(s.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Classes & Sections"
        subtitle="Set up the school structure students are enrolled into."
        actions={
          <Button onClick={() => setClassForm({ open: true, item: null })}>
            <IconPlus /> Add class
          </Button>
        }
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && classes.length === 0 && (
        <Card>
          <EmptyState
            title="No classes yet"
            hint="Add your first class (e.g. Class 1), then add sections to it."
            action={
              <Button onClick={() => setClassForm({ open: true, item: null })}>
                <IconPlus /> Add class
              </Button>
            }
          />
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {classes.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-heading">{c.name}</h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClassForm({ open: true, item: c })}
                  aria-label="Rename class"
                >
                  <IconEdit />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteClass(c)}
                  aria-label="Delete class"
                  className="text-danger"
                >
                  <IconTrash />
                </Button>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-2">
              {(c.sections ?? []).length === 0 && (
                <p className="text-sm text-muted">No sections yet.</p>
              )}
              {(c.sections ?? []).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-heading">
                      {c.name} — {s.name}
                    </span>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <Badge>{s._count?.students ?? 0} students</Badge>
                      <span>
                        Class teacher: {s.classTeacher?.fullName ?? 'none'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSectionForm({ cls: c, section: s })}
                      aria-label="Edit section"
                    >
                      <IconEdit />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSection(s)}
                      aria-label="Delete section"
                      className="text-danger"
                    >
                      <IconTrash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSectionForm({ cls: c, section: null })}
              >
                <IconPlus /> Add section
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {classForm.open && (
        <ClassForm
          classItem={classForm.item}
          onClose={() => setClassForm({ open: false, item: null })}
          onSaved={() => {
            setClassForm({ open: false, item: null })
            reload()
          }}
        />
      )}

      {sectionForm && (
        <SectionForm
          classId={sectionForm.cls.id}
          className={sectionForm.cls.name}
          section={sectionForm.section}
          teachers={teachers}
          onClose={() => setSectionForm(null)}
          onSaved={() => {
            setSectionForm(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
