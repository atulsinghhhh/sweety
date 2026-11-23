# Project: Sweety – Blood Glucose Tracker

## 1. Project Overview

I am building a full-stack web application called **Sweety – Blood Glucose Tracker** as part of a technical hiring assignment for a Junior Full Stack Developer – JavaScript & AI position at Kenpath.

The application allows diabetes patients to record their daily blood glucose readings and view daily, month-to-date and monthly reports.

The goal is to build a clean, secure, functional and maintainable application.

This is a small production-minded application, not an unnecessarily complex enterprise system.

**Important:** Follow the assignment requirements exactly. Required features must be completed before attempting bonus features.

## 2. Technology Stack

Use the following stack:

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS
- shadcn/ui
- React Router
- Axios
- Recharts (optional bonus for charts)

### Backend
- Node.js
- Express.js
- JavaScript
- Prisma ORM
- PostgreSQL
- bcrypt for password hashing
- JWT authentication
- Zod for request validation

### Testing
- Jest
- Supertest
- React Testing Library for optional frontend tests

Use npm as the package manager.

## 3. Application Architecture

Use a monorepo architecture.

sweety/
├── client/
│   └── React frontend
├── server/
│   └── Express backend
├── screenshots/
├── README.md
├── .env.example
├── .gitignore
└── docker-compose.yml (optional)

Keep frontend and backend code separate.

Use a modular backend architecture with:
- Routes
- Controllers
- Services
- Middleware
- Validators
- Database configuration

Avoid putting all business logic inside route handlers.

## 4. Core Features

### Module A: Authentication

Implement user registration and login.

Registration fields:
- Name
- Email
- Password

Requirements:
- Validate all input.
- Check for duplicate email addresses.
- Hash passwords using bcrypt.
- Never store plain-text passwords.
- Implement JWT-based authentication.
- Protect all reading and report endpoints.
- Users must only access their own readings.
- Never expose password hashes in API responses.

Create:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Module B: Blood Glucose Reading Management

Users must be able to:
- Create readings.
- View readings.
- Edit readings.
- Delete readings.

Each reading contains:
- Reading date
- Time slot
- Glucose value in mg/dL
- User ID

There are exactly four allowed reading slots:

1. MORNING – Morning (fasting)
2. AFTER_BREAKFAST – After breakfast
3. AFTER_LUNCH – After lunch
4. AFTER_DINNER – After dinner

### Reading Validation Rules

Implement these rules on both frontend and backend:

1. Glucose value is required.
2. Glucose value must be a whole number between 40 and 600.
3. Only one reading per slot per day per user.
4. Maximum four readings per day per user.
5. Reading date cannot be in the future.

Display meaningful validation messages.

Required messages include:

- Please enter a glucose value.
- Value must be between 40 and 600 mg/dl.
- You already have an After lunch reading for this date.
- You can add only 4 readings per day.
- Date cannot be in the future.

Use PostgreSQL constraints to prevent duplicate user/date/slot combinations.

Enforce the daily maximum safely under concurrent requests using transactions or appropriate locking.

Ensure that editing a reading also follows all validation rules.

### Reading APIs

- POST /api/readings
- GET /api/readings
- GET /api/readings/:id
- PUT /api/readings/:id
- DELETE /api/readings/:id

Every operation must enforce ownership using the authenticated user's ID.

### Module C: Reports

Implement three types of reports.

#### 1. Daily Report

For a selected date, display:
- Highest reading
- Lowest reading
- Average reading rounded to one decimal place
- Total number of readings
- Individual readings with their time slots

#### 2. Month-to-Date Report

Date range:
- First day of the selected month
- Through the selected date

Display:
- Highest reading
- Lowest reading
- Average reading
- Total number of readings

#### 3. Monthly Report

Date range:
- Entire previous calendar month

Display:
- Highest reading
- Lowest reading
- Average reading
- Total number of readings

Important:
The monthly report must represent the entire previous month, not the current month.

Handle month boundaries, leap years and date calculations correctly.

If there are no readings, show a friendly empty state instead of invalid statistical values.

All reports must be scoped to the authenticated user.

### Report APIs

- GET /api/reports/daily?date=YYYY-MM-DD
- GET /api/reports/month-to-date?date=YYYY-MM-DD
- GET /api/reports/monthly?date=YYYY-MM-DD

Perform report calculations on the backend.

Do not calculate authoritative report statistics only in React.

## 5. Database Design

Use PostgreSQL with Prisma.

Create two main models:

### User
- id: UUID
- name: String
- email: String (unique)
- password: String (hashed)
- createdAt: DateTime
- readings: Reading[]

### Reading
- id: UUID
- userId: UUID (foreign key)
- readingDate: Date
- slot: ReadingSlot enum
- value: Integer
- createdAt: DateTime
- updatedAt: DateTime

Database requirements:
- One user can have multiple readings.
- A reading belongs to exactly one user.
- Unique constraint on userId + readingDate + slot.
- Index userId + readingDate.
- Add a database check constraint for values between 40 and 600.
- Delete associated readings when a user is deleted.

Use proper migrations.

