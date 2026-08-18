// One place that turns any thrown error into a clean JSON response.
// Express 5 automatically forwards rejected promises from async handlers here,
// so controllers can just `throw` and this catches it.
import type { ErrorRequestHandler, RequestHandler } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'
import { isProd } from '../config/env.js'

// 404 handler for unknown routes (mounted after all real routes).
export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1) Zod validation errors -> 400 with field-by-field details
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    })
    return
  }

  // 2) Known Prisma errors -> friendly messages
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ')
      res.status(409).json({
        message: target
          ? `A record with this ${target} already exists`
          : 'This record already exists',
      })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Record not found' })
      return
    }
    if (err.code === 'P2003') {
      // Foreign key restrict: trying to delete something still in use.
      res.status(409).json({
        message:
          'This record is still linked to other data and cannot be deleted',
      })
      return
    }
  }

  // 3) Our own expected errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  // 4) Anything else = an unexpected bug. Log it, hide details in production.
  console.error('Unexpected error:', err)
  res.status(500).json({
    message: 'Something went wrong on the server',
    ...(isProd ? {} : { detail: (err as Error)?.message }),
  })
}
