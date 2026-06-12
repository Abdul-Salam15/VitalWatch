# VitalWatch

VitalWatch is a personal health-monitoring web app built with **Next.js (App Router)**, **Prisma**, and **PostgreSQL**. It lets a user log daily vitals (heart rate, SpO2, body temperature, steps), get an AI-style analysis of each entry, manage medication reminders with escalation alerts, and share a read-only live view with a caregiver — all with email notifications for reminders, anomalies, and missed doses.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
  - [High-level overview](#high-level-overview)
  - [Directory structure](#directory-structure)
  - [Data model](#data-model)
  - [Authentication](#authentication)
  - [Vitals logging & AI analysis](#vitals-logging--ai-analysis)
  - [Medication reminders & alarms](#medication-reminders--alarms)
  - [Caregiver sharing](#caregiver-sharing)
  - [Email notifications](#email-notifications)
  - [Scheduled jobs (cron)](#scheduled-jobs-cron)
  - [Reports (PDF export)](#reports-pdf-export)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment variables](#environment-variables)
  - [Local development](#local-development)
  - [Database migrations](#database-migrations)
- [Available scripts](#available-scripts)
- [Deployment](#deployment)
  - [Render](#render)
  - [Scheduled workflows (GitHub Actions)](#scheduled-workflows-github-actions)
  - [Optional: external cron pinger](#optional-external-cron-pinger)

---

## Features

- **Vitals logging** — log heart rate, SpO2, body temperature, and steps; each entry gets an instant AI-style summary, anomaly flag, and recommendations.
- **Dashboard** — at-a-glance stat cards (with day-over-day trend comparisons), health trend charts, adherence tracking, and an AI summary of your latest reading.
- **Medication reminders** — create recurring reminders (daily, weekdays, weekends, or custom days) with a configurable escalation window. The app tracks weekly adherence and dose check-ins.
- **In-app alarms** — a polling alarm manager rings (with sound + optional browser notification) when a dose is late, and lets you mark it taken, snooze, or dismiss.
- **Escalation emails** — if a dose stays unconfirmed past its escalation window, the patient gets a reminder email and the designated caregiver gets an alert email — sent at most once per dose per day.
- **Anomaly alerts** — out-of-range vitals automatically email the caregiver (if enabled).
- **Caregiver view** — a read-only dashboard (`/caregiver`) for the signed-in user, plus a tokenized public link (`/caregiver/[token]`) a caregiver can open without an account.
- **Daily summary emails** — an optional daily digest of vitals and adherence.
- **PDF patient reports** — export a date-ranged report of vitals, adherence, and alerts.
- **Notifications center** — an in-app bell with unread badges and "mark as read" state.
- **Settings** — profile, notification toggles, caregiver contact info, timezone, and account/danger-zone actions.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | [Prisma](https://www.prisma.io/) |
| Auth | [Auth.js (NextAuth v5)](https://authjs.dev/) with the Credentials provider + Prisma adapter |
| Email | [Brevo](https://www.brevo.com/) transactional email API, templated with `@react-email/components` |
| PDF | `@react-pdf/renderer` |
| Icons | `lucide-react` |
| Scheduling | GitHub Actions scheduled workflows calling authenticated cron API routes |
| Hosting | Render (free-tier web service + free-tier Postgres) |

---

## Architecture

### High-level overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                              Browser                                  │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────────────┐   │
│  │ Dashboard /  │  │ Alarm Manager │  │ Notifications Bell          │   │
│  │ Log Health / │  │ (client poll, │  │ (localStorage read-state,   │   │
│  │ Reminders /  │  │  5s tick,     │  │  click-outside to close)    │   │
│  │ Caregiver /  │  │  Web Audio,   │  └────────────────────────────┘   │
│  │ Settings     │  │  Notification │                                    │
│  │ (RSC pages)  │  │  API)         │                                    │
│  └──────┬───────┘  └──────┬────────┘                                    │
└─────────┼─────────────────┼──────────────────────────────────────────┘
          │ Server Actions   │ fetch('/api/reminders/check')
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js App Router (server)                      │
│  ┌─────────────────┐   ┌──────────────────────┐   ┌────────────────┐ │
│  │ src/lib/actions/ │   │ src/app/api/...       │   │ src/lib/data.ts │ │
│  │  - auth.ts       │   │  - auth/[...nextauth] │   │ (cached reads,  │ │
│  │  - vitals.ts     │   │  - reminders/check    │   │  per-request    │ │
│  │  - reminders.ts  │   │  - cron/check-reminders│   │  memoization)  │ │
│  │  - settings.ts   │   │  - cron/daily-summary  │   └────────────────┘ │
│  │  - report.tsx    │   └──────────────────────┘                       │
│  └────────┬─────────┘                                                  │
│           │                                                            │
│  ┌────────▼─────────┐   ┌───────────────────┐   ┌───────────────────┐ │
│  │ src/lib/medication│   │ src/lib/ai.ts      │   │ src/lib/email/    │ │
│  │ .ts (dose state,  │   │ (rule-based vitals │   │ send.ts + brevo.ts │ │
│  │  adherence, alerts)│  │  analysis)         │   │ (Brevo API + React │ │
│  └────────┬─────────┘   └────────────────────┘   │  Email templates)  │ │
│           │                                        └─────────┬─────────┘ │
│  ┌────────▼─────────────────────────────────────────────────▼─────────┐ │
│  │                          Prisma Client (src/lib/db.ts)              │ │
│  └────────┬─────────────────────────────────────────────────┬─────────┘ │
└───────────┼─────────────────────────────────────────────────┼───────────┘
            ▼                                                   ▼
    ┌──────────────────┐                              ┌─────────────────┐
    │ PostgreSQL        │                              │ Brevo (SMTP/API) │
    │ (User, VitalLog,  │                              │ → patient /      │
    │  Reminder,        │                              │   caregiver inbox│
    │  DoseRecord)      │                              └─────────────────┘
    └──────────────────┘

External schedulers (GitHub Actions, optional cron-job.org / UptimeRobot)
        │
        ▼
GET /api/cron/check-reminders   (every ~5 min, Bearer CRON_SECRET)
GET /api/cron/daily-summary     (daily at 07:00 UTC, Bearer CRON_SECRET)
```

**Key architectural choices:**

- **Server Components for data fetching.** Pages under `src/app/(main)/*` are server components that call cached helpers in `src/lib/data.ts` (wrapped in React's `cache()` for per-request memoization) and pass plain data down to client components for interactivity.
- **Server Actions for writes.** All mutations (`addVitalLog`, `createReminder`, `checkInDose`, settings updates, etc.) live in `src/lib/actions/*.ts` as `'use server'` functions, called directly from forms/components and followed by `revalidatePath(...)` to refresh affected routes.
- **Shared domain logic.** `src/lib/medication.ts` is the single source of truth for dose status (`upcoming` / `late` / `escalated` / `taken`), weekly adherence, anomaly detection, and notification feed construction — used by the dashboard, reminders page, caregiver view, emails, and PDF report alike.
- **Idempotent reminder-email logic.** `src/lib/reminders/check.ts` (`checkUserReminders`) is shared by the scheduled cron route, an authenticated client-triggered fallback route, and the alarm manager — it only sends each reminder/escalation email once per dose per day, tracked via `DoseRecord.reminderEmailSentAt` / `escalationEmailSentAt`.
- **Timezone-aware scheduling.** Reminder "due" times and day boundaries are evaluated in the *user's* IANA timezone (`User.timezone`, auto-detected client-side) via helpers in `src/lib/dates.ts` (`zonedDate`, `tzOffsetMinutes`, `dateKey`, `startOfDay`, etc.), not the server's local time.

### Directory structure

```
src/
├── app/
│   ├── (auth)/                # Public auth pages: login, register, forgot/reset password
│   ├── (main)/                # Authenticated app shell (sidebar/bottom tabs)
│   │   ├── dashboard/         # Stat cards, trends, AI summary, adherence
│   │   ├── log-health/        # Vitals log form + recent logs
│   │   ├── reminders/         # Medication reminders + weekly adherence table
│   │   ├── caregiver/         # Read-only caregiver preview (for the signed-in user)
│   │   └── settings/          # Profile, notifications, caregiver, danger zone
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Auth.js route handler
│   │   ├── reminders/check/       # Client-triggered reminder/escalation email check
│   │   └── cron/
│   │       ├── check-reminders/   # Scheduled reminder/escalation email sweep
│   │       └── daily-summary/     # Scheduled daily digest email
│   ├── caregiver/[token]/     # Public, tokenized read-only caregiver view (no login)
│   └── layout.tsx, page.tsx   # Root layout & landing/redirect
├── components/
│   ├── auth/                  # Auth shell, password input
│   ├── caregiver/              # Caregiver preview, access card, med cards
│   ├── charts/                 # Line chart primitives
│   ├── dashboard/               # Stat grid, health trends, AI summary, adherence
│   ├── emails/                  # React Email templates (reminders, alerts, summaries, invites)
│   ├── layout/                  # Shell, header, sidebar, bottom tabs, notifications bell
│   ├── log-health/               # Log form, recent logs, AI result card
│   ├── medication/               # Alarm manager/modal, dose row, reminder banner
│   ├── reminders/                 # Reminder card/dialog, adherence table
│   ├── report/                    # Patient report (PDF source) + modal
│   ├── settings/                   # Settings sections
│   └── ui/                          # Design-system primitives (button, card, modal, field, etc.)
├── lib/
│   ├── actions/                 # Server Actions ('use server'): auth, vitals, reminders, settings, report
│   ├── email/                   # Brevo client + typed send* helpers
│   ├── pdf/                      # @react-pdf/renderer report document
│   ├── reminders/                 # Shared reminder-email evaluation (check.ts)
│   ├── ai.ts                       # Rule-based vitals analysis
│   ├── auth.ts                     # Auth.js config
│   ├── data.ts                     # Cached server-side data fetchers
│   ├── dates.ts                    # Timezone/date helpers
│   ├── db.ts                       # Prisma client singleton
│   ├── medication.ts                # Dose state, adherence, alerts, notifications
│   ├── vitals.ts                    # Vital range → status ("tone") helpers
│   └── utils.ts                     # Misc (cx, etc.)
prisma/
└── schema.prisma                  # Database schema (see below)
.github/workflows/                 # Scheduled cron triggers (GitHub Actions)
render.yaml                        # Render Blueprint (web service + Postgres)
```

### Data model

Defined in [`prisma/schema.prisma`](prisma/schema.prisma):

- **`User`** — account + profile. Stores credentials (hashed password), caregiver contact info (`caregiverName`, `caregiverEmail`), a unique `accessToken` for the public caregiver link, per-channel notification toggles (`notifBrowser`, `notifEmailSummary`, `notifCaregiverAnomaly`, `notifMedReminderEmail`, `notifCaregiverMissedDose`), and an IANA `timezone`.
- **`VitalLog`** — one row per logged reading: `hr`, `spo2`, `temp`, `steps`, a generated `summary`, and an `anomalyFlag`. Indexed on `(userId, ts)` for recent-logs queries.
- **`Reminder`** — a medication reminder: `name`, `dosage`, `time` ("HH:MM"), `frequency` (Daily/Weekdays/Weekends/Custom + `customDays`), `escalation` (minutes grace period before escalating), and `active`.
- **`DoseRecord`** — one row per `(reminderId, date)`, tracking `takenAt`, `reminderEmailSentAt`, and `escalationEmailSentAt`. The unique constraint on `(reminderId, date)` plus these timestamps make the email-sending logic idempotent — each email type fires at most once per dose per day.

### Authentication

- **Auth.js v5** (`src/lib/auth.ts`) with the **Credentials provider**: email/password, password hashed with `bcryptjs`, JWT session strategy, Prisma adapter for persistence.
- Auth pages (`src/app/(auth)/*`) handle login, registration, forgot-password (emails a reset link via Brevo), and reset-password.
- `src/lib/actions/auth.ts` contains the server actions for registration and password reset.
- Route grouping (`(main)` vs `(auth)`) gates authenticated pages — unauthenticated users are redirected to `/login`.

### Vitals logging & AI analysis

- The log form (`src/components/log-health/log-form.tsx`) submits to the `addVitalLog` server action (`src/lib/actions/vitals.ts`), validated with a Zod schema (`hr` 20–250, `spo2` 50–100, `temp` 30–45°C, `steps` 0–100,000).
- **Cumulative steps validation**: since `steps` represents a running daily total, a new entry can't report fewer steps than an earlier entry logged the same calendar day (in the user's timezone) — the action rejects it with a descriptive error.
- `src/lib/ai.ts` (`aiProvider.analyzeVitals`) is a small rule-based "AI" behind an `AIProvider` interface — it produces a human-readable `summary`, an `anomalyFlag` (any vital outside its healthy range per `src/lib/vitals.ts`), and `recommendations`. The interface is intentionally swappable for a real model later without touching call sites.
- If a log is flagged anomalous and the user has `notifCaregiverAnomaly` enabled with a caregiver email set, `sendCaregiverVitalAlertEmail` fires immediately.
- The shared `Input` component (`src/components/ui/field.tsx`) blurs number inputs on mouse-wheel scroll to avoid the browser's native "scroll changes a focused number input by its step" behavior corrupting logged values.

### Medication reminders & alarms

- Reminders are CRUD'd via `src/lib/actions/reminders.ts` and rendered on `/reminders` (`src/components/reminders/*`).
- `src/lib/medication.ts` computes, for each reminder and a given `now`:
  - **`doseState()`** — `upcoming` / `late` / `escalated` / `taken`, based on the scheduled time, current time, and the reminder's `escalation` grace period.
  - **`weekAdherenceStates()` / `weekAdherencePct()`** — a 7-day adherence grid per reminder and combined.
  - **`medicationAlerts()` / `caregiverAlerts()`** — feeds for the dashboard banner, notifications, and caregiver view.
- **`AlarmManager`** (`src/components/medication/alarm-manager.tsx`, client component):
  - Polls every **5 seconds** (`TICK_MS`), recomputing each active reminder's `doseState`.
  - When a dose becomes `late`, it shows the `AlarmModal` (audible beep via Web Audio API + optional browser `Notification`), letting the user **Mark taken**, **Snooze** (5 min), or **Dismiss** — state persisted in `localStorage` so alarms don't re-fire after a reload.
  - If any reminder needs a reminder/escalation email that hasn't been sent yet, it throttled-calls `POST /api/reminders/check` (every ≥30s) so emails go out promptly while the app is open, independent of the cron schedule.
  - On status transitions it calls `router.refresh()` to re-render server components with fresh data.

### Caregiver sharing

- **`/caregiver`** — for the signed-in user, a read-only preview (`CaregiverPreview`) of their own dashboard, stat grid, health trends, medications, and anomaly/adherence alerts — useful for previewing what a caregiver sees.
- **`/caregiver/[token]`** — a public route keyed by the user's `accessToken` (`getUserByAccessToken`), rendering the same read-only preview **without requiring login**. The token can be regenerated from Settings.
- Both pass `now = zonedDate(user.timezone)` so dose states and "vs. yesterday"-style stat comparisons are computed in the patient's local time.

### Email notifications

All email sending goes through `src/lib/email/send.ts` (typed wrappers) → `src/lib/email/brevo.ts` (Brevo transactional API client), with templates as React Email components in `src/components/emails/`:

| Email | Trigger | Template |
|---|---|---|
| Medication reminder | Dose `late`/`escalated`, not yet sent today | `medication-reminder.tsx` |
| Caregiver missed-dose alert | Dose `escalated`, not yet sent today | `caregiver-alert.tsx` |
| Caregiver vital anomaly alert | A logged vital is flagged anomalous | `caregiver-vital-alert.tsx` |
| Caregiver invite | User sets/updates caregiver email in Settings | `caregiver-invite.tsx` |
| Daily summary | Daily cron (07:00 UTC) | `daily-summary.tsx` |
| Caregiver report | PDF report shared with caregiver | `caregiver-report.tsx` |
| Password reset | Forgot-password flow | `password-reset.tsx` |

Each dose-related email is sent **at most once per dose per day**, gated by `DoseRecord.reminderEmailSentAt` / `escalationEmailSentAt` — both the cron job and the client-triggered check share this logic via `checkUserReminders()` in `src/lib/reminders/check.ts`.

### Scheduled jobs (cron)

Render's free tier has no native cron, so scheduled work is triggered by **GitHub Actions** (`.github/workflows/`) calling authenticated API routes:

- **`check-reminders.yml`** — every 5 minutes, `GET /api/cron/check-reminders` with `Authorization: Bearer $CRON_SECRET`. Iterates all users with active reminders and calls `checkUserReminders()` for each, sending due reminder/escalation emails.
- **`daily-summary.yml`** — daily at 07:00 UTC, `GET /api/cron/daily-summary`, sends each opted-in user a digest of their last day's vitals and adherence.

GitHub Actions schedules are best-effort and can be delayed by hours under load — see [Optional: external cron pinger](#optional-external-cron-pinger) for a way to guarantee delivery even when the app is closed.

### Reports (PDF export)

- `src/components/report/patient-report.tsx` renders a date-ranged report (vitals trends, adherence, alerts) shareable as a modal (`report-modal.tsx`).
- `src/lib/pdf/patient-report-pdf.tsx` renders the same data as a PDF via `@react-pdf/renderer`, generated through `src/lib/actions/report.tsx` and optionally emailed to the caregiver (`sendCaregiverReportEmail`).

---

## Getting started

### Prerequisites

- Node.js ≥ 18.18
- A PostgreSQL database (local Docker container, Render Postgres, etc.)
- (Optional) A [Brevo](https://www.brevo.com/) account + API key for real email sending — without it, email sends are skipped/no-ops in development.

### Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret used by Auth.js to sign session tokens |
| `BREVO_API_KEY` | Brevo transactional email API key (leave blank to disable real sends) |
| `EMAIL_FROM_NAME` | Display name for outgoing emails |
| `EMAIL_FROM_ADDRESS` | From-address for outgoing emails |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app (used in email links) |
| `CRON_SECRET` | Bearer token required by `/api/cron/*` routes (optional locally, required in production) |

### Local development

```bash
npm install
npx prisma migrate dev     # apply migrations to your local database
npm run dev                # start the dev server at http://localhost:3000
```

### Database migrations

The schema lives in `prisma/schema.prisma`. After changing it:

```bash
npx prisma migrate dev --name <description>   # create + apply a new migration locally
npx prisma generate                            # regenerate the Prisma client (also runs on install)
```

In production, migrations are applied automatically as part of the build (`npx prisma migrate deploy`, see `render.yaml`).

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (also runs `prisma migrate deploy` on Render) |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint (`next lint`) |

---

## Deployment

### Render

`render.yaml` defines a Render Blueprint with:

- A **free PostgreSQL database** (`vitalwatch-db`).
- A **free web service** (`vitalwatch`) running `npm install && npx prisma migrate deploy && npm run build` at build time and `npm run start` to serve.
- Environment variables wired from the database connection string, plus `AUTH_SECRET` and `CRON_SECRET` auto-generated by Render.

Notes on the free tier (documented in `render.yaml`):
- The free Postgres plan provides 1GB storage and expires 30 days after creation (with a 14-day grace period to upgrade before data is deleted).
- The free web service spins down after 15 minutes of inactivity and takes ~1 minute to spin back up on the next request.
- Render cron jobs require a paid plan, so scheduled checks are handled by GitHub Actions instead (below).

### Scheduled workflows (GitHub Actions)

The repo's `.github/workflows/check-reminders.yml` and `daily-summary.yml` call the deployed app's `/api/cron/*` endpoints on a schedule. They require two repository secrets:

- `APP_URL` — the deployed app's base URL (same as `NEXT_PUBLIC_APP_URL`)
- `CRON_SECRET` — must match the `CRON_SECRET` env var on the Render service

### Optional: external cron pinger

GitHub Actions schedules are best-effort and can be delayed by hours under load. For households that need guaranteed on-time medication/escalation emails even when the app is closed, point a free external HTTP monitor (e.g. [cron-job.org](https://cron-job.org) or an UptimeRobot heartbeat monitor) at:

```
GET https://<APP_URL>/api/cron/check-reminders
Authorization: Bearer <CRON_SECRET>
```

every 1–5 minutes. The endpoint is safe to call repeatedly — it only sends each reminder/escalation email once per dose per day (tracked via `DoseRecord.reminderEmailSentAt` / `escalationEmailSentAt`), so over-polling is harmless. `<APP_URL>` and `<CRON_SECRET>` are found under the Render service's "Environment" tab.
