// Entry point: starts the HTTP server and handles graceful shutdown.
import os from 'node:os'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

// Find this computer's LAN IPv4 addresses (so others on the same WiFi can connect).
function lanAddresses(): string[] {
  const nets = os.networkInterfaces()
  const addrs: string[] = []
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      if (net.family === 'IPv4' && !net.internal) addrs.push(net.address)
    }
  }
  return addrs
}

async function main() {
  // Fail fast if the database isn't reachable.
  await prisma.$connect()
  console.log('✅ Connected to the database')

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    console.log('\n========================================')
    console.log('  School Management System is running')
    console.log('========================================')
    console.log(`  On this computer:  http://localhost:${env.PORT}`)
    for (const ip of lanAddresses()) {
      console.log(`  On the same WiFi:  http://${ip}:${env.PORT}`)
    }
    console.log('========================================')
    console.log('  Keep this window open while in use.')
    console.log('  Close it (or run stop-app) to stop.\n')
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
