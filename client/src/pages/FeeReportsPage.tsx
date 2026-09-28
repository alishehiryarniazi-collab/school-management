// Fee reports: collection/outstanding summary + defaulters list.
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { feeReportsApi } from '../services/fees.api'
import { money } from '../utils/money'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'

export function FeeReportsPage() {
  // Empty period = all time.
  const [period, setPeriod] = useState('')
  const { data, loading, error, reload } = useApi(
    () => feeReportsApi.get(period || undefined),
    [period]
  )

  const cards = data
    ? [
        {
          label: 'Collected',
          value: money(data.collected),
          tone: 'text-success',
        },
        {
          label: 'Outstanding',
          value: money(data.outstanding),
          tone: 'text-danger',
        },
        {
          label: 'Total billed',
          value: money(data.billed),
          tone: 'text-heading',
        },
        {
          label: 'Challans',
          value: `${data.paidCount} paid • ${data.unpaidCount + data.partialCount} due`,
          tone: 'text-body',
        },
      ]
    : []

  return (
    <div>
      <PageHeader
        title="Fee Reports"
        subtitle="Collection, outstanding, and defaulters."
        actions={
          <div className="flex items-end gap-2">
            <Input
              label="Month (optional)"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
            {period && (
              <Button variant="secondary" onClick={() => setPeriod('')}>
                All time
              </Button>
            )}
          </div>
        }
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((c) => (
              <Card key={c.label} className="p-5">
                <p className={`text-2xl font-semibold ${c.tone}`}>{c.value}</p>
                <p className="text-sm text-muted">{c.label}</p>
              </Card>
            ))}
          </div>

          <Card>
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-semibold text-heading">
                Defaulters ({data.defaulters.length})
              </h2>
            </div>
            {data.defaulters.length === 0 ? (
              <EmptyState title="No defaulters 🎉" hint="Everyone has paid." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Class</th>
                      <th className="px-4 py-3 font-medium">Bill</th>
                      <th className="px-4 py-3 text-right font-medium">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.defaulters.map((d) => (
                      <tr key={d.challanId} className="hover:bg-canvas/60">
                        <td className="px-4 py-3">
                          <span className="font-medium text-heading">
                            {d.name}
                          </span>
                          <span className="ml-1 text-xs text-muted">
                            #{d.rollNo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {d.className}—{d.sectionName}
                        </td>
                        <td className="px-4 py-3 text-muted">{d.title}</td>
                        <td className="px-4 py-3 text-right font-medium text-danger">
                          {money(d.due)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
