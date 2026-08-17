// Tells TypeScript that our auth middleware may attach `user` to any request.
// This makes `req.user` typed and available in every route handler.
import type { AuthUser } from './auth.js'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export {}
