// Collect fees: filter challans, take payments, and print challans/receipts.
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi } from '../services/school.api'
import { challansApi, schoolProfileApi } from '../services/fees.api'
import { ApiError } from '../services/http'
import type { Challan, ChallanStatus } from '../types'
import { money } from '../utils/money'
import { printChallan } from '../utils/printChallan'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States'

const statusTone: Record<ChallanStatus, 'success' | 'danger' | 'primary'> = {
  paid: 'success',
  partial: 'primary',
  unpaid: 'danger',
}

export function CollectFeesPage() {
  const { data: classData } = useApi(() => classesApi.list(), [])
  const { data: profileData } = useApi(() => schoolProfileApi.get(), [])
  const classes = classData?.classes ?? []
  const profile = profileData?.profile

  const [classId, setClassId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [status, setStatus] = useState<'' | ChallanStatus>('')

  const sections = classId
    ? (classes.find((c) => c.id === classId)?.sections ?? [])
    : []

  const { data, loading, error, reload } = useApi(
    () =>
      challansApi.list({
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        status: status || undefined,
      }),
    [classId, sectionId, status]
  )
  const challans = data?.challans ?? []

  const [paying, setPaying] = useState<Challan | null>(null)

  return (
    <div>
      <PageHeader
        title="Collect Fees"
        subtitle="Take payments and print challans/receipts."
      />

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          value={classId}
          onChange={(e) => {
            setClassId(Number(e.target.value) || '')
            setSectionId('')
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
          onChange={(e) => setSectionId(Number(e.target.value) || '')}
          disabled={!classId}
        >
          <option value="">All sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | ChallanStatus)}
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </Select>
      </div>

      <Card>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && challans.length === 0 && (
          <EmptyState
            title="No challans found"
            hint="Generate challans first, or change the filters."
          />
        )}
        {challans.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Bill</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {challans.map((c) => {
                  const balance = c.total - c.paidAmount
                  return (
                    <tr key={c.id} className="hover:bg-canvas/60">
                      <td className="px-4 py-3">
                        <span className="font-medium text-heading">
                          {c.student?.user.fullName}
                        </span>
                        <span className="ml-1 text-xs text-muted">
                          #{c.student?.rollNo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {c.student?.section.class.name}—
                        {c.student?.section.name}
                      </td>
                      <td className="px-4 py-3 text-muted">{c.title}</td>
                      <td className="px-4 py-3 text-body">{money(c.total)}</td>
                      <td className="px-4 py-3 text-body">{money(balance)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {c.status !== 'paid' && (
                            <Button size="sm" onClick={() => setPaying(c)}>
                              Pay
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => profile && printChallan(c, profile)}
                          >
                            Print
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {paying && profile && (
        <PayModal
          challan={paying}
          onClose={() => setPaying(null)}
          onPaid={(updated) => {
            setPaying(null)
            reload()
            // offer an instant receipt
            if (
              updated.status === 'paid' &&
              confirm('Payment saved. Print receipt?')
            ) {
              printChallan(updated, profile)
            }
          }}
        />
      )}
    </div>
  )
}

function PayModal({
  challan,
  onClose,
  onPaid,
}: {
  challan: Challan
  onClose: () => void
  onPaid: (updated: Challan) => void
}) {
  const balance = challan.total - challan.paidAmount
  const [amount, setAmount] = useState(String(balance))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function pay() {
    setError(null)
    setSaving(true)
    try {
      const res = await challansApi.pay(challan.id, { amount: Number(amount) })
      onPaid(res.challan)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Collect fee — ${challan.student?.user.fullName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={pay} loading={saving} disabled={Number(amount) <= 0}>
            Save payment
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      )}
      <div className="mb-4 rounded-lg bg-canvas p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Bill</span>
          <span className="text-body">{challan.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Total</span>
          <span className="text-body">{money(challan.total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Already paid</span>
          <span className="text-body">{money(challan.paidAmount)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span className="text-heading">Balance</span>
          <span className="text-heading">{money(balance)}</span>
        </div>
      </div>
      <Input
        label="Amount received"
        type="number"
        min={1}
        max={balance}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        autoFocus
      />
    </Modal>
  )
}
