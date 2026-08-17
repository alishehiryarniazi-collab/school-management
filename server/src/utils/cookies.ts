// Central place for the auth cookie name and its security options.
//
// httpOnly  -> JavaScript in the browser can't read it (protects against XSS token theft)
// secure    -> only sent over HTTPS (production only; localhost is http)
// sameSite  -> 'lax' in dev; in production behind separate domains you may need 'none'
import type { CookieOptions } from 'express'
import { isProd } from '../config/env.js'

export const AUTH_COOKIE = 'token'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: SEVEN_DAYS_MS,
  path: '/',
}

// Same options minus maxAge — used when clearing the cookie on logout.
export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
}
