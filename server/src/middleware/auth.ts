// Auth middleware.
//
// requireAuth  -> makes sure the request has a valid session cookie, loads the
//                 (fresh) user from the DB, and attaches it as req.user.
// requireRole  -> only lets through users whose role is in the allowed list.
import type { RequestHandler } from 'express'
import { verifyToken } from '../utils/jwt.js'
import { AUTH_COOKIE } from '../utils/cookies.js'
import { prisma } from '../config/prisma.js'
import { AppError, unauthorized, forbidden } from '../utils/AppError.js'
import type { Role } from '../types/auth.js'

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE]
    if (!token) throw unauthorized('Please log in to continue')

    const payload = verifyToken(token)

    // Load the user fresh each request so disabled/deleted accounts lose access
    // immediately, without waiting for the token to expire.
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })
    if (!user || !user.isActive) {
      throw unauthorized('Your account is no longer active')
    }

    req.user = {
      id: user.id,
      role: user.role as Role,
      fullName: user.fullName,
      email: user.email,
    }
    next()
  } catch (err) {
    // Our own AppErrors pass through; anything else (bad/expired JWT) -> 401.
    if (err instanceof AppError) return next(err)
    next(unauthorized('Invalid or expired session'))
  }
}

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized())
    if (!roles.includes(req.user.role)) {
      return next(forbidden('You do not have permission to do this'))
    }
    next()
  }
