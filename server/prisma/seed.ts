// Seed script: sets up the initial data the app needs to be usable.
//
// Run with:  npm run db:seed
//
// It is written to be SAFE to run multiple times (idempotent) — it uses
// upsert / existence checks so re-running won't create duplicates.
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()

// First admin credentials. Change the password after first login.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@school.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'

// A starter list of common subjects so the school isn't empty on day one.
const STARTER_SUBJECTS = [
  'English',
  'Urdu',
  'Mathematics',
  'Science',
  'Islamiyat',
  'Pakistan Studies',
  'Computer Science',
]

async function main() {
  // 1) First admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  })

  if (existingAdmin) {
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`)
  } else {
    await prisma.user.create({
      data: {
        fullName: 'School Admin',
        email: ADMIN_EMAIL,
        passwordHash: await hashPassword(ADMIN_PASSWORD),
        role: 'admin',
      },
    })
    console.log(`✅ Created admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  }

  // 2) Starter subjects (skip any that already exist)
  for (const name of STARTER_SUBJECTS) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log(`✅ Ensured ${STARTER_SUBJECTS.length} starter subjects exist`)

  console.log('\n🌱 Seeding complete.')
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
