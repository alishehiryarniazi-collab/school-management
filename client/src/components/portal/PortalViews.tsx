// The read-only views shown inside the student portal tabs. Each fetches the
// logged-in student's own data.
import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { portalApi } from '../../services/portal.api'
import type { TimetableSlot } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../ui/States'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { money } from '../../utils/money'
import { printChallan } from '../../utils/printChallan'
import { printResultCard } from '../../utils/printResultCard'
import { schoolProfileApi } from '../../services/fees.api'
import type { ResultCard } from '../../types'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const statusTone: Record<string, 'success' | 'danger' | 'primary' | 'neutral'> =
  {
    present: 'success',
    absent: 'danger',
    late: 'primary',
    leave: 'neutral',
  }

// ---- Attendance ----
export function AttendanceView() {
  const { data, loading, error, reload } = useApi(
    () => portalApi.attendance(),
    []
  )
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data) return null

  const s = data.summary
  const cards = [
    { label: 'Present', value: s.present, tone: 'text-success' },
    { label: 'Absent', value: s.absent, tone: 'text-danger' },
    { label: 'Late', value: s.late, tone: 'text-warning' },
    { label: 'Leave', value: s.leave, tone: 'text-muted' },
  ]

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Overall attendance</p>
            <p className="text-3xl font-semibold text-heading">
              {data.percentage}%
            </p>
          </div>
          <div className="text-right text-sm text-muted">
            {s.total} day{s.total === 1 ? '' : 's'} recorded
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 text-center">
            <p className={`text-2xl font-semibold ${c.tone}`}>{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </Card>
        ))}
      </div>

      {data.records.length === 0 ? (
        <EmptyState title="No attendance recorded yet" />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {data.records.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="text-body">{fmtDate(r.date)}</span>
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

// ---- Marks ----
export function MarksView() {
  const { data, loading, error, reload } = useApi(() => portalApi.marks(), [])
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const marks = data?.marks ?? []
  if (marks.length === 0) return <EmptyState title="No marks published yet" />

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Exam</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Marks</th>
              <th className="px-4 py-3 font-medium">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {marks.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 text-body">{m.examName}</td>
                <td className="px-4 py-3 font-medium text-heading">
                  {m.subject.name}
                </td>
                <td className="px-4 py-3 text-body">
                  {m.marksObtained} / {m.totalMarks}
                </td>
                <td className="px-4 py-3 text-muted">
                  {Math.round((m.marksObtained / m.totalMarks) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ---- Timetable ----
const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function TimetableView() {
  const { data, loading, error, reload } = useApi(
    () => portalApi.timetable(),
    []
  )
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const slots = data?.timetable ?? []
  if (slots.length === 0)
    return <EmptyState title="No timetable published yet" />

  // Group by day, ordered Mon..Sun.
  const byDay = new Map<string, TimetableSlot[]>()
  for (const s of slots) {
    if (!byDay.has(s.dayOfWeek)) byDay.set(s.dayOfWeek, [])
    byDay.get(s.dayOfWeek)!.push(s)
  }
  const days = [...byDay.keys()].sort(
    (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)
  )

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <Card key={day} className="p-4">
          <h3 className="mb-2 font-semibold text-heading">{day}</h3>
          <ul className="divide-y divide-border">
            {byDay
              .get(day)!
              .sort((a, b) => a.periodNo - b.periodNo)
              .map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-body">
                    <span className="mr-2 text-muted">P{s.periodNo}</span>
                    {s.subject.name}
                  </span>
                  <span className="text-xs text-muted">
                    {s.startTime && s.endTime
                      ? `${s.startTime}–${s.endTime}`
                      : ''}
                    {s.teacher ? ` · ${s.teacher.fullName}` : ''}
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}

// ---- Date sheet ----
export function DatesheetView() {
  const { data, loading, error, reload } = useApi(
    () => portalApi.datesheet(),
    []
  )
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const entries = data?.datesheet ?? []
  if (entries.length === 0)
    return <EmptyState title="No date sheet published yet" />

  return (
    <Card>
      <ul className="divide-y divide-border">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-heading">{e.subject.name}</p>
              <p className="text-xs text-muted">{e.examName}</p>
            </div>
            <div className="text-right">
              <p className="text-body">{fmtDate(e.examDate)}</p>
              {e.startTime && (
                <p className="text-xs text-muted">
                  {e.startTime}
                  {e.endTime ? `–${e.endTime}` : ''}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

// ---- Syllabus ----
export function SyllabusView() {
  const { data, loading, error, reload } = useApi(
    () => portalApi.syllabus(),
    []
  )
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const items = data?.syllabus ?? []
  if (items.length === 0)
    return <EmptyState title="No syllabus published yet" />

  return (
    <div className="space-y-3">
      {items.map((s) => (
        <Card key={s.id} className="p-4">
          <div className="mb-1 flex items-center gap-2">
            <Badge tone="primary">{s.subject.name}</Badge>
            <h3 className="font-semibold text-heading">{s.title}</h3>
          </div>
          <p className="whitespace-pre-wrap text-sm text-body">{s.details}</p>
        </Card>
      ))}
    </div>
  )
}

// ---- Notices ----
export function NoticesView() {
  const { data, loading, error, reload } = useApi(() => portalApi.notices(), [])
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const notices = data?.notices ?? []
  if (notices.length === 0) return <EmptyState title="No notices yet" />

  return (
    <div className="space-y-3">
      {notices.map((n) => (
        <Card key={n.id} className="p-4">
          <h3 className="font-semibold text-heading">{n.title}</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-body">{n.body}</p>
          <p className="mt-2 text-xs text-muted">
            {n.postedBy?.fullName ?? 'School'} • {fmtDate(n.createdAt)}
          </p>
        </Card>
      ))}
    </div>
  )
}

// ---- Fees ----
const feeTone: Record<string, 'success' | 'danger' | 'primary'> = {
  paid: 'success',
  partial: 'primary',
  unpaid: 'danger',
}

export function FeesView() {
  const { data, loading, error, reload } = useApi(() => portalApi.fees(), [])
  const { data: profileData } = useApi(() => schoolProfileApi.get(), [])
  const profile = profileData?.profile
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={reload} />
  const challans = data?.challans ?? []
  if (challans.length === 0) return <EmptyState title="No fee challans yet" />

  const totalDue = challans.reduce((s, c) => s + (c.total - c.paidAmount), 0)

  return (
    <div className="space-y-4">
      {totalDue > 0 && (
        <Card className="p-4">
          <p className="text-sm text-muted">Total balance due</p>
          <p className="text-2xl font-semibold text-danger">
            {money(totalDue)}
          </p>
        </Card>
      )}
      <Card>
        <ul className="divide-y divide-border">
          {challans.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-heading">{c.title}</p>
                <p className="text-xs text-muted">
                  Paid {money(c.paidAmount)} of {money(c.total)}
                </p>
                {c.total - c.paidAmount > 0 && (
                  <p className="text-xs text-danger">
                    Due {money(c.total - c.paidAmount)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={feeTone[c.status]}>{c.status}</Badge>
                {profile && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => printChallan(c, profile)}
                  >
                    PDF
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

// ---- Result ----
export function ResultView() {
  const { data: examData, loading: examsLoading } = useApi(
    () => portalApi.resultExams(),
    []
  )
  const { data: profileData } = useApi(() => schoolProfileApi.get(), [])
  const profile = profileData?.profile
  const exams = examData?.exams ?? []
  const [exam, setExam] = useState('')

  useEffect(() => {
    setExam(examData?.exams?.[0] ?? '')
  }, [examData])

  const { data, loading, error, reload } = useApi(
    () => (exam ? portalApi.result(exam) : Promise.resolve(null)),
    [exam]
  )

  if (examsLoading) return <LoadingState />
  if (exams.length === 0) return <EmptyState title="No result published yet" />

  const card = data?.card

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-56">
          <Select value={exam} onChange={(e) => setExam(e.target.value)}>
            {exams.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </div>
        {card && profile && (
          <Button
            variant="secondary"
            onClick={() => printResultCard(card, profile)}
          >
            Download PDF
          </Button>
        )}
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {card && <ResultCardView card={card} />}
    </div>
  )
}

function ResultCardView({ card }: { card: ResultCard }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-heading">{card.examName}</p>
          <p className="text-xs text-muted">
            {card.section.class.name} — {card.section.name} · Roll #
            {card.rollNo}
          </p>
        </div>
        <Badge tone={card.result === 'Pass' ? 'success' : 'danger'}>
          {card.result}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Subject</th>
              <th className="px-3 py-2 font-medium">Marks</th>
              <th className="px-3 py-2 font-medium">%</th>
              <th className="px-3 py-2 font-medium">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {card.subjects.map((s) => (
              <tr key={s.subject}>
                <td className="px-3 py-2 text-body">{s.subject}</td>
                <td className="px-3 py-2 text-body">
                  {s.obtained}/{s.total}
                </td>
                <td className="px-3 py-2 text-muted">{s.percent}%</td>
                <td className="px-3 py-2 text-body">{s.grade}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="px-3 py-2 text-heading">Total</td>
              <td className="px-3 py-2 text-heading">
                {card.totalObtained}/{card.totalMax}
              </td>
              <td className="px-3 py-2 text-heading">{card.percent}%</td>
              <td className="px-3 py-2 text-heading">{card.grade}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
        <span>
          Position:{' '}
          <b className="text-heading">
            {card.position || '—'} of {card.classSize}
          </b>
        </span>
        <span>
          Grade: <b className="text-heading">{card.grade}</b>
        </span>
      </div>
    </Card>
  )
}
