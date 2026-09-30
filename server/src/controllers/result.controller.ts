import type { Request, Response } from 'express'
import {
  sectionExamQuerySchema,
  classResultQuerySchema,
  cardQuerySchema,
} from '../validators/result.validators.js'
import * as service from '../services/result.service.js'

// GET /api/results/exams?sectionId=
export async function exams(req: Request, res: Response) {
  const { sectionId } = sectionExamQuerySchema.parse(req.query)
  res.json({ exams: await service.listSectionExams(sectionId) })
}

// GET /api/results/class?sectionId=&examName=
export async function classResults(req: Request, res: Response) {
  const { sectionId, examName } = classResultQuerySchema.parse(req.query)
  res.json(await service.compileClassResults(sectionId, examName))
}

// GET /api/results/card?studentId=&examName=
export async function card(req: Request, res: Response) {
  const { studentId, examName } = cardQuerySchema.parse(req.query)
  res.json({ card: await service.getResultCard(studentId, examName) })
}
