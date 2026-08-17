import type { Request, Response } from 'express'
import { idParamSchema } from '../validators/common.validators.js'
import {
  createAssignmentSchema,
  assignmentFilterSchema,
} from '../validators/assignment.validators.js'
import * as assignmentService from '../services/assignment.service.js'

export async function list(req: Request, res: Response) {
  const filter = assignmentFilterSchema.parse(req.query)
  const assignments = await assignmentService.listAssignments(filter)
  res.json({ assignments })
}

export async function create(req: Request, res: Response) {
  const data = createAssignmentSchema.parse(req.body)
  const assignment = await assignmentService.createAssignment(data)
  res.status(201).json({ assignment })
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params)
  await assignmentService.deleteAssignment(id)
  res.json({ message: 'Assignment removed' })
}
