const { app, prisma, request, resetDb, createUser } = require('./helpers');

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('POST /api/auth/register', () => {
  const valid = { name: 'Asha Rao', email: 'Asha@Example.com', password: 'password123' };

  it('registers a user, returns a token and never exposes the password', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: 'Asha Rao', email: 'asha@example.com' });
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('stores a bcrypt hash, not the plain-text password', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const stored = await prisma.user.findUnique({ where: { email: 'asha@example.com' } });

    expect(stored.password).not.toBe(valid.password);
    expect(stored.password).toMatch(/^\$2[aby]\$/);
  });

  it('rejects a duplicate email regardless of case', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...valid, email: 'ASHA@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error).toEqual({ message: 'An account with this email already exists.', field: 'email' });
  });

  it.each([
    [{ ...valid, name: '  ' }, 'name', 'Please enter your name.'],
    [{ ...valid, email: 'not-an-email' }, 'email', 'Please enter a valid email address.'],
    [{ ...valid, password: 'short' }, 'password', 'Password must be at least 8 characters.'],
    [{ name: 'A', email: 'a@b.co' }, 'password', 'Please enter a password.'],
  ])('rejects invalid input %#', async (body, field, message) => {
    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({ message, field });
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const { credentials } = await createUser();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email.toUpperCase(), password: credentials.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(credentials.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rejects an incorrect password', async () => {
    const { credentials } = await createUser();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password.');
    expect(res.body).not.toHaveProperty('token');
  });

  it('gives the same error for an unknown email (no account enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid email or password.');
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user for a valid token', async () => {
    const { user, auth } = await createUser();
    const res = await request(app).get('/api/auth/me').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(user);
  });

  it.each([
    ['no header', {}],
    ['malformed header', { Authorization: 'Token abc' }],
    ['invalid token', { Authorization: 'Bearer not.a.jwt' }],
  ])('rejects requests with %s', async (_label, headers) => {
    const res = await request(app).get('/api/auth/me').set(headers);
    expect(res.status).toBe(401);
  });

  it('rejects a token whose user no longer exists', async () => {
    const { user, auth } = await createUser();
    await prisma.user.delete({ where: { id: user.id } });

    const res = await request(app).get('/api/auth/me').set(auth);
    expect(res.status).toBe(401);
  });
});
