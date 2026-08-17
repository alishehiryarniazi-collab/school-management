// A small data-fetching hook: runs an async function and tracks
// loading / error / data, with a reload() to refetch.
//
// Usage:
//   const { data, loading, error, reload } = useApi(() => teachersApi.list({ page }), [page])
import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../services/http'

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Re-create the loader whenever deps change (e.g. page or search term).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetcher()
      .then(setData)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'Something went wrong')
      )
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}
