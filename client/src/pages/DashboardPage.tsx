// Landing page after login: fee-collection progress + school stats + today's
// attendance. Fees show for admins only.
import { type ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { dashboardApi } from '../services/dashboard.api'
import { money } from '../utils/money'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { LoadingState, ErrorState } from '../components/ui/States'
import {
  IconGraduation,
  IconUsers,
  IconLayers,
  IconBook,
  IconWallet,
  IconCheckSquare,
} from '../components/icons'

export function DashboardPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useApi(() => dashboardApi.get(), [])

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0] ?? ''} 👋`}
        subtitle="Aaj ka overview — ek nazar mein."
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          {/* Fee collection (admin only) */}
          {data.fees && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <IconWallet />
                </span>
                <h2 className="text-lg font-semibold text-heading">
                  Fee Collection
                </h2>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Figure
                  label="Collected"
                  value={money(data.fees.collected)}
                  tone="text-success"
                />
                <Figure
                  label="Outstanding"
                  value={money(data.fees.outstanding)}
                  tone="text-danger"
                />
                <Figure
                  label="Total billed"
                  value={money(data.fees.billed)}
                  tone="text-heading"
                />
              </div>

              {/* progress bar */}
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted">Collected</span>
                <span className="font-medium text-heading">
                  {data.fees.percentCollected}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{
                    width: `${Math.min(100, data.fees.percentCollected)}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <Mini
                  label="Paid challans"
                  value={data.fees.paidCount}
                  tone="text-success"
                />
                <Mini
                  label="Pending"
                  value={data.fees.pendingCount}
                  tone="text-warning"
                />
                <Mini
                  label="Defaulters"
                  value={data.fees.defaulters}
                  tone="text-danger"
                />
              </div>
            </Card>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Students"
              value={data.students.total}
              icon={<IconGraduation />}
              tone="primary"
            />
            <StatCard
              label="Teachers"
              value={data.structure.teachers}
              icon={<IconUsers />}
              tone="success"
            />
            <StatCard
              label="Classes"
              value={data.structure.classes}
              icon={<IconLayers />}
              tone="amber"
            />
            <StatCard
              label="Sections"
              value={data.structure.sections}
              icon={<IconLayers />}
              tone="neutral"
            />
            <StatCard
              label="Subjects"
              value={data.structure.subjects}
              icon={<IconBook />}
              tone="neutral"
            />
          </div>

          {/* Attendance today */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                <IconCheckSquare />
              </span>
              <h2 className="text-lg font-semibold text-heading">
                Aaj ki Attendance
              </h2>
            </div>
            {data.attendanceToday.marked === 0 ? (
              <p className="text-sm text-muted">
                Aaj abhi tak koi attendance mark nahi hui.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Figure
                  label="Present %"
                  value={`${data.attendanceToday.percentPresent}%`}
                  tone="text-success"
                />
                <Figure
                  label="Present"
                  value={data.attendanceToday.present}
                  tone="text-success"
                />
                <Figure
                  label="Absent"
                  value={data.attendanceToday.absent}
                  tone="text-danger"
                />
                <Figure
                  label="Late"
                  value={data.attendanceToday.late}
                  tone="text-warning"
                />
                <Figure
                  label="Leave"
                  value={data.attendanceToday.leave}
                  tone="text-muted"
                />
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

function Figure({
  label,
  value,
  tone,
}: {
  label: string
  value: ReactNode
  tone: string
}) {
  return (
    <div>
      <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <span className="text-sm">
      <span className={`font-semibold ${tone}`}>{value}</span>{' '}
      <span className="text-muted">{label}</span>
    </span>
  )
}

const toneClasses: Record<string, string> = {
  primary: 'bg-primary-light text-primary',
  success: 'bg-success/10 text-success',
  amber: 'bg-warning/10 text-warning',
  neutral: 'bg-canvas text-muted',
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: ReactNode
  tone: string
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClasses[tone]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold text-heading">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </Card>
  )
}
