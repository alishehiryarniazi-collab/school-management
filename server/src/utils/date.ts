// Date helpers for attendance.
//
// Attendance is "one row per student per day", enforced by unique(studentId, date).
// To make that reliable we always store the date as midnight UTC, so the time of
// day never causes a duplicate for the same calendar day.

// Accepts "YYYY-MM-DD" (or a Date) and returns that day at 00:00:00.000 UTC.
export function startOfDayUTC(input: string | Date): Date {
  const d =
    typeof input === 'string' ? new Date(`${input}T00:00:00.000Z`) : input
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

// Formats a Date as "YYYY-MM-DD".
export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}
