// Global auth state. Holds the current user, restores the session on page load
// (via the /me endpoint + the httpOnly cookie), and exposes login/logout.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../types'
import { authApi } from '../services/auth.api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean // true while we check for an existing session on first load
  staffLogin: (email: string, password: string) => Promise<AuthUser>
  studentLogin: (
    sectionId: number,
    rollNo: number,
    password: string
  ) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On first load, ask the server who we are (if a valid cookie exists).
  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null)) // no/invalid session — that's fine
      .finally(() => setLoading(false))
  }, [])

  const staffLogin = async (email: string, password: string) => {
    const { user } = await authApi.staffLogin(email, password)
    setUser(user)
    return user
  }

  const studentLogin = async (
    sectionId: number,
    rollNo: number,
    password: string
  ) => {
    const { user } = await authApi.studentLogin(sectionId, rollNo, password)
    setUser(user)
    return user
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, staffLogin, studentLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
