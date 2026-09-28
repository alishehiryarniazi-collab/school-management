// Generate monthly fee challans for a whole section at once.
import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi } from '../services/school.api'
import { feeHeadsApi, challansApi } from '../services/fees.api'
import { ApiError } from '../services/http'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

function monthTitle(period: string) {
  const [y, m] = period.split('-').map(Number)
  if (!y || !m) return period
  return new Date(y, m - 1, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function GenerateChallansPage() {
  const { data: classData } = useApi(() => classesApi.list(), [])
  const { data: headData } = useApi(() => feeHeadsApi.list(), [])
  const classes = classData?.classes ?? []
  const heads = headData?.feeHeads ?? []

  const [classId, setClassId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [month, setMonth] = useState(currentMonth())
  const [dueDate, setDueDate] = useState('')
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const sections = classId
    ? (classes.find((c) => c.id === classId)?.sections ?? [])
    : []

  // Pre-tick recurring (monthly) fee heads by default.
  useEffect(() => {
    const seed: Record<number, boolean> = {}
    for (const h of headData?.feeHeads ?? []) seed[h.id] = h.isRecurring
    setSelected(seed)
  }, [headData])

  const chosen = heads.filter((h) => selected[h.id]).map((h) => h.id)

  async function generate() {
    setError(null)
    setResult(null)
    if (!sectionId || chosen.length === 0) {
      setError('Pick a section and at least one fee.')
      return
    }
    setBusy(true)
    try {
      const r = await challansApi.generate({
        sectionId: Number(sectionId),
        period: month,
        title: monthTitle(month),
        feeHeadIds: chosen,
        dueDate: dueDate || undefined,
      })
      setResult(
        `Done — ${r.created} challan(s) created` +
          (r.skipped ? `, ${r.skipped} skipped (already existed).` : '.')
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not generate')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Generate Challans"
        subtitle="Create fee bills for a whole section in one click."
      />

      <Card className="max-w-2xl p-6">
        {error && (
          <div className="mb-4">
            <Alert>{error}</Alert>
          </div>
        )}
        {result && (
          <div className="mb-4">
            <Alert tone="success">{result}</Alert>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Class"
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
            label="Section"
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
          <Input
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <Input
            label="Due date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-heading">Include fees</p>
          <div className="flex flex-wrap gap-2">
            {heads.map((h) => (
              <label
                key={h.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  selected[h.id]
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border text-body'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!selected[h.id]}
                  onChange={(e) =>
                    setSelected((s) => ({ ...s, [h.id]: e.target.checked }))
                  }
                />
                {h.name}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={generate} loading={busy}>
            Generate challans for {monthTitle(month)}
          </Button>
        </div>
      </Card>
    </div>
  )
}
