const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

afterAll(() => prisma.$disconnect());

describe('foundation', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Route not found');
  });

  it('connects to the test database with the schema applied', async () => {
    const rows = await prisma.$queryRaw`SELECT current_database() AS db`;
    expect(rows[0].db).toBe(new URL(process.env.DATABASE_URL).pathname.slice(1));
    // The suite wipes this database — refuse to run against one not named as a test DB
    expect(rows[0].db).toMatch(/test/i);
    await expect(prisma.reading.count()).resolves.toBe(0);
  });
});
