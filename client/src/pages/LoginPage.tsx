// Login screen with two modes: Staff (admin/teacher, email + password) and
// Student (class + section + roll number + password).
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeFor } from '../utils/roles'
import { authApi } from '../services/auth.api'
import { ApiError } from '../services/http'
import type { ClassItem } from '../types'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'

type Mode = 'staff' | 'student'

export function LoginPage() {
  const { user, staffLogin, studentLogin } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('staff')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already logged in? Go straight to the right home.
  useEffect(() => {
    if (user) navigate(homeFor(user.role), { replace: true })
  }, [user, navigate])

  // Staff fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Student fields
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [classId, setClassId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [rollNo, setRollNo] = useState('')
  const [studentPassword, setStudentPassword] = useState('')

  // Load classes/sections when the student tab is opened (for the dropdowns).
  useEffect(() => {
    if (mode !== 'student' || classes.length) return
    authApi
      .schoolStructure()
      .then((r) => setClasses(r.classes))
      .catch(() => setError('Could not load classes. Is the server running?'))
  }, [mode, classes.length])

  const sections = useMemo(
    () => classes.find((c) => c.id === classId)?.sections ?? [],
    [classes, classId]
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const loggedIn =
        mode === 'staff'
          ? await staffLogin(email.trim(), password)
          : await studentLogin(
              Number(sectionId),
              Number(rollNo),
              studentPassword
            )
      navigate(homeFor(loggedIn.role), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-heading">🎓 SchoolMS</h1>
          <p className="mt-1 text-sm text-muted">
            School Management System — sign in to continue
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          {/* Mode tabs */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-canvas p-1">
            {(['staff', 'student'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setError(null)
                }}
                className={`rounded-md py-2 text-sm font-medium capitalize transition ${
                  mode === m
                    ? 'bg-surface text-heading shadow-sm'
                    : 'text-muted hover:text-heading'
                }`}
              >
                {m === 'staff' ? 'Admin / Teacher' : 'Student'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'staff' ? (
              <>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@school.com"
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </>
            ) : (
              <>
                <Select
                  label="Class"
                  value={classId}
                  onChange={(e) => {
                    setClassId(Number(e.target.value) || '')
                    setSectionId('')
                  }}
                  required
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Section"
                  value={sectionId}
                  onChange={(e) => setSectionId(Number(e.target.value) || '')}
                  required
                  disabled={!classId}
                >
                  <option value="">Select section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Roll number"
                  name="rollNo"
                  type="number"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                  placeholder="e.g. 5"
                />
                <Input
                  label="Password"
                  name="studentPassword"
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </>
            )}

            <Button type="submit" loading={submitting} className="mt-1 w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Default admin: admin@school.com / admin123
        </p>
      </div>
    </div>
  )
}
