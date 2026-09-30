// Compile & print result cards for a class section + exam.
import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi } from '../services/school.api'
import { resultsApi } from '../services/results.api'
import { schoolProfileApi } from '../services/fees.api'
import type { StudentResult, ClassResult } from '../types'
import { printResultCard } from '../utils/printResultCard'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'

export function ResultCardsPage() {
  const { data: classData } = useApi(() => classesApi.list(), [])
  const { data: profileData } = useApi(() => schoolProfileApi.get(), [])
  const classes = classData?.classes ?? []
  const profile = profileData?.profile

  const [classId, setClassId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [exam, setExam] = useState('')

  const sections = classId
    ? (classes.find((c) => c.id === classId)?.sections ?? [])
    : []

  const { data: examData } = useApi(
    () =>
      sectionId
        ? resultsApi.exams(Number(sectionId))
        : Promise.resolve({ exams: [] }),
    [sectionId]
  )
  const exams = examData?.exams ?? []

  // Auto-pick first exam when section changes.
  useEffect(() => {
    setExam(examData?.exams?.[0] ?? '')
  }, [examData])

  const ready = Boolean(sectionId && exam)
  const { data, loading, error, reload } = useApi<ClassResult | null>(
    () =>
      ready
        ? resultsApi.classResults(Number(sectionId), exam)
        : Promise.resolve(null),
    [sectionId, exam]
  )

  function print(row: StudentResult) {
    if (!data || !profile) return
    printResultCard(
      {
        ...row,
        section: data.section,
        examName: data.examName,
        classSize: data.classSize,
      },
      profile
    )
  }

  const students = data?.students ?? []

  return (
    <div>
      <PageHeader
        title="Result Cards"
        subtitle="Marks se report card banayein aur print/PDF karein."
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          value={classId}
          onChange={(e) => {
            setClassId(Number(e.target.value) || '')
            setSectionId('')
          }}
        >
          <option value="">Select class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={sectionId}
          onChange={(e) => setSectionId(Number(e.target.value) || '')}
          disabled={!classId}
        >
          <option value="">Select section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          value={exam}
          onChange={(e) => setExam(e.target.value)}
          disabled={!sectionId || exams.length === 0}
        >
          <option value="">
            {exams.length === 0 ? 'No exams yet' : 'Select exam'}
          </option>
          {exams.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {!ready && (
          <EmptyState
            title="Pick class, section & exam"
            hint="Result marks ke basis par banega."
          />
        )}
        {ready && loading && <LoadingState />}
        {ready && error && <ErrorState message={error} onRetry={reload} />}
        {ready && !loading && !error && students.length === 0 && (
          <EmptyState title="No students / marks found" />
        )}

        {students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Roll</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium">%</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Position</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 text-right font-medium">Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s.studentId} className="hover:bg-canvas/60">
                    <td className="px-4 py-3 text-muted">{s.rollNo}</td>
                    <td className="px-4 py-3 font-medium text-heading">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-body">
                      {s.subjects.length
                        ? `${s.totalObtained}/${s.totalMax}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-body">
                      {s.subjects.length ? `${s.percent}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-body">{s.grade}</td>
                    <td className="px-4 py-3 text-muted">
                      {s.position || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          s.result === 'Pass'
                            ? 'success'
                            : s.result === 'Fail'
                              ? 'danger'
                              : 'neutral'
                        }
                      >
                        {s.result}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={s.subjects.length === 0}
                        onClick={() => print(s)}
                      >
                        Print
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
