const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');
const { todayInTimezone } = require('../src/utils/dates');

let userCounter = 0;

async function resetDb() {
  await prisma.reading.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser(overrides = {}) {
  userCounter += 1;
  const credentials = {
    name: `Test User ${userCounter}`,
    email: `user${userCounter}-${Date.now()}@example.com`,
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(credentials);
  if (res.status !== 201) throw new Error(`Failed to create test user: ${JSON.stringify(res.body)}`);
  return { ...res.body, credentials, auth: { Authorization: `Bearer ${res.body.token}` } };
}

function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const today = () => todayInTimezone();

module.exports = { app, prisma, request, resetDb, createUser, shiftDate, today };
