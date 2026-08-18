# PROJECT_NOTES — School Management System

_Living document. Update as the project evolves so any new session has instant context._

Last updated: 2026-08-17

---

## 1. Purpose
A web app for **one school** to manage students, teachers, classes, attendance, marks,
and academic info. Built as a real, useful product (and a strong portfolio piece).

## 2. Users & roles
Three roles, all log in:

- **Admin** — full control. Creates teacher accounts, creates student accounts, creates
  classes / sections / subjects, and assigns students to their class + section.
- **Teacher** — can also create student accounts. Does the daily work: marks attendance,
  enters marks, manages syllabus, date sheet, timetable, and posts notices.
- **Student** — **read-only**. Sees only their own class portal: their attendance, their
  marks, and the class syllabus, date sheet, and timetable. Cannot change anything and
  cannot see other classes.

### Login method
- **Admin & Teacher:** email + password.
- **Student:** **Class + Section + Roll number + password** (roll numbers repeat across
  classes, so they are only unique _within a section_ — the class+section pick disambiguates).
- **Default student password:** roll number (student prompted to change on first login). _[TBD: confirm]_

## 3. Tech stack
| Layer     | Choice |
|-----------|--------|
| Frontend  | React + Vite + **TypeScript** + Tailwind CSS v4 |
| Backend   | Node + Express + **TypeScript** |
| Database  | **SQLite** (file on disk) via **Prisma ORM** — free, zero-setup, persistent. Swappable to Postgres for deploy. |
| Auth      | JWT in **httpOnly cookies** + **bcryptjs** password hashing + role-based middleware |
| Theme     | Calm Professional Admin (clean, light, readable; student portal mobile-first) |
| Tooling   | Git + GitHub, ESLint + Prettier, `.env` for secrets |
| Hosting   | Free tier (e.g. Vercel + free Postgres) — normal online website |

## 4. Data model (v1) — 12 tables
**People & structure**
- `users` — login for all roles: `full_name, email, password_hash, role, phone, is_active`
- `students` — academic profile: `user_id→users, roll_no, gender, dob, guardian_name, guardian_phone, address, section_id, admission_date`
- `classes` — e.g. "Class 5"
- `sections` — belong to a class (5-A, 5-B); optional `class_teacher_id→users`
- `subjects`
- `teaching_assignments` — teacher ↔ section ↔ subject

**Teacher-managed content the student views**
- `attendance` — per student per day: `status, date, marked_by`; unique(student, date)
- `marks` — `student_id, subject_id, exam_name, marks_obtained, total_marks`
- `syllabus` — `class_id, subject_id, title, details`
- `datesheet` — exam schedule: `class_id, exam_name, subject_id, exam_date, start_time, end_time`
- `timetable` — weekly schedule: `section_id, day_of_week, period_no, subject_id, teacher_id, start_time`
- `notices` — announcements: `title, body, audience, posted_by`

Scale target: up to ~10 classes and ~30 sections, hundreds of students. Classes/sections
are DB rows (not hardcoded), so this scales freely. Student lists get search + filter + pagination.

## 5. Roadmap
**v1 (building now)**
1. Scaffold + tooling + Git ✅ DONE
2. Database (Prisma + SQLite) + seed first admin ✅ DONE (12 tables, admin + subjects seeded)
3. Auth (3 roles, httpOnly cookies, bcrypt, role guards) ✅ DONE
   - Staff login (email/pw), student login (sectionId+rollNo+pw), /me, logout
   - requireAuth + requireRole middleware; public school-structure for login dropdowns
4. Admin: teachers, students, classes/sections/subjects + assign students ✅ DONE
   - classes/sections/subjects CRUD (admin), teachers CRUD (admin, deactivate not delete)
   - students CRUD (admin+teacher), pagination+search+filter, assign-to-section,
     reset password, auto synthetic login email, roll unique per section
   - teaching assignments (teacher↔section↔subject), all with validation + safe deletes
   - Verified end-to-end incl. student login with default password
   * FRONTEND (admin UI) ✅ DONE — React Router app, auth context, calm admin
     theme + UI kit, login (staff+student), dashboard (live stats), and full
     CRUD pages for Subjects, Teachers, Classes/Sections, Students (search,
     filters, pagination, assign/move). Verified in-browser incl. create flow.
5. Attendance + Notices ✅ DONE (backend + UI)
   - Attendance: per-section roster by date, bulk mark (present/absent/late/leave),
     dates normalized to midnight UTC, one row per student per day
   - Notices: CRUD with audience (all/teachers/students); edit/delete by admin or poster
   - UI: Attendance page (roster + status picker + save), Notices page (cards + form)
6. Marks + Syllabus + Date sheet + Timetable — BACKEND ✅ DONE, UI ⬅️ NEXT
   - Marks (per section+subject+exam), Syllabus (per class+subject),
     Datesheet (per class), Timetable (per section) — all full CRUD + validation
7. Student portal (read-only) — BACKEND ✅ DONE (/api/portal/*), UI ⬅️ NEXT
   - profile, attendance summary+%, marks, syllabus, datesheet, timetable, notices
8. Polish (validation, edge cases, responsive), README, deploy

** BACKEND IS FEATURE-COMPLETE for v1. Remaining: content UIs + student portal UI, then polish/deploy. **

**Phase 2 (later)**
- Bulk-add students by Excel/CSV (with template download + preview + row validation)
- Promote students to next class at year-end
- Grades → printable report cards
- Parent logins
- Fees / accounting

**Phase 3**
- Library, transport, hostel, messaging

## 6. Folder structure
```
school-management/
├─ client/                 # React + Vite + TS + Tailwind
│  └─ src/{components,pages,layouts,hooks,services,context,types,utils,styles}
├─ server/                 # Node + Express + TS + Prisma
│  ├─ src/{routes,controllers,services,middleware,config,utils,types}
│  │  └─ server.ts
│  └─ prisma/              # schema.prisma, migrations, seed.ts
├─ README.md
├─ PROJECT_NOTES.md
└─ .gitignore
```

## 7. Key decisions log
- **SQLite over Postgres** for now — simplest free persistent option; Prisma makes the
  swap to Postgres later a one-line change.
- **TypeScript from the start** — many related entities; TS catches shape bugs early.
- **Students are users** (role=student) with a linked `students` profile row — keeps auth
  in one place while separating academic fields.
- **Calm professional admin theme** — data-heavy screens read better than a dark neon UI.
- **Normal online website** (not offline/local-network).

## 8. Definition of Done (per feature)
Responsive (mobile/tablet/desktop) · no console errors · inputs validated & edge cases
handled (empty/null/loading/failed) · clean structure + small components + comments ·
no hardcoded secrets (use `.env`).

## 9. Open TODOs
- [ ] Confirm default student password rule (currently `school123` via env `DEFAULT_STUDENT_PASSWORD`).
- [ ] Decide free hosting target when we reach deploy.
- [ ] Attendance: normalize `date` to midnight (UTC) when marking, so the
      unique(studentId, date) works per-day regardless of time-of-day.
- [ ] For production cross-domain cookies, revisit sameSite='none' + secure=true.
