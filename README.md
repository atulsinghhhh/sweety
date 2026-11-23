# Sweety – Blood Glucose Tracker

A full-stack web app for people with diabetes to record up to four blood glucose readings a day and review daily, month-to-date and monthly reports.

Built for the Kenpath **Junior Full Stack Developer – JavaScript & AI** technical assignment. Requirements: [prd.md](prd.md).

![Dashboard](screenshots/02-dashboard.jpg)

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running the app](#running-the-app)
- [Demo credentials](#demo-credentials)
- [Tests](#tests)
- [API](#api)
- [Project structure](#project-structure)
- [Screenshots](#screenshots)
- [Design](#design)
- [Assumptions](#assumptions)
- [Known limitations and future improvements](#known-limitations-and-future-improvements)

## Features

**Authentication**
- Register (name, email, password) and log in; JWT bearer tokens.
- Passwords hashed with bcrypt and never returned by the API. Emails are case-insensitive and unique.
- `GET /api/auth/me` restores the session on reload. An expired or invalid token logs the user out automatically.

**Readings**
- Create, view, edit and delete readings with a date, one of four time slots and a value in mg/dL:
  `Morning (fasting)`, `After breakfast`, `After lunch`, `After dinner`.
- Rules enforced on **both** the client and the server, with the exact required messages:

  | Rule | Message |
  |---|---|
  | Value required | Please enter a glucose value. |
  | Whole number, 40–600 | Value must be between 40 and 600 mg/dl. (decimals: *Value must be a whole number.*) |
  | One reading per slot per day | You already have an After lunch reading for this date. |
  | Maximum four per day | You can add only 4 readings per day. |
  | No future dates | Date cannot be in the future. |

- Editing re-applies every rule, including moving a reading to another date or slot.
- Every query is scoped to the authenticated user. Another user's reading behaves exactly like a missing one (404).

**Reports** (calculated in PostgreSQL, never only in React)
- **Daily**: highest, lowest, average (one decimal), count, and each reading with its slot.
- **Month-to-date**: 1st of the selected month through the selected date.
- **Monthly**: the entire **previous** calendar month (January → December of the previous year; leap-year Februaries handled).
- Empty periods return `count: 0` with `null` statistics, shown in the UI as a friendly empty state.

**Frontend**
- Login, Register, Dashboard, Readings and Reports pages; responsive down to 390px.
- The selected date is kept in the URL (`?date=`) and carried across pages.
- Loading skeletons, empty states, error states with retry, and success/error toasts.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, JavaScript, Tailwind CSS v4, shadcn/ui (Radix), React Router 7, Axios |
| Backend | Node.js, Express 4, JavaScript, Prisma 6, PostgreSQL, bcrypt, jsonwebtoken, Zod 3 |
| Testing | Jest, Supertest |
| Package manager | npm |

## Prerequisites

- **Node.js 20+** (developed and tested on Node 26.3.1, npm 11.16)
- **PostgreSQL 13+** running locally (developed on PostgreSQL 15). `hashtextextended`, used for the daily-limit lock, needs PostgreSQL 11 or later.
- `psql` / `createdb` command-line tools, or any other way to create two databases

> **npm 11 note:** npm 11 blocks dependency install scripts by default. The two the server needs (`bcrypt` for its native binding, `@prisma/engines` for the query engine) are pre-approved in `server/package.json` under `allowScripts`, so `npm install` works without extra steps.

## Installation

### 1. Clone and install

```bash
git clone <repository-url> sweety
cd sweety

cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Create the PostgreSQL databases

Two databases are used: one for development and one that the test suite **wipes on every test**.

```bash
createdb sweety
createdb sweety_test
```

Or in `psql`:

```sql
CREATE DATABASE sweety;
CREATE DATABASE sweety_test;
```

If your PostgreSQL user has a password, include it in the connection strings below.

### 3. Configure environment variables

```bash
cd server
cp .env.example .env
cp .env.example .env.test
```

Edit **`server/.env`**: set `DATABASE_URL` to the `sweety` database and `JWT_SECRET` to a long random string (`openssl rand -hex 32`).

Edit **`server/.env.test`**: set `DATABASE_URL` to the **`sweety_test`** database, `NODE_ENV=test`, and `BCRYPT_SALT_ROUNDS=4` to keep tests fast.

The client works without a `.env` file and defaults to `http://localhost:4000/api`. To point it elsewhere: `cp client/.env.example client/.env`.

### 4. Run database migrations

```bash
cd server
npm run db:migrate          # applies migrations to the dev database (sweety)
npm run db:migrate:test     # applies migrations to the test database (sweety_test)
```

The migration creates the `users` and `readings` tables, the `ReadingSlot` enum, the unique `(user_id, reading_date, slot)` constraint, the `(user_id, reading_date)` index, `ON DELETE CASCADE` from users to readings, and a `CHECK (value BETWEEN 40 AND 600)` constraint.

### 5. Seed demo data

```bash
cd server
npm run db:seed
```

This creates the [demo user](#demo-credentials) with realistic readings covering the whole previous month and the current month up to today, so every report has data. It is **safe to run repeatedly**: the demo user is upserted (password reset to the documented value) and only that user's readings are replaced. Other users are never touched.

## Environment variables

All variables live in `server/.env` (and `server/.env.test`). A template with every variable is in [`.env.example`](.env.example).

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | yes | `postgresql://user:pass@localhost:5432/sweety?schema=public` | PostgreSQL connection string |
| `JWT_SECRET` | yes | output of `openssl rand -hex 32` | Signs and verifies JWTs (HS256) |
| `JWT_EXPIRES_IN` | no | `7d` | Token lifetime |
| `PORT` | no | `4000` | API port |
| `NODE_ENV` | no | `development` / `test` | `test` selects `.env.test` |
| `CLIENT_ORIGIN` | no | `http://localhost:5173` | Origin allowed by CORS |
| `APP_TIMEZONE` | no | `Asia/Kolkata` | Defines "today" for the no-future-dates rule and default report date |
| `BCRYPT_SALT_ROUNDS` | no | `12` (use `4` in `.env.test`) | bcrypt cost factor |
| `VITE_API_URL` | no (client) | `http://localhost:4000/api` | API base URL used by the React app (`client/.env`) |

The server refuses to start if `DATABASE_URL` or `JWT_SECRET` is missing. Real `.env` files are git-ignored; only the `.env.example` templates are committed.

## Running the app

Two terminals:

```bash
# Terminal 1 — API on http://localhost:4000
cd server
npm run dev        # nodemon; use `npm start` for plain node
```

```bash
# Terminal 2 — React app on http://localhost:5173
cd client
npm run dev
```

Open **http://localhost:5173** and log in with the demo account, or register a new one.

Production build of the client:

```bash
cd client
npm run build      # outputs client/dist
npm run preview    # serves the build locally
```

## Demo credentials

Created by `npm run db:seed`:

| Email | Password |
|---|---|
| `demo@sweety.app` | `Demo@1234` |

These are local demo values only. Do not reuse them anywhere real.

## Tests

The backend suite runs against the **`sweety_test`** database and deletes all of its data before each test.

```bash
cd server
npm run db:migrate:test   # once, or after adding migrations
npm test
```

Current result: **6 suites, 96 tests, all passing**.

| Suite | Covers |
|---|---|
| `auth.test.js` | Registration, bcrypt hashing, duplicate email (any case), input validation, login, wrong password, unknown email, `/me`, missing, malformed or invalid tokens, deleted user |
| `readings.test.js` | Creation, today allowed, `userId` in body ignored, missing/empty/out-of-range/non-numeric values, boundaries 40 and 600, decimals, duplicate slot, fifth reading, future and invalid dates, unknown slot, **8 concurrent requests → exactly 4 saved**, listing order and filters, get/update/delete, update re-validation, moving onto a full day, **cross-user get/update/delete → 404**, cascade delete, DB `CHECK` constraint |
| `reports.test.js` | Daily, month-to-date and monthly highest, lowest, average and count; correct ranges; leap day; January → December rollover; empty reports; one-decimal rounding; default date; invalid dates; auth required; other users' data excluded |
| `dates.test.js` | Calendar-date validation, timezone-aware "today", month-to-date and previous-month ranges |
| `security.test.js` | Expired, wrong-secret and `alg: none` tokens rejected; no password data in auth responses; report isolation; hex/exponent value strings rejected; non-object bodies; oversized bodies → 413; no framework details leaked |
| `health.test.js` | Health route, JSON 404, test-database wiring |

Frontend tests (React Testing Library) are an optional bonus and are not included. The frontend was verified manually in Chrome; see [Screenshots](#screenshots).

## API

All endpoints are under `/api`. Everything except register and login requires `Authorization: Bearer <token>`.
Errors always have the shape `{ "error": { "message": "...", "field": "..." } }`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` → `201 { user, token }` |
| POST | `/auth/login` | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | Current user |
| POST | `/readings` | `{ readingDate: "YYYY-MM-DD", slot, value }` → `201 { reading }` |
| GET | `/readings` | Own readings, newest first; optional `?date=`, `?from=&to=`, `?limit=` (1–100) |
| GET | `/readings/:id` | One reading (404 if missing **or** owned by someone else) |
| PUT | `/readings/:id` | Replace `{ readingDate, slot, value }`; all rules re-checked |
| DELETE | `/readings/:id` | `204` |
| GET | `/reports/daily?date=` | Stats plus that day's readings |
| GET | `/reports/month-to-date?date=` | 1st of the month → selected date |
| GET | `/reports/monthly?date=` | Entire calendar month before the selected date |

Slots: `MORNING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, `AFTER_DINNER`. The report `date` defaults to today in `APP_TIMEZONE`.

Status codes: `400` invalid input, `401` missing/invalid token, `404` not found or not yours, `409` duplicate slot or daily limit, `413` body too large.

Example report response:

```json
{
  "report": {
    "type": "monthly",
    "date": "2026-11-23",
    "month": "2026-10",
    "range": { "from": "2026-10-01", "to": "2026-10-31" },
    "stats": { "count": 89, "highest": 280, "lowest": 89, "average": 143.1 }
  }
}
```

## Project structure

```
sweety/
├── client/                     React frontend (Vite)
│   └── src/
│       ├── components/         Layout, route guards, forms, dialogs, stat grid
│       │   └── ui/             shadcn/ui components
│       ├── context/            AuthContext (session state)
│       ├── hooks/              useAuth, useAsync, useDateParam
│       ├── lib/                API client, date helpers, validation rules
│       └── pages/              Login, Register, Dashboard, Readings, Reports
├── server/                     Express backend
│   ├── prisma/                 schema.prisma, migrations, seed.js
│   ├── src/
│   │   ├── config/             env loading, Prisma client
│   │   ├── routes/             URL → middleware → controller
│   │   ├── controllers/        HTTP in/out only
│   │   ├── services/           Business logic (auth, readings, reports)
│   │   ├── middleware/         requireAuth, validate, error handler
│   │   ├── validators/         Zod schemas
│   │   └── utils/              Date helpers, reading rules, AppError
│   └── tests/                  Jest + Supertest
├── screenshots/
├── prd.md                      Assignment requirements
├── design.md                   Visual style reference
├── DESIGN_DECISIONS.md         How the design was applied, and why it is light-only
└── .env.example
```

### Key implementation decisions

- **Concurrency-safe daily rules.** Create and update run in a transaction that first takes a PostgreSQL advisory lock keyed on `(user, date)`, then checks the four-per-day and one-per-slot rules. Concurrent requests for the same day are serialised, so the right message is always returned. The unique constraint is a final backstop (Prisma `P2002` maps to the duplicate-slot message). A test fires 8 simultaneous requests and asserts exactly 4 are stored.
- **Dates are calendar dates.** Stored as PostgreSQL `DATE`, always parsed and formatted as UTC `YYYY-MM-DD`, so no timezone conversion can shift a reading to another day.
- **Ownership comes only from the JWT.** `userId` is never read from the request; Zod strips unknown fields. Every query filters on the authenticated user's ID.
- **Timing-safe login.** An unknown email is still compared against a dummy bcrypt hash, so response time does not reveal whether an account exists.
- **Layered backend.** Routes, controllers, services, validators and middleware are separate; route handlers contain no business logic.

## Screenshots

| | |
|---|---|
| **Login**<br>![Login](screenshots/01-login.jpg) | **Dashboard**<br>![Dashboard](screenshots/02-dashboard.jpg) |
| **Reading management**<br>![Readings](screenshots/03-readings.jpg) | **Validation**<br>![Validation](screenshots/04-validation.jpg) |
| **Daily report**<br>![Daily report](screenshots/05-reports-daily.jpg) | **Month-to-date and previous month**<br>![Monthly reports](screenshots/06-reports-monthly.jpg) |

## Design

The interface follows the light, industrial style reference in [design.md](design.md): a `#f6f8f7` canvas, black ink, `#0f0e12` carbon bands, hairline rules, square corners, no shadows or gradients, and thin Inter type.

**This differs from the PRD**, which asked for a dark primary theme. The project owner supplied the light style reference during development and asked for it to be used. Some accessibility adjustments were made (darker muted text, heavier body weight), and the app is deliberately light-only. The full reasoning is in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).

## Assumptions

- **"Today" uses one configured timezone** (`APP_TIMEZONE`, default `Asia/Kolkata`) for the no-future-dates rule. The client restricts the date picker using the browser's local date; if those disagree near midnight, the server's answer wins and its message is shown on the form.
- **"Monthly report" means the calendar month before the selected date**, not before today, so past months can be reviewed by changing the date. With today's date it is the previous calendar month, as the PRD requires.
- **Report dates may not be in the future** in the UI; the API accepts any valid date for reports.
- **Duplicate-slot vs. daily-limit message.** When a day already has four readings, any new reading would also duplicate a slot. In that case the daily-limit message is shown, since it explains the real problem.
- **Numeric strings are accepted** by the API for `value` (`"120"` → 120) because HTML form fields produce strings; hex, exponent and other non-decimal forms are rejected.
- **`PUT` replaces the whole reading**, so all three fields are required.
- **Error status codes:** a duplicate slot and the daily limit return `409 Conflict`; malformed input returns `400`.
- **Readings are for personal tracking only**; the app gives no medical interpretation of values.

## Known limitations and future improvements

- **No rate limiting** on login/register. Add `express-rate-limit` or a gateway rule before any public deployment.
- **JWT stored in `localStorage`.** Simple, with no CSRF exposure, but readable by any XSS. An httpOnly `SameSite` cookie with CSRF protection is the more robust option for production.
- **No token revocation or refresh.** Logout is client-side; tokens stay valid until they expire (7 days by default).
- **No security headers middleware** (e.g. `helmet`). The API is JSON-only and disables `X-Powered-By`, but headers such as HSTS belong in production.
- **No frontend automated tests** (optional bonus). The client was verified manually in Chrome.
- **Single-bundle frontend** (~500 kB minified); route-level code splitting would reduce first load.
- **Bonus features not implemented:** Docker Compose, full pagination UI, Recharts chart, React Testing Library tests, Redis caching, BullMQ reminders and the doctor role. `GET /api/readings` already supports `limit`, `from` and `to`, which a paginated view could build on.
- **Glucose targets.** Highlighting out-of-range values (e.g. below 70 or above 180 mg/dL) would be useful, but target ranges are personal and should be configurable per patient.
