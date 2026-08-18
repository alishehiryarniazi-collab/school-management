import type { Role } from '../types'

// Where each role lands after login. Kept out of component files so fast-refresh
// stays happy (a module should export either only components, or only helpers).
export function homeFor(role: Role): string {
  return role === 'student' ? '/portal' : '/'
}
