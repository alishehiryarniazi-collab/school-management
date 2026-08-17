// A custom error type for *expected* errors we throw on purpose
// (e.g. "email already exists", "not found", "not allowed").
//
// `statusCode` lets us control the HTTP response, and `isOperational`
// marks it as a known/handled error vs an unexpected bug.
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// Small helpers for the most common cases, so controllers read cleanly.
export const badRequest = (msg: string) => new AppError(msg, 400)
export const unauthorized = (msg = 'Not authenticated') =>
  new AppError(msg, 401)
export const forbidden = (msg = 'Not allowed') => new AppError(msg, 403)
export const notFound = (msg = 'Not found') => new AppError(msg, 404)
export const conflict = (msg: string) => new AppError(msg, 409)
