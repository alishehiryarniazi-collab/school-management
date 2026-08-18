import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const areaId = id ?? rest.name
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-heading">
            {label}
          </label>
        )}
        <textarea
          id={areaId}
          ref={ref}
          className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
          {...rest}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
