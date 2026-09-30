import type { Request, Response } from 'express'
import { unauthorized } from '../utils/AppError.js'
import { getDashboard } from '../services/dashboard.service.js'

export async function stats(req: Request, res: Response) {
  if (!req.user) throw unauthorized()
  // Only admins see fee figures.
  const data = await getDashboard(req.user.role === 'admin')
  res.json(data)
}
