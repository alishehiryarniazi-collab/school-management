// Builds and configures the Express application.
// Kept separate from server.ts so the app can be imported in tests later
// without actually starting a listening server.
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import classRoutes from './routes/class.routes.js'
import sectionRoutes from './routes/section.routes.js'
import subjectRoutes from './routes/subject.routes.js'
import teacherRoutes from './routes/teacher.routes.js'
import studentRoutes from './routes/student.routes.js'
import assignmentRoutes from './routes/assignment.routes.js'
import attendanceRoutes from './routes/attendance.routes.js'
import noticeRoutes from './routes/notice.routes.js'
import markRoutes from './routes/mark.routes.js'
import syllabusRoutes from './routes/syllabus.routes.js'
import datesheetRoutes from './routes/datesheet.routes.js'
import timetableRoutes from './routes/timetable.routes.js'
import portalRoutes from './routes/portal.routes.js'

export function createApp() {
  const app = express()

  // Allow the frontend origin to call us AND send/receive cookies.
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  )

  // Parse JSON request bodies and cookies.
  app.use(express.json())
  app.use(cookieParser())

  // Simple health check to confirm the server + DB wiring is alive.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() })
  })

  // --- Feature routes ---
  app.use('/api/auth', authRoutes)
  app.use('/api/classes', classRoutes)
  app.use('/api/sections', sectionRoutes)
  app.use('/api/subjects', subjectRoutes)
  app.use('/api/teachers', teacherRoutes)
  app.use('/api/students', studentRoutes)
  app.use('/api/assignments', assignmentRoutes)
  app.use('/api/attendance', attendanceRoutes)
  app.use('/api/notices', noticeRoutes)
  app.use('/api/marks', markRoutes)
  app.use('/api/syllabus', syllabusRoutes)
  app.use('/api/datesheet', datesheetRoutes)
  app.use('/api/timetable', timetableRoutes)
  app.use('/api/portal', portalRoutes)

  // Unknown route + global error handling (must be LAST).
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
