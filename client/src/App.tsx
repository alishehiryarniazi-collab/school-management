// App routing. Public /login, an admin/teacher area behind AdminLayout, and a
// separate student portal. ProtectedRoute enforces auth + role.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SubjectsPage } from './pages/SubjectsPage'
import { Placeholder, StudentPortalPage } from './pages/Placeholder'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin & Teacher area */}
          <Route
            element={
              <ProtectedRoute roles={['admin', 'teacher']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/students" element={<Placeholder title="Students" />} />

            {/* Admin-only routes */}
            <Route
              path="/teachers"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Placeholder title="Teachers" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Placeholder title="Classes & Sections" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects"
              element={
                <ProtectedRoute roles={['admin']}>
                  <SubjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Placeholder title="Assignments" />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Student area */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentPortalPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
