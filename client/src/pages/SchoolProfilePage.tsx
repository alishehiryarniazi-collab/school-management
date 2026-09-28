// Edit the school's branding (name, logo, contact) shown on challans/receipts.
import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { schoolProfileApi } from '../services/fees.api'
import { ApiError } from '../services/http'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { LoadingState } from '../components/ui/States'

export function SchoolProfilePage() {
  const { data, loading } = useApi(() => schoolProfileApi.get(), [])
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!data) return
    const p = data.profile
    setForm({
      name: p.name ?? '',
      tagline: p.tagline ?? '',
      address: p.address ?? '',
      phone: p.phone ?? '',
      email: p.email ?? '',
      logoUrl: p.logoUrl ?? '',
    })
  }, [data])

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function save() {
    setError(null)
    setSaving(true)
    try {
      await schoolProfileApi.update(form)
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <div>
      <PageHeader
        title="School Profile"
        subtitle="Your school's name and logo appear on challans, receipts, and the login screen."
      />

      <Card className="max-w-2xl p-6">
        {error && (
          <div className="mb-4">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-canvas">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="logo"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-2xl">🎓</span>
            )}
          </div>
          <div className="text-sm text-muted">
            Current logo preview
            <p className="text-xs">Set a logo path/URL below.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="School name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Tagline (optional)"
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder="e.g. Knowledge • Character • Success"
            />
          </div>
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Logo URL / path"
              value={form.logoUrl}
              onChange={(e) => set('logoUrl', e.target.value)}
              placeholder="/school-logo.svg"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={save} loading={saving} disabled={!form.name.trim()}>
            Save changes
          </Button>
          {saved && <span className="text-sm text-success">✓ Saved</span>}
        </div>
      </Card>
    </div>
  )
}
