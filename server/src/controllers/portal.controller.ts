// Controllers for the student portal. requireAuth guarantees req.user exists,
// and the routes restrict to role 'student'.
import type { Request, Response } from 'express'
import { unauthorized } from '../utils/AppError.js'
import { portalResultQuerySchema } from '../validators/result.validators.js'
import * as portalService from '../services/portal.service.js'

function userId(req: Request): number {
  if (!req.user) throw unauthorized()
  return req.user.id
}

export async function profile(req: Request, res: Response) {
  res.json({ profile: await portalService.getProfile(userId(req)) })
}

export async function attendance(req: Request, res: Response) {
  res.json(await portalService.getAttendance(userId(req)))
}

export async function marks(req: Request, res: Response) {
  res.json({ marks: await portalService.getMarks(userId(req)) })
}

export async function syllabus(req: Request, res: Response) {
  res.json({ syllabus: await portalService.getSyllabus(userId(req)) })
}

export async function datesheet(req: Request, res: Response) {
  res.json({ datesheet: await portalService.getDatesheet(userId(req)) })
}

export async function timetable(req: Request, res: Response) {
  res.json({ timetable: await portalService.getTimetable(userId(req)) })
}

export async function notices(req: Request, res: Response) {
  res.json({ notices: await portalService.getNotices(userId(req)) })
}

export async function fees(req: Request, res: Response) {
  res.json({ challans: await portalService.getFees(userId(req)) })
}

export async function resultExams(req: Request, res: Response) {
  res.json({ exams: await portalService.getMyExams(userId(req)) })
}

export async function result(req: Request, res: Response) {
  const { examName } = portalResultQuerySchema.parse(req.query)
  res.json({ card: await portalService.getMyResult(userId(req), examName) })
}