Be careful with PostgreSQL DATE handling and timezone conversions. Reading dates are calendar dates, not timestamps representing arbitrary times.

## 6. Frontend Pages

Create these pages:

### 1. Login
- Email
- Password
- Login button
- Validation messages
- Link to registration

### 2. Registration
- Name
- Email
- Password
- Register button
- Validation messages

### 3. Dashboard
Display:
- Welcome message
- Selected date
- Total readings
- Highest reading
- Lowest reading
- Average reading
- Recent readings
- Add Reading button

### 4. Reading Management
- List readings
- Add reading
- Edit reading
- Delete reading
- Select date
- Display validation errors
- Handle empty states

### 5. Reports
- Date selector
- Daily report
- Month-to-date report
- Monthly report
- Statistics cards
- Individual daily readings

## 7. UI/UX Design Direction

Create a modern, professional healthcare SaaS dashboard.

Visual direction:
- Clean and minimal interface.
- Dark theme as the primary theme.
- White/light text on dark backgrounds.
- Good typography.
- Consistent spacing.
- Responsive layout.
- Subtle animations.
- Clear forms and buttons.
- Accessible colors and contrast.
- Meaningful loading, success and error states.

Use shadcn/ui components where appropriate.

Avoid:
- Excessive gradients.
- Unnecessary animations.
- Overcomplicated dashboards.
- Too many colors.
- Unnecessary UI elements.

The UI should look polished but must not compromise functionality.

## 8. Security Requirements

- Hash passwords with bcrypt.
- Validate and sanitize user inputs.
- Protect private API endpoints.
- Verify resource ownership on every reading operation.
- Never trust userId supplied by the frontend.
- Use environment variables for secrets.
- Never commit real credentials.
- Configure appropriate CORS.
- Handle authentication errors securely.
- Do not expose sensitive database information.

## 9. Testing Requirements

Write meaningful backend tests using Jest and Supertest.

Prioritize these cases:

Authentication:
- Successful registration.
- Duplicate email rejection.
- Successful login.
- Incorrect password rejection.

Reading management:
- Successful reading creation.
- Invalid values rejected.
- Decimal values rejected.
- Duplicate slot rejected.
- Fifth reading rejected.
- Future dates rejected.
- Reading update works.
- Reading deletion works.
- User cannot access another user's reading.

Reports:
- Correct highest reading.
- Correct lowest reading.
- Correct average.
- Correct total count.
- Correct date ranges.
- Empty report handling.

## 10. Bonus Features

Only implement these after all required features are complete.

Priority order:

1. Docker Compose for PostgreSQL and the application.
2. Pagination on GET /api/readings.
3. Recharts monthly line chart.
4. Frontend tests with React Testing Library.
5. Redis caching for report results, with proper invalidation after reading changes.
6. BullMQ daily reminder background job.
7. Doctor role for viewing reports of assigned patients.

Do not start optional features until the required assignment is working.

## 11. Submission Requirements

The project must include:

1. Public GitHub repository.
2. Regular meaningful Git commits.
3. Complete README.md.
4. Installation instructions.
5. PostgreSQL database setup instructions.
6. Backend and frontend startup instructions.
7. Test execution instructions.
8. .env.example containing every required variable.
9. Seed script creating a demo user with sample readings.
10. Screenshots or a 2–3 minute screen recording.
11. Notes section explaining assumptions and future improvements.

## 12. Development Workflow

Work in milestones.

### Milestone 1: Project Foundation
- Initialize monorepo.
- Set up React and Express.
- Configure PostgreSQL.
- Configure Prisma.
- Create database models.
- Run migrations.

### Milestone 2: Backend
- Authentication.
- JWT middleware.
- Reading CRUD.
- Validation.
- Reports.
- Backend tests.

### Milestone 3: Frontend
- Authentication pages.
- Dashboard.
- Reading management.
- Reports.
- API integration.
- Loading and error states.

### Milestone 4: Quality
- Test all requirements.
- Fix bugs.
- Verify user data isolation.
- Create seed script.
- Complete documentation.

### Milestone 5: Submission
- Review Git history.
- Verify clean installation from scratch.
- Capture screenshots.
- Record demo.
- Verify public repository.

## 13. Important Instructions for Claude Code

Before writing code:

1. Inspect the existing repository.
2. Check whether any code or configuration already exists.
3. Understand the complete requirements.
4. Create an implementation plan.
5. Identify potential technical issues.
6. Propose the database schema and API structure.

Do not immediately generate the entire project in one response.

Implement one milestone at a time.

After each milestone:
- Explain what you implemented.
- List files created or modified.
- Explain important architectural decisions.
- Run relevant tests.
- Report test results honestly.
- Identify anything unfinished.

Do not silently skip requirements.

Do not invent successful test results.

Do not add unnecessary dependencies or infrastructure.

Do not deploy anything or expose secrets without my explicit permission.

**Final objective:** Deliver a fully functional, secure, maintainable Sweety Blood Glucose Tracker that satisfies every required feature in the Kenpath hiring assignment and is ready for GitHub submission.

Start by inspecting the repository and preparing the implementation plan. Do not begin implementation until you have presented the plan.