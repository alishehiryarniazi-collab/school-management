import type { Request, Response } from 'express'
import {
  attendanceQuerySchema,
  markAttendanceSchema,
} from '../validators/attendance.validators.js'
import * as attendanceService from '../services/attendance.service.js'
import { unauthorized } from '../utils/AppError.js'

// GET /api/attendance?sectionId=&date=YYYY-MM-DD
export async function getRoster(req: Request, res: Response) {
  const { sectionId, date } = attendanceQuerySchema.parse(req.query)
  const result = await attendanceService.getSectionAttendance(sectionId, date)
  res.json(result)
}

// POST /api/attendance  — bulk mark
export async function mark(req: Request, res: Response) {
  if (!req.user) throw unauthorized()
  const input = markAttendanceSchema.parse(req.body)
  const result = await attendanceService.markAttendance(input, req.user.id)
  res.json(result)
}
