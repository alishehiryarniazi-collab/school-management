import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  createNoticeSchema,
  updateNoticeSchema,
} from '../validators/notice.validators.js'
import * as noticeService from '../services/notice.service.js'
import { unauthorized } from '../utils/AppError.js'

export async function list(_req: Request, res: Response) {
  const notices = await noticeService.listNotices()
  res.json({ notices })
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw unauthorized()
  const data = createNoticeSchema.parse(req.body)
  const notice = await noticeService.createNotice(data, req.user.id)
  res.status(201).json({ notice })
}

export async function update(req: Request, res: Response) {
  if (!req.user) throw unauthorized()
  const { id } = idParamSchema.parse(req.params)
  const data = updateNoticeSchema.parse(req.body)
  const notice = await noticeService.updateNotice(id, data, req.user)
  res.json({ notice })
}

export async function remove(req: Request, res: Response) {
  if (!req.user) throw unauthorized()
  const { id } = idParamSchema.parse(req.params)
  await noticeService.deleteNotice(id, req.user)
  res.json({ message: 'Notice deleted' })
}
