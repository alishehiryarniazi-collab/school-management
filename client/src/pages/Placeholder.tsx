// Temporary placeholder for pages still being built.
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'

export function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <Card className="p-10 text-center">
        <p className="text-sm text-muted">🚧 This screen is coming next.</p>
      </Card>
    </div>
  )
}

// Minimal student portal landing until the read-only portal is built.
export function StudentPortalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold text-heading">🎓 Student Portal</h1>
        <p className="mt-2 text-sm text-muted">
          Your attendance, marks, syllabus, date sheet, and timetable will appear
          here. This portal is coming soon.
        </p>
      </Card>
    </div>
  )
}
