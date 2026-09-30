// Simple percentage -> grade scale (common in Pakistani schools).
// Pass mark is 40%.
export function gradeFor(percent: number): string {
  if (percent >= 90) return 'A+'
  if (percent >= 80) return 'A'
  if (percent >= 70) return 'B'
  if (percent >= 60) return 'C'
  if (percent >= 50) return 'D'
  if (percent >= 40) return 'E'
  return 'F'
}

export const PASS_PERCENT = 40
