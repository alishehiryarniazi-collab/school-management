// App routing. Public /login, an admin/teacher area behind AdminLayout, and a
// separate student portal. ProtectedRoute enforces auth + role.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SubjectsPage } from './pages/SubjectsPage'
import { TeachersPage } from './pages/TeachersPage'
import { ClassesPage } from './pages/ClassesPage'
import { StudentsPage } from './pages/StudentsPage'
import { AttendancePage } from './pages/AttendancePage'
import { NoticesPage } from './pages/NoticesPage'
import { MarksPage } from './pages/MarksPage'
import { SyllabusPage } from './pages/SyllabusPage'
import { DatesheetPage } from './pages/DatesheetPage'
import { TimetablePage } from './pages/TimetablePage'
import { AssignmentsPage } from './pages/AssignmentsPage'
import { StudentPortalPage } from './pages/StudentPortalPage'

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
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/marks" element={<MarksPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/datesheet" element={<DatesheetPage />} />
            <Route path="/syllabus" element={<SyllabusPage />} />
            <Route path="/notices" element={<NoticesPage />} />

            {/* Admin-only routes */}
            <Route
              path="/teachers"
              element={
                <ProtectedRoute roles={['admin']}>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ClassesPage />
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
                  <AssignmentsPage />
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
