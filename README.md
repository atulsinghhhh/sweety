# Sweety – Blood Glucose Tracker

Full-stack app for recording daily blood glucose readings and viewing daily, month-to-date and monthly reports.

> Work in progress — full setup, usage and testing documentation will be completed in Milestone 4.

## Stack

- **Client:** React 19, Vite, Tailwind CSS v4, shadcn/ui, React Router, Axios
- **Server:** Node.js, Express, Prisma 6, PostgreSQL, bcrypt, JWT, Zod
- **Tests:** Jest, Supertest

## Quick start (development)

```bash
# 1. Databases
createdb sweety && createdb sweety_test

# 2. Server
cd server
cp .env.example .env          # then edit DATABASE_URL / JWT_SECRET
cp .env.example .env.test     # point DATABASE_URL at sweety_test
npm install
npm run db:migrate            # apply migrations to the dev DB
npm run db:migrate:test       # apply migrations to the test DB
npm run dev                   # http://localhost:4000

# 3. Client (new terminal)
cd client
npm install
npm run dev                   # http://localhost:5173
```

Run backend tests with `cd server && npm test`.

## API

All endpoints are under `/api`. Everything except register/login requires `Authorization: Bearer <token>`.
Errors always have the shape `{ "error": { "message": "...", "field": "..." } }`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` → `{ user, token }` |
| POST | `/auth/login` | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | Current user |
| POST | `/readings` | `{ readingDate: "YYYY-MM-DD", slot, value }` |
| GET | `/readings` | Own readings; optional `?date=`, `?from=&to=`, `?limit=` (1–100) |
| GET / PUT / DELETE | `/readings/:id` | Single reading (404 if it belongs to someone else) |
| GET | `/reports/daily?date=` | Stats + readings for one day |
| GET | `/reports/month-to-date?date=` | 1st of the month → selected date |
| GET | `/reports/monthly?date=` | Entire calendar month before the selected date |

Slots: `MORNING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, `AFTER_DINNER`. Report `date` defaults to today in `APP_TIMEZONE`.
Empty periods return `count: 0` with `highest`, `lowest` and `average` as `null`.
