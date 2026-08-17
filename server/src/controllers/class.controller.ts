import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  createClassSchema,
  updateClassSchema,
} from '../validators/class.validators.js'
import * as classService from '../services/class.service.js'

export async function list(_req: Request, res: Response) {
  const classes = await classService.listClasses()
  res.json({ classes })
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const cls = await classService.getClass(id)
  res.json({ class: cls })
}

export async function create(req: Request, res: Response) {
  const data = createClassSchema.parse(req.body)
  const cls = await classService.createClass(data)
  res.status(201).json({ class: cls })
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  const data = updateClassSchema.parse(req.body)
  const cls = await classService.updateClass(id, data)
  res.json({ class: cls })
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await classService.deleteClass(id)
  res.json({ message: 'Class deleted' })
}
