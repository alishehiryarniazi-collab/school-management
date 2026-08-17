// Builds a query string from an object, skipping empty/undefined values.
// e.g. { page: 1, search: '' } -> "?page=1"
export function toQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      sp.set(key, String(value))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}
