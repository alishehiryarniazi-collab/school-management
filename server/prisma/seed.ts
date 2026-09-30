// Seed script: creates the admin plus a small, realistic demo dataset so the
// app is immediately explorable after `npm run db:seed`.
//
// Safe to run multiple times: it upserts / checks existence before creating.
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/password.js'

const prisma = new PrismaClient()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@school.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'
const STUDENT_PW = process.env.DEFAULT_STUDENT_PASSWORD ?? 'school123'

const SUBJECTS = [
  'English',
  'Urdu',
  'Mathematics',
  'Science',
  'Islamiyat',
  'Pakistan Studies',
  'Computer Science',
]

// Midnight-UTC of today, matching how the app stores attendance dates.
function today() {
  return new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`)
}

async function upsertUser(
  email: string,
  fullName: string,
  role: string,
  password: string,
  phone?: string
) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing
  return prisma.user.create({
    data: {
      email,
      fullName,
      role,
      phone,
      passwordHash: await hashPassword(password),
    },
  })
}

// Create a student (User + profile) only if that section+roll is free.
async function ensureStudent(
  sectionId: number,
  rollNo: number,
  fullName: string,
  gender: string,
  guardianName: string
) {
  const existing = await prisma.student.findUnique({
    where: { sectionId_rollNo: { sectionId, rollNo } },
  })
  if (existing) return existing
  const user = await prisma.user.create({
    data: {
      fullName,
      email: `student.${sectionId}.${rollNo}@school.local`,
      role: 'student',
      passwordHash: await hashPassword(STUDENT_PW),
      student: { create: { rollNo, sectionId, gender, guardianName } },
    },
    include: { student: true },
  })
  return user.student!
}

async function main() {
  // 1) Admin + subjects
  await upsertUser(ADMIN_EMAIL, 'School Admin', 'admin', ADMIN_PASSWORD)
  console.log(`✅ Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)

  for (const name of SUBJECTS) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  const subjects = await prisma.subject.findMany()
  const subj = (n: string) => subjects.find((s) => s.name === n)!
  console.log(`✅ Subjects: ${subjects.length}`)

  // 2) Teacher
  const ahmed = await upsertUser(
    'ahmed@school.com',
    'Sir Ahmed',
    'teacher',
    'teacher123',
    '0300-1112222'
  )
  console.log('✅ Teacher: ahmed@school.com / teacher123')

  // 3) Classes + sections
  const class5 = await prisma.class.upsert({
    where: { name: 'Class 5' },
    update: {},
    create: { name: 'Class 5' },
  })
  const class6 = await prisma.class.upsert({
    where: { name: 'Class 6' },
    update: {},
    create: { name: 'Class 6' },
  })

  const sec5A = await prisma.section.upsert({
    where: { classId_name: { classId: class5.id, name: 'A' } },
    update: { classTeacherId: ahmed.id },
    create: { name: 'A', classId: class5.id, classTeacherId: ahmed.id },
  })
  const sec5B = await prisma.section.upsert({
    where: { classId_name: { classId: class5.id, name: 'B' } },
    update: {},
    create: { name: 'B', classId: class5.id },
  })
  await prisma.section.upsert({
    where: { classId_name: { classId: class6.id, name: 'A' } },
    update: {},
    create: { name: 'A', classId: class6.id },
  })
  console.log('✅ Classes 5 & 6 with sections')

  // 4) Students
  const s1 = await ensureStudent(sec5A.id, 1, 'Ali Raza', 'male', 'Raza Khan')
  const s2 = await ensureStudent(
    sec5A.id,
    2,
    'Sara Khan',
    'female',
    'Bilal Khan'
  )
  const s3 = await ensureStudent(
    sec5A.id,
    3,
    'Hamza Sheikh',
    'male',
    'Sheikh Sb'
  )
  await ensureStudent(sec5B.id, 1, 'Ayesha Malik', 'female', 'Malik Sb')
  await ensureStudent(sec5B.id, 2, 'Usman Tariq', 'male', 'Tariq Sb')
  console.log('✅ Students (3 in 5-A, 2 in 5-B)')

  // 5) Teaching assignment: Ahmed teaches Math in 5-A
  await prisma.teachingAssignment.upsert({
    where: {
      teacherId_sectionId_subjectId: {
        teacherId: ahmed.id,
        sectionId: sec5A.id,
        subjectId: subj('Mathematics').id,
      },
    },
    update: {},
    create: {
      teacherId: ahmed.id,
      sectionId: sec5A.id,
      subjectId: subj('Mathematics').id,
    },
  })

  // 6) Attendance for 5-A today
  const roster = [
    { s: s1, status: 'present' },
    { s: s2, status: 'present' },
    { s: s3, status: 'absent' },
  ]
  for (const r of roster) {
    await prisma.attendance.upsert({
      where: { studentId_date: { studentId: r.s.id, date: today() } },
      update: { status: r.status, markedById: ahmed.id },
      create: {
        studentId: r.s.id,
        date: today(),
        status: r.status,
        markedById: ahmed.id,
      },
    })
  }

  // 7) Marks: Midterm exam across several subjects for 5-A (for full result cards)
  const examSubjects = ['English', 'Urdu', 'Mathematics', 'Science']
  const studentMarks: Record<number, number[]> = {
    [s1.id]: [72, 80, 78, 68], // Ali
    [s2.id]: [88, 90, 85, 82], // Sara
    [s3.id]: [60, 66, 64, 58], // Hamza
  }
  for (const stu of [s1, s2, s3]) {
    const marks = studentMarks[stu.id] ?? []
    for (const [i, subName] of examSubjects.entries()) {
      const value = marks[i] ?? 0
      await prisma.mark.upsert({
        where: {
          studentId_subjectId_examName: {
            studentId: stu.id,
            subjectId: subj(subName).id,
            examName: 'Midterm',
          },
        },
        update: { marksObtained: value, totalMarks: 100 },
        create: {
          studentId: stu.id,
          subjectId: subj(subName).id,
          examName: 'Midterm',
          marksObtained: value,
          totalMarks: 100,
        },
      })
    }
  }

  // 8) Syllabus, date sheet, timetable, notice
  await prisma.syllabus.upsert({
    where: {
      classId_subjectId: {
        classId: class5.id,
        subjectId: subj('Mathematics').id,
      },
    },
    update: {},
    create: {
      classId: class5.id,
      subjectId: subj('Mathematics').id,
      title: 'Term 1 — Algebra Basics',
      details:
        'Chapters 1–4: integers, fractions, simple equations, geometry intro.',
    },
  })

  const dsCount = await prisma.datesheet.count({
    where: { classId: class5.id },
  })
  if (dsCount === 0) {
    await prisma.datesheet.createMany({
      data: [
        {
          classId: class5.id,
          examName: 'Midterm',
          subjectId: subj('Mathematics').id,
          examDate: new Date('2026-09-01T00:00:00.000Z'),
          startTime: '09:00',
          endTime: '11:00',
        },
        {
          classId: class5.id,
          examName: 'Midterm',
          subjectId: subj('English').id,
          examDate: new Date('2026-09-03T00:00:00.000Z'),
          startTime: '09:00',
          endTime: '11:00',
        },
      ],
    })
  }

  const ttSlots = [
    { day: 'Monday', p: 1, sub: 'Mathematics', st: '08:00', et: '08:45' },
    { day: 'Monday', p: 2, sub: 'English', st: '08:45', et: '09:30' },
    { day: 'Tuesday', p: 1, sub: 'Science', st: '08:00', et: '08:45' },
  ]
  for (const t of ttSlots) {
    await prisma.timetable.upsert({
      where: {
        sectionId_dayOfWeek_periodNo: {
          sectionId: sec5A.id,
          dayOfWeek: t.day,
          periodNo: t.p,
        },
      },
      update: {},
      create: {
        sectionId: sec5A.id,
        dayOfWeek: t.day,
        periodNo: t.p,
        subjectId: subj(t.sub).id,
        teacherId: ahmed.id,
        startTime: t.st,
        endTime: t.et,
      },
    })
  }

  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  const noticeCount = await prisma.notice.count()
  if (noticeCount === 0) {
    await prisma.notice.create({
      data: {
        title: 'Welcome to the new term',
        body: 'Classes resume Monday. Please check your timetable and syllabus.',
        audience: 'all',
        postedById: admin!.id,
      },
    })
  }

  console.log(
    '✅ Demo attendance, marks, syllabus, date sheet, timetable, notice'
  )

  // --- Books for Class 5 ---
  if ((await prisma.book.count({ where: { classId: class5.id } })) === 0) {
    await prisma.book.createMany({
      data: [
        { classId: class5.id, title: 'English Reader 5', subject: 'English' },
        { classId: class5.id, title: 'Urdu Qaida 5', subject: 'Urdu' },
        { classId: class5.id, title: 'Mathematics 5', subject: 'Mathematics' },
        { classId: class5.id, title: 'General Science 5', subject: 'Science' },
        { classId: class5.id, title: 'Islamiyat 5', subject: 'Islamiyat' },
      ],
    })
    console.log('✅ Books for Class 5')
  }

  // --- Fees & school branding ---
  const existingProfile = await prisma.schoolProfile.findFirst()
  if (!existingProfile) {
    await prisma.schoolProfile.create({
      data: {
        name: 'Bright Future School',
        tagline: 'Knowledge • Character • Success',
        address: 'Jaranwala Road, Faisalabad',
        phone: '041-1234567',
        email: 'info@brightfuture.edu.pk',
        logoUrl: '/school-logo.svg',
      },
    })
  }

  const feeHeadDefs = [
    { name: 'Admission Fee', isRecurring: false },
    { name: 'Monthly Fee', isRecurring: true },
    { name: 'Exam Fee', isRecurring: false },
  ]
  for (const h of feeHeadDefs) {
    await prisma.feeHead.upsert({
      where: { name: h.name },
      update: {},
      create: h,
    })
  }
  const heads = await prisma.feeHead.findMany()
  const head = (n: string) => heads.find((h) => h.name === n)!

  const amounts: Record<string, number> = {
    'Monthly Fee': 3000,
    'Admission Fee': 5000,
    'Exam Fee': 2000,
  }
  for (const cls of [class5, class6]) {
    for (const [name, amount] of Object.entries(amounts)) {
      await prisma.classFee.upsert({
        where: {
          classId_feeHeadId: { classId: cls.id, feeHeadId: head(name).id },
        },
        update: { amount },
        create: { classId: cls.id, feeHeadId: head(name).id, amount },
      })
    }
  }

  // Demo monthly challans for 5-A: one paid, one partial, one unpaid.
  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthTitle = now.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const monthly = head('Monthly Fee')
  const demo = [
    { s: s1, paid: 1000, status: 'partial' },
    { s: s2, paid: 3000, status: 'paid' },
    { s: s3, paid: 0, status: 'unpaid' },
  ]
  for (const d of demo) {
    const exists = await prisma.feeChallan.findUnique({
      where: { studentId_period: { studentId: d.s.id, period } },
    })
    if (exists) continue
    await prisma.feeChallan.create({
      data: {
        studentId: d.s.id,
        period,
        title: monthTitle,
        total: 3000,
        paidAmount: d.paid,
        status: d.status,
        paidDate: d.paid > 0 ? new Date() : null,
        receiptNo: d.paid > 0 ? `RCP-${String(d.s.id).padStart(5, '0')}` : null,
        items: {
          create: [
            { feeHeadId: monthly.id, label: 'Monthly Fee', amount: 3000 },
          ],
        },
      },
    })
  }
  console.log('✅ Fees: school profile, fee heads, class fees, demo challans')

  console.log('\n🌱 Seeding complete.')
  console.log(
    '   Student demo login → Class 5 / Section A / Roll 2 / school123'
  )
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
