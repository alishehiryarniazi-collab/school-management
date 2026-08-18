// The shell for admin/teacher screens: a dark sidebar of nav links, a topbar
// with the current user + logout, and the routed page content in the middle.
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'
import {
  IconHome,
  IconUsers,
  IconGraduation,
  IconLayers,
  IconBook,
  IconLink,
  IconCheckSquare,
  IconBell,
  IconLogout,
  IconMenu,
  IconClose,
} from '../components/icons'

interface NavItem {
  to: string
  label: string
  icon: typeof IconHome
  roles: Role[]
}

// Nav items are filtered by the current user's role.
const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: IconHome, roles: ['admin', 'teacher'] },
  { to: '/attendance', label: 'Attendance', icon: IconCheckSquare, roles: ['admin', 'teacher'] },
  { to: '/students', label: 'Students', icon: IconGraduation, roles: ['admin', 'teacher'] },
  { to: '/notices', label: 'Notices', icon: IconBell, roles: ['admin', 'teacher'] },
  { to: '/teachers', label: 'Teachers', icon: IconUsers, roles: ['admin'] },
  { to: '/classes', label: 'Classes & Sections', icon: IconLayers, roles: ['admin'] },
  { to: '/subjects', label: 'Subjects', icon: IconBook, roles: ['admin'] },
  { to: '/assignments', label: 'Assignments', icon: IconLink, roles: ['admin'] },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = NAV.filter((n) => user && n.roles.includes(user.role))

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-slate-200 transition-transform md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold text-white">🎓 SchoolMS</span>
          <button
            className="text-slate-300 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <button
            className="text-body md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-heading">
                {user?.fullName}
              </p>
              <p className="text-xs capitalize text-muted">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-body transition hover:bg-canvas"
            >
              <IconLogout />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
