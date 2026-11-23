const jwt = require('jsonwebtoken');
const { app, prisma, request, resetDb, createUser, shiftDate, today } = require('./helpers');
const { jwtSecret } = require('../src/config/env');

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

const yesterday = () => shiftDate(today(), -1);

describe('token verification', () => {
  function forgedTokens(userId) {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: userId })).toString('base64url');
    return {
      expired: jwt.sign({ sub: userId }, jwtSecret, { expiresIn: -10 }),
      'wrong secret': jwt.sign({ sub: userId }, 'not-the-server-secret'),
      'alg none': `${header}.${payload}.`,
    };
  }

  it.each(['expired', 'wrong secret', 'alg none'])('rejects a token that is %s', async (kind) => {
    const { user } = await createUser();
    const token = forgedTokens(user.id)[kind];

    for (const path of ['/api/auth/me', '/api/readings', '/api/reports/daily']) {
      const res = await request(app).get(path).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
    }
  });
});

describe('password handling', () => {
  it('never returns a password or hash from any auth endpoint', async () => {
    const registered = await createUser();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: registered.credentials.email, password: registered.credentials.password });
    const me = await request(app).get('/api/auth/me').set(registered.auth);

    for (const body of [registered, login.body, me.body]) {
      const json = JSON.stringify(body.user);
      expect(json).not.toMatch(/password/i);
      expect(json).not.toMatch(/\$2[aby]\$/);
    }
  });
});

describe('user isolation in reports', () => {
  it("never includes another user's readings in any report", async () => {
    const owner = await createUser();
    const intruder = await createUser();
    await request(app)
      .post('/api/readings')
      .set(owner.auth)
      .send({ readingDate: yesterday(), slot: 'MORNING', value: 250 });

    for (const type of ['daily', 'month-to-date']) {
      const res = await request(app).get(`/api/reports/${type}?date=${yesterday()}`).set(intruder.auth);
      expect(res.body.report.stats.count).toBe(0);
    }
    const daily = await request(app).get(`/api/reports/daily?date=${yesterday()}`).set(intruder.auth);
    expect(daily.body.report.readings).toEqual([]);

    const ownerDaily = await request(app).get(`/api/reports/daily?date=${yesterday()}`).set(owner.auth);
    expect(ownerDaily.body.report.stats.count).toBe(1);
  });
});

describe('input hardening', () => {
  it.each(['0x64', '1e2', '120abc', '12 0'])('rejects the non-decimal value string %p', async (value) => {
    const { auth } = await createUser();
    const res = await request(app)
      .post('/api/readings')
      .set(auth)
      .send({ readingDate: yesterday(), slot: 'MORNING', value });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Please enter a valid glucose value.');
  });

  it('accepts a plain numeric string such as a form field value', async () => {
    const { auth } = await createUser();
    const res = await request(app)
      .post('/api/readings')
      .set(auth)
      .send({ readingDate: yesterday(), slot: 'MORNING', value: ' 120 ' });

    expect(res.status).toBe(201);
    expect(res.body.reading.value).toBe(120);
  });

  it('rejects a non-object JSON body', async () => {
    const { auth } = await createUser();
    const res = await request(app).post('/api/readings').set(auth).send([1, 2]);

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Invalid request body.');
  });

  it('rejects an oversized body with 413 instead of a server error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'a'.repeat(20000), email: 'big@example.com', password: 'password123' });

    expect(res.status).toBe(413);
    expect(res.body.error.message).toBe('Request body is too large.');
  });

  it('does not leak framework details in headers or error bodies', async () => {
    const res = await request(app).get('/api/readings/00000000-0000-0000-0000-000000000000');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toMatch(/prisma|stack|sql/i);
  });
});
