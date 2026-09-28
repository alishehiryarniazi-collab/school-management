// The school's branding (name, logo, contact) shown on challans, receipts,
// result cards, and the login screen. Stored as a single row.
import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma.js'

// Always returns the profile, creating a default one on first use.
export async function getSchoolProfile() {
  const existing = await prisma.schoolProfile.findFirst()
  if (existing) return existing
  return prisma.schoolProfile.create({ data: { name: 'My School' } })
}

export async function updateSchoolProfile(
  data: Prisma.SchoolProfileUpdateInput
) {
  const profile = await getSchoolProfile()
  return prisma.schoolProfile.update({ where: { id: profile.id }, data })
}
