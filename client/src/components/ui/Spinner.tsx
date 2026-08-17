// A simple loading spinner.
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: '1em', height: '1em' }}
      aria-label="Loading"
    />
  )
}
