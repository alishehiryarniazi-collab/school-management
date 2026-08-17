import { type ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'danger' | 'primary'

const tones: Record<Tone, string> = {
  neutral: 'bg-canvas text-muted',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  primary: 'bg-primary-light text-primary',
}

// Small coloured status pill (e.g. Active / Inactive).
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: Tone
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
