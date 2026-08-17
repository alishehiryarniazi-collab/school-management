// Signs and verifies JWT auth tokens.
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { JwtPayload } from '../types/auth.js'

export function signToken(payload: JwtPayload): string {
  // expiresIn accepts strings like "7d"; cast to satisfy the library's types.
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, env.JWT_SECRET, options)
}

// Throws if the token is missing, tampered with, or expired.
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}
