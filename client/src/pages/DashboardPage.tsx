// Landing page after login: a few live stat cards summarising the school.
import { type ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { classesApi, subjectsApi } from '../services/school.api'
import { teachersApi, studentsApi } from '../services/people.api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { LoadingState, ErrorState } from '../components/ui/States'
import {
  IconGraduation,
  IconUsers,
  IconLayers,
  IconBook,
} from '../components/icons'

interface Stats {
  students: number
  teachers: number | null
  classes: number
  sections: number
  subjects: number
}

export function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { data, loading, error, reload } = useApi<Stats>(async () => {
    const [cls, students, subjects] = await Promise.all([
      classesApi.list(),
      studentsApi.list({ limit: 1 }),
      subjectsApi.list(),
    ])
    // Only admins may read the teachers list.
    const teachers = isAdmin
      ? (await teachersApi.list({ limit: 1 })).pagination.total
      : null

    const sections = cls.classes.reduce(
      (n, c) => n + (c.sections?.length ?? 0),
      0
    )
    return {
      students: students.pagination.total,
      teachers,
      classes: cls.classes.length,
      sections,
      subjects: subjects.subjects.length,
    }
  }, [isAdmin])

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0] ?? ''} 👋`}
        subtitle="Here's a quick overview of your school."
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Students"
            value={data.students}
            icon={<IconGraduation />}
            tone="primary"
          />
          {data.teachers !== null && (
            <StatCard
              label="Teachers"
              value={data.teachers}
              icon={<IconUsers />}
              tone="success"
            />
          )}
          <StatCard
            label="Classes"
            value={data.classes}
            icon={<IconLayers />}
            tone="amber"
          />
          <StatCard
            label="Sections"
            value={data.sections}
            icon={<IconLayers />}
            tone="neutral"
          />
          <StatCard
            label="Subjects"
            value={data.subjects}
            icon={<IconBook />}
            tone="neutral"
          />
        </div>
      )}
    </div>
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
    <Card className="flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${toneClasses[tone]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-heading">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </Card>
  )
}
