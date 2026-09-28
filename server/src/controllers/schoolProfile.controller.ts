import type { Request, Response } from 'express'
import { updateSchoolProfileSchema } from '../validators/fee.validators.js'
import * as service from '../services/schoolProfile.service.js'

// Public: used by the login screen + printouts for branding.
export async function get(_req: Request, res: Response) {
  const profile = await service.getSchoolProfile()
  res.json({ profile })
}

// Admin only.
export async function update(req: Request, res: Response) {
  const data = updateSchoolProfileSchema.parse(req.body)
  const profile = await service.updateSchoolProfile(data)
  res.json({ profile })
}
