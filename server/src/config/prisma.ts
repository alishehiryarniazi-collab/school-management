// A single shared PrismaClient instance for the whole app.
//
// Why a singleton? Each PrismaClient opens a database connection pool.
// Creating many of them (e.g. one per request, or on every hot-reload in dev)
// exhausts connections. We create ONE and reuse it everywhere.
//
// The globalThis trick prevents tsx/nodemon hot-reload from spawning a new
// client on every file change during development.
import { PrismaClient } from '@prisma/client'
import { isProd } from './env.js'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['query', 'warn', 'error'],
  })

if (!isProd) globalForPrisma.prisma = prisma
