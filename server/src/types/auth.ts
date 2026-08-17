// Shared auth types used across middleware, services, and controllers.

export type Role = 'admin' | 'teacher' | 'student'

// What we store inside the signed JWT (keep it small — it's sent every request).
export interface JwtPayload {
  userId: number
  role: Role
}

// The trimmed, safe user object we attach to req.user (never includes the hash).
export interface AuthUser {
  id: number
  role: Role
  fullName: string
  email: string
}
