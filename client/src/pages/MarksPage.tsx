// Enter marks: pick class + section + subject + exam + total, then type each
// student's score and save.
import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi, subjectsApi } from '../services/school.api'
import { marksApi } from '../services/academics.api'
import { ApiError } from '../services/http'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'

export function MarksPage() {
  const [classId, setClassId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [examName, setExamName] = useState('')
  const [totalMarks, setTotalMarks] = useState('100')
  const [scores, setScores] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const { data: structure } = useApi(() => classesApi.list(), [])
  const { data: subjectData } = useApi(() => subjectsApi.list(), [])
  const classes = structure?.classes ?? []
  const subjects = subjectData?.subjects ?? []
  const sections = classId
    ? (classes.find((c) => c.id === classId)?.sections ?? [])
    : []

  // Existing exam names for this section+subject (for quick reuse).
  const { data: examData } = useApi(
    () =>
      sectionId && subjectId
        ? marksApi.exams(Number(sectionId), Number(subjectId))
        : Promise.resolve({ exams: [] }),
    [sectionId, subjectId]
  )

  const ready = Boolean(sectionId && subjectId && examName.trim())
  const {
    data: roster,
    loading,
    error,
    reload,
  } = useApi(
    () =>
      ready
        ? marksApi.getRoster(
            Number(sectionId),
            Number(subjectId),
            examName.trim()
          )
        : Promise.resolve(null),
    [sectionId, subjectId, examName]
  )

  // Seed scores + total from existing marks when the roster loads.
  useEffect(() => {
    if (!roster) return
    const seed: Record<number, string> = {}
    let total: string | null = null
    for (const r of roster.roster) {
      if (r.marksObtained !== null) seed[r.studentId] = String(r.marksObtained)
      if (r.totalMarks !== null) total = String(r.totalMarks)
    }
    setScores(seed)
    if (total) setTotalMarks(total)
    setSaved(false)
  }, [roster])

  const rosterList = roster?.roster ?? []

  async function save() {
    setSaveError(null)
    setSaving(true)
    try {
      const records = rosterList
        .filter(
          (r) => scores[r.studentId] !== undefined && scores[r.studentId] !== ''
        )
        .map((r) => ({
          studentId: r.studentId,
          marksObtained: Number(scores[r.studentId]),
        }))
      if (records.length === 0)
        throw new ApiError('Enter at least one mark', 400)
      await marksApi.save({
        sectionId: Number(sectionId),
        subjectId: Number(subjectId),
        examName: examName.trim(),
        totalMarks: Number(totalMarks),
        records,
      })
      setSaved(true)
      reload()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Marks"
        subtitle="Enter exam marks for a class section."
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          label="Class"
          value={classId}
          onChange={(e) => {
            setClassId(Number(e.target.value) || '')
            setSectionId('')
          }}
        >
          <option value="">Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Section"
          value={sectionId}
          onChange={(e) => setSectionId(Number(e.target.value) || '')}
          disabled={!classId}
        >
          <option value="">Section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          label="Subject"
          value={subjectId}
          onChange={(e) => setSubjectId(Number(e.target.value) || '')}
        >
          <option value="">Subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-heading">Exam</label>
          <input
            list="exam-names"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g. Midterm"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <datalist id="exam-names">
            {(examData?.exams ?? []).map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </div>
        <Input
          label="Total marks"
          type="number"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
        />
      </div>

      <Card>
        {!ready && (
          <EmptyState
            title="Choose class, section, subject & exam"
            hint="Fill the fields above to load the student list."
          />
        )}
        {ready && loading && <LoadingState />}
        {ready && error && <ErrorState message={error} onRetry={reload} />}
        {ready && !loading && !error && rosterList.length === 0 && (
          <EmptyState title="No students in this section" />
        )}

        {ready && rosterList.length > 0 && (
          <>
            <ul className="divide-y divide-border">
              {rosterList.map((r) => (
                <li
                  key={r.studentId}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="text-sm">
                    <span className="mr-2 inline-block w-8 text-muted">
                      #{r.rollNo}
                    </span>
                    <span className="font-medium text-heading">
                      {r.fullName}
                    </span>
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted">
                    <input
                      type="number"
                      min={0}
                      max={Number(totalMarks) || undefined}
                      value={scores[r.studentId] ?? ''}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [r.studentId]: e.target.value,
                        }))
                      }
                      className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-right text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span>/ {totalMarks}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-3">
              {saved && <span className="text-sm text-success">✓ Saved</span>}
              <Button onClick={save} loading={saving}>
                Save marks
              </Button>
            </div>
          </>
        )}
      </Card>

      {saveError && (
        <div className="mt-3">
          <Alert>{saveError}</Alert>
        </div>
      )}
    </div>
  )
}
