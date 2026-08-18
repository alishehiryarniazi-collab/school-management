// Guards routes: redirects to /login if not authenticated, or to the user's
// own home if their role isn't allowed here. Works as a layout wrapper
// (renders <Outlet/>) or around specific children.
import { type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'
import { LoadingState } from './ui/States'
import { homeFor } from '../utils/roles'

export function ProtectedRoute({
  roles,
  children,
}: {
  roles?: Role[]
  children?: ReactNode
}) {
  const { user, loading } = useAuth()

  // Wait until we've checked for an existing session.
  if (loading) return <LoadingState label="Checking your session…" />

  if (!user) return <Navigate to="/login" replace />

  // Logged in but not allowed on this route -> send to their own area.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />
  }

  return <>{children ?? <Outlet />}</>
}
