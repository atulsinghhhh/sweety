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
