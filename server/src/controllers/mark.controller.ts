import type { Request, Response } from 'express'
import {
  marksQuerySchema,
  examsQuerySchema,
  saveMarksSchema,
} from '../validators/mark.validators.js'
import * as markService from '../services/mark.service.js'

// GET /api/marks/exams?sectionId=&subjectId=
export async function exams(req: Request, res: Response) {
  const { sectionId, subjectId } = examsQuerySchema.parse(req.query)
  const examNames = await markService.listExams(sectionId, subjectId)
  res.json({ exams: examNames })
}

// GET /api/marks?sectionId=&subjectId=&examName=
export async function getRoster(req: Request, res: Response) {
  const { sectionId, subjectId, examName } = marksQuerySchema.parse(req.query)
  const result = await markService.getMarks(sectionId, subjectId, examName)
  res.json(result)
}

// POST /api/marks — bulk save
export async function save(req: Request, res: Response) {
  const input = saveMarksSchema.parse(req.body)
  const result = await markService.saveMarks(input)
  res.json(result)
}
