import { type ReactNode } from 'react'

type Tone = 'error' | 'success' | 'info'

const tones: Record<Tone, string> = {
  error: 'bg-danger/10 text-danger border-danger/20',
  success: 'bg-success/10 text-success border-success/20',
  info: 'bg-primary-light text-primary border-primary/20',
}

// Inline message banner for form errors / success notices.
export function Alert({
  children,
  tone = 'error',
}: {
  children: ReactNode
  tone?: Tone
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}>
      {children}
    </div>
  )
}
