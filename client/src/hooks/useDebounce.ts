// Returns a value that only updates after `delay` ms of no changes.
// Handy for search boxes so we don't fetch on every keystroke.
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
