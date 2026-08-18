// Auth request handlers. Each is thin: validate input -> call service ->
// set/clear cookie -> send a safe response. Thrown errors go to errorHandler.
import type { Request, Response } from 'express'
import type { User } from '@prisma/client'
import { signToken } from '../utils/jwt.js'
import {
  AUTH_COOKIE,
  authCookieOptions,
  clearCookieOptions,
} from '../utils/cookies.js'
import {
  staffLoginSchema,
  studentLoginSchema,
} from '../validators/auth.validators.js'
import {
  loginStaff,
  loginStudent,
  getSchoolStructure,
} from '../services/auth.service.js'
import type { Role } from '../types/auth.js'

// Strip the password hash before sending a user to the client.
function toSafeUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as Role,
    phone: user.phone,
  }
}

// Sign a token for the user and attach it as an httpOnly cookie.
function issueSession(res: Response, user: User) {
  const token = signToken({ userId: user.id, role: user.role as Role })
  res.cookie(AUTH_COOKIE, token, authCookieOptions)
}

// POST /api/auth/login  (admin & teacher)
export async function staffLogin(req: Request, res: Response) {
  const { email, password } = staffLoginSchema.parse(req.body)
  const user = await loginStaff(email, password)
  issueSession(res, user)
  res.json({ user: toSafeUser(user) })
}

// POST /api/auth/student-login
export async function studentLogin(req: Request, res: Response) {
  const { sectionId, rollNo, password } = studentLoginSchema.parse(req.body)
  const user = await loginStudent(sectionId, rollNo, password)
  issueSession(res, user)
  res.json({ user: toSafeUser(user) })
}

// GET /api/auth/me  (requires auth) — used by the frontend to restore session.
export async function me(req: Request, res: Response) {
  // requireAuth guarantees req.user exists here.
  res.json({ user: req.user })
}

// POST /api/auth/logout
export async function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE, clearCookieOptions)
  res.json({ message: 'Logged out' })
}

// GET /api/auth/school-structure  (public) — classes + sections for login dropdowns.
export async function schoolStructure(_req: Request, res: Response) {
  const classes = await getSchoolStructure()
  res.json({ classes })
}
