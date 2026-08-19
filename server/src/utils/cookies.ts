// Central place for the auth cookie name and its security options.
//
// httpOnly  -> browser JavaScript can't read it (protects against XSS token theft)
// secure    -> only sent over HTTPS. MUST be false for local/LAN use over HTTP,
//              or the browser silently drops the cookie and login "does nothing".
// sameSite  -> 'lax' works when the app + API share one origin (our setup).
//              Only switch to 'none' (with secure=true) for cross-site HTTPS.
import type { CookieOptions } from 'express'
import { env } from '../config/env.js'

export const AUTH_COOKIE = 'token'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

const secure = env.COOKIE_SECURE
const sameSite: CookieOptions['sameSite'] = secure ? 'none' : 'lax'

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite,
  maxAge: SEVEN_DAYS_MS,
  path: '/',
}

// Same options minus maxAge — used when clearing the cookie on logout.
export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite,
  path: '/',
}
