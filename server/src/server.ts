// Entry point: starts the HTTP server and handles graceful shutdown.
import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

async function main() {
  // Fail fast if the database isn't reachable.
  await prisma.$connect()
  console.log('✅ Connected to the database')

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.PORT}`)
    console.log(`   Health check: http://localhost:${env.PORT}/api/health`)
  })

  // Close DB connection cleanly on shutdown (Ctrl+C, deploy restarts).
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`)
    server.close()
    await prisma.$disconnect()
    process.exit(0)
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch(async (err) => {
  console.error('Failed to start server:', err)
  await prisma.$disconnect()
  process.exit(1)
})
