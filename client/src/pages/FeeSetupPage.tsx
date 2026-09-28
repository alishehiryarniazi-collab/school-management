// Fee setup: define fee types (heads) and set their amount for each class.
import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { classesApi } from '../services/school.api'
import { feeHeadsApi, classFeesApi } from '../services/fees.api'
import { ApiError } from '../services/http'
import type { FeeHead } from '../types'
import { money } from '../utils/money'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { LoadingState } from '../components/ui/States'
import { IconPlus, IconEdit, IconTrash } from '../components/icons'

export function FeeSetupPage() {
  const {
    data: headData,
    loading,
    reload,
  } = useApi(() => feeHeadsApi.list(), [])
  const { data: classData } = useApi(() => classesApi.list(), [])
  const heads = headData?.feeHeads ?? []
  const classes = classData?.classes ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FeeHead | null>(null)

  async function deleteHead(h: FeeHead) {
    if (!confirm(`Delete fee type "${h.name}"?`)) return
    try {
      await feeHeadsApi.remove(h.id)
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Fee Setup"
        subtitle="Define fee types, then set each class's amount."
      />

      {loading && <LoadingState />}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Fee types */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-heading">Fee Types</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <IconPlus /> Add type
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {heads.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between py-2.5"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-heading">{h.name}</span>
                  <Badge tone={h.isRecurring ? 'primary' : 'neutral'}>
                    {h.isRecurring ? 'Monthly' : 'One-time'}
                  </Badge>
                </span>
                <span className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(h)
                      setFormOpen(true)
                    }}
                  >
                    <IconEdit />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    onClick={() => deleteHead(h)}
                  >
                    <IconTrash />
                  </Button>
                </span>
              </li>
            ))}
            {heads.length === 0 && !loading && (
              <li className="py-3 text-sm text-muted">No fee types yet.</li>
            )}
          </ul>
        </Card>

        {/* Class fees */}
        <ClassFeesCard heads={heads} classes={classes} />
      </div>

      {formOpen && (
        <FeeHeadForm
          head={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false)
            reload()
          }}
        />
      )}
    </div>
  )
}

function ClassFeesCard({
  heads,
  classes,
}: {
  heads: FeeHead[]
  classes: { id: number; name: string }[]
}) {
  const [classId, setClassId] = useState<number | ''>('')
  const { data, reload } = useApi(
    () =>
      classId ? classFeesApi.list(Number(classId)) : Promise.resolve(null),
    [classId]
  )
  const [amounts, setAmounts] = useState<Record<number, string>>({})
  const [savingId, setSavingId] = useState<number | null>(null)

  // Seed amount inputs from saved class fees.
  useEffect(() => {
    const seed: Record<number, string> = {}
    for (const cf of data?.classFees ?? [])
      seed[cf.feeHeadId] = String(cf.amount)
    setAmounts(seed)
  }, [data])

  async function saveAmount(headId: number) {
    if (!classId) return
    const value = Number(amounts[headId])
    if (Number.isNaN(value)) return
    setSavingId(headId)
    try {
      await classFeesApi.set({
        classId: Number(classId),
        feeHeadId: headId,
        amount: value,
      })
      reload()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-semibold text-heading">Class Fees</h2>
      <Select
        value={classId}
        onChange={(e) => setClassId(Number(e.target.value) || '')}
      >
        <option value="">Select a class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      {classId && (
        <ul className="mt-4 space-y-2">
          {heads.map((h) => (
            <li key={h.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-body">{h.name}</span>
              <div className="flex items-center gap-1 text-sm text-muted">
                <span>Rs.</span>
                <input
                  type="number"
                  min={0}
                  value={amounts[h.id] ?? ''}
                  onChange={(e) =>
                    setAmounts((a) => ({ ...a, [h.id]: e.target.value }))
                  }
                  placeholder="0"
                  className="w-28 rounded-lg border border-border bg-surface px-2 py-1 text-right text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                loading={savingId === h.id}
                onClick={() => saveAmount(h.id)}
              >
                Save
              </Button>
            </li>
          ))}
          {heads.length === 0 && (
            <li className="text-sm text-muted">Add fee types first.</li>
          )}
        </ul>
      )}
      {classId && (
        <p className="mt-3 text-xs text-muted">
          Tip: monthly {money(3000)}, admission {money(5000)}, exam{' '}
          {money(2000)}.
        </p>
      )}
    </Card>
  )
}

function FeeHeadForm({
  head,
  onClose,
  onSaved,
}: {
  head: FeeHead | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(head?.name ?? '')
  const [isRecurring, setIsRecurring] = useState(head?.isRecurring ?? true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      if (head)
        await feeHeadsApi.update(head.id, { name: name.trim(), isRecurring })
      else await feeHeadsApi.create({ name: name.trim(), isRecurring })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={head ? 'Edit fee type' : 'Add fee type'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!name.trim()}>
            Save
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-3">
          <Alert>{error}</Alert>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <Input
          label="Fee name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Monthly Fee"
          autoFocus
        />
        <Select
          label="Type"
          value={isRecurring ? 'yes' : 'no'}
          onChange={(e) => setIsRecurring(e.target.value === 'yes')}
        >
          <option value="yes">Monthly (recurring)</option>
          <option value="no">One-time</option>
        </Select>
      </div>
    </Modal>
  )
}
