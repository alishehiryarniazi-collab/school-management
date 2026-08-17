import { Button } from './Button'
import type { Pagination as PaginationInfo } from '../../types'

// Prev/Next pager with a "page X of Y • N total" label.
export function Pagination({
  info,
  onPage,
}: {
  info: PaginationInfo
  onPage: (page: number) => void
}) {
  if (info.total === 0) return null
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <span className="text-xs text-muted">
        Page {info.page} of {info.totalPages} • {info.total} total
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={info.page <= 1}
          onClick={() => onPage(info.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={info.page >= info.totalPages}
          onClick={() => onPage(info.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
