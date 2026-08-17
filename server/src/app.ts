// Builds and configures the Express application.
// Kept separate from server.ts so the app can be imported in tests later
// without actually starting a listening server.
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

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

  // --- Feature routes get mounted here as we build them ---
  // app.use('/api/auth', authRoutes)
  // app.use('/api/students', studentRoutes)

  // Unknown route + global error handling (must be LAST).
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
