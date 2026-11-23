const { app, prisma, request, resetDb, createUser, shiftDate, today } = require('./helpers');

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

const yesterday = () => shiftDate(today(), -1);
const SLOTS = ['MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER'];

function addReading(auth, body) {
  return request(app).post('/api/readings').set(auth).send(body);
}

describe('POST /api/readings', () => {
  it('creates a reading for the authenticated user', async () => {
    const { user, auth } = await createUser();
    const res = await addReading(auth, { readingDate: yesterday(), slot: 'AFTER_LUNCH', value: 142 });

    expect(res.status).toBe(201);
    expect(res.body.reading).toMatchObject({
      readingDate: yesterday(),
      slot: 'AFTER_LUNCH',
      slotLabel: 'After lunch',
      value: 142,
    });
    const stored = await prisma.reading.findUnique({ where: { id: res.body.reading.id } });
    expect(stored.userId).toBe(user.id);
  });

  it("accepts today's date", async () => {
    const { auth } = await createUser();
    const res = await addReading(auth, { readingDate: today(), slot: 'MORNING', value: 95 });
    expect(res.status).toBe(201);
  });

  it('ignores a userId supplied in the body', async () => {
    const { user, auth } = await createUser();
    const other = await createUser();
    const res = await addReading(auth, {
      readingDate: yesterday(),
      slot: 'MORNING',
      value: 100,
      userId: other.user.id,
    });

    expect(res.status).toBe(201);
    const stored = await prisma.reading.findUnique({ where: { id: res.body.reading.id } });
    expect(stored.userId).toBe(user.id);
  });

  it.each([
    ['missing', undefined, 'Please enter a glucose value.'],
    ['empty string', '', 'Please enter a glucose value.'],
    ['below 40', 39, 'Value must be between 40 and 600 mg/dl.'],
    ['above 600', 601, 'Value must be between 40 and 600 mg/dl.'],
    ['non-numeric', 'abc', 'Please enter a valid glucose value.'],
  ])('rejects a %s value', async (_label, value, message) => {
    const { auth } = await createUser();
    const res = await addReading(auth, { readingDate: yesterday(), slot: 'MORNING', value });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({ message, field: 'value' });
  });

  it.each([40, 600])('accepts the boundary value %i', async (value) => {
    const { auth } = await createUser();
    const res = await addReading(auth, { readingDate: yesterday(), slot: 'MORNING', value });
    expect(res.status).toBe(201);
  });

  it.each([120.5, '99.9'])('rejects the decimal value %p', async (value) => {
    const { auth } = await createUser();
    const res = await addReading(auth, { readingDate: yesterday(), slot: 'MORNING', value });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({ message: 'Value must be a whole number.', field: 'value' });
  });

  it('rejects a duplicate slot on the same date', async () => {
    const { auth } = await createUser();
    await addReading(auth, { readingDate: yesterday(), slot: 'AFTER_LUNCH', value: 140 });
    const res = await addReading(auth, { readingDate: yesterday(), slot: 'AFTER_LUNCH', value: 150 });

    expect(res.status).toBe(409);
    expect(res.body.error).toEqual({
      message: 'You already have an After lunch reading for this date.',
      field: 'slot',
    });
  });

  it('uses the right article in the duplicate message', async () => {
    const { auth } = await createUser();
    await addReading(auth, { readingDate: yesterday(), slot: 'MORNING', value: 90 });
    const res = await addReading(auth, { readingDate: yesterday(), slot: 'MORNING', value: 91 });

    expect(res.body.error.message).toBe('You already have a Morning (fasting) reading for this date.');
  });

  it('allows the same slot on a different date and for a different user', async () => {
    const { auth } = await createUser();
    const other = await createUser();
    await addReading(auth, { readingDate: yesterday(), slot: 'MORNING', value: 90 });

    expect((await addReading(auth, { readingDate: today(), slot: 'MORNING', value: 90 })).status).toBe(201);
    expect((await addReading(other.auth, { readingDate: yesterday(), slot: 'MORNING', value: 90 })).status).toBe(201);
  });

  it('rejects a fifth reading on the same day', async () => {
    const { auth } = await createUser();
    for (const slot of SLOTS) {
      expect((await addReading(auth, { readingDate: yesterday(), slot, value: 110 })).status).toBe(201);
    }
    const res = await addReading(auth, { readingDate: yesterday(), slot: 'AFTER_DINNER', value: 120 });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe('You can add only 4 readings per day.');
    expect(await prisma.reading.count()).toBe(4);
  });

  it('rejects a future date', async () => {
    const { auth } = await createUser();
    const res = await addReading(auth, { readingDate: shiftDate(today(), 1), slot: 'MORNING', value: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({ message: 'Date cannot be in the future.', field: 'readingDate' });
  });

  it.each([
    [undefined, 'Please select a date.'],
    ['2025-02-30', 'Please enter a valid date (YYYY-MM-DD).'],
    ['23/11/2026', 'Please enter a valid date (YYYY-MM-DD).'],
  ])('rejects the date %p', async (readingDate, message) => {
    const { auth } = await createUser();
    const res = await addReading(auth, { readingDate, slot: 'MORNING', value: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe(message);
  });

  it('rejects an unknown slot', async () => {
    const { auth } = await createUser();
    const res = await addReading(auth, { readingDate: yesterday(), slot: 'MIDNIGHT', value: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({ message: 'Please select a valid time slot.', field: 'slot' });
  });

  it('stays consistent under concurrent requests for the same day', async () => {
    const { auth } = await createUser();
    // Every slot requested twice at once: exactly one per slot may win
    const attempts = [...SLOTS, ...SLOTS].map((slot) =>
      addReading(auth, { readingDate: yesterday(), slot, value: 100 }),
    );
    const results = await Promise.all(attempts);

    expect(results.filter((r) => r.status === 201)).toHaveLength(4);
    expect(results.filter((r) => r.status === 409)).toHaveLength(4);
    expect(await prisma.reading.count()).toBe(4);
  });

  it('requires authentication', async () => {
    const res = await addReading({}, { readingDate: yesterday(), slot: 'MORNING', value: 100 });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/readings', () => {
  it("lists only the user's readings, newest date first and slots in day order", async () => {
    const { auth } = await createUser();
    const other = await createUser();
    await addReading(auth, { readingDate: yesterday(), slot: 'AFTER_DINNER', value: 150 });
    await addReading(auth, { readingDate: yesterday(), slot: 'MORNING', value: 90 });
    await addReading(auth, { readingDate: today(), slot: 'AFTER_LUNCH', value: 130 });
    await addReading(other.auth, { readingDate: today(), slot: 'MORNING', value: 300 });

    const res = await request(app).get('/api/readings').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.readings.map((r) => [r.readingDate, r.slot])).toEqual([
      [today(), 'AFTER_LUNCH'],
      [yesterday(), 'MORNING'],
      [yesterday(), 'AFTER_DINNER'],
    ]);
  });

  it('filters by date and limits results', async () => {
    const { auth } = await createUser();
    await addReading(auth, { readingDate: yesterday(), slot: 'MORNING', value: 90 });
    await addReading(auth, { readingDate: today(), slot: 'MORNING', value: 95 });
    await addReading(auth, { readingDate: today(), slot: 'AFTER_LUNCH', value: 130 });

    const byDate = await request(app).get(`/api/readings?date=${yesterday()}`).set(auth);
    expect(byDate.body.readings).toHaveLength(1);

    const limited = await request(app).get('/api/readings?limit=2').set(auth);
    expect(limited.body.readings).toHaveLength(2);

    const invalid = await request(app).get('/api/readings?date=nope').set(auth);
    expect(invalid.status).toBe(400);
  });

  it('returns an empty list when there are no readings', async () => {
    const { auth } = await createUser();
    const res = await request(app).get('/api/readings').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.readings).toEqual([]);
  });
});

describe('GET/PUT/DELETE /api/readings/:id', () => {
  async function setup() {
    const owner = await createUser();
    const res = await addReading(owner.auth, { readingDate: yesterday(), slot: 'MORNING', value: 100 });
    return { owner, reading: res.body.reading };
  }

  it('gets a single reading', async () => {
    const { owner, reading } = await setup();
    const res = await request(app).get(`/api/readings/${reading.id}`).set(owner.auth);

    expect(res.status).toBe(200);
    expect(res.body.reading).toEqual(reading);
  });

  it('updates a reading', async () => {
    const { owner, reading } = await setup();
    const res = await request(app)
      .put(`/api/readings/${reading.id}`)
      .set(owner.auth)
      .send({ readingDate: today(), slot: 'AFTER_BREAKFAST', value: 180 });

    expect(res.status).toBe(200);
    expect(res.body.reading).toMatchObject({ id: reading.id, readingDate: today(), slot: 'AFTER_BREAKFAST', value: 180 });
  });

  it('allows updating the value while keeping the same slot', async () => {
    const { owner, reading } = await setup();
    const res = await request(app)
      .put(`/api/readings/${reading.id}`)
      .set(owner.auth)
      .send({ readingDate: yesterday(), slot: 'MORNING', value: 105 });

    expect(res.status).toBe(200);
    expect(res.body.reading.value).toBe(105);
  });

  it('applies all validation rules on update', async () => {
    const { owner, reading } = await setup();
    await addReading(owner.auth, { readingDate: yesterday(), slot: 'AFTER_LUNCH', value: 140 });
    const put = (body) => request(app).put(`/api/readings/${reading.id}`).set(owner.auth).send(body);

    const duplicate = await put({ readingDate: yesterday(), slot: 'AFTER_LUNCH', value: 100 });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.message).toBe('You already have an After lunch reading for this date.');

    const future = await put({ readingDate: shiftDate(today(), 1), slot: 'MORNING', value: 100 });
    expect(future.body.error.message).toBe('Date cannot be in the future.');

    const outOfRange = await put({ readingDate: yesterday(), slot: 'MORNING', value: 700 });
    expect(outOfRange.body.error.message).toBe('Value must be between 40 and 600 mg/dl.');

    const decimal = await put({ readingDate: yesterday(), slot: 'MORNING', value: 100.5 });
    expect(decimal.body.error.message).toBe('Value must be a whole number.');
  });

  it('rejects moving a reading onto a day that already has 4 readings', async () => {
    const { owner, reading } = await setup();
    for (const slot of SLOTS) {
      await addReading(owner.auth, { readingDate: today(), slot, value: 110 });
    }
    const res = await request(app)
      .put(`/api/readings/${reading.id}`)
      .set(owner.auth)
      .send({ readingDate: today(), slot: 'MORNING', value: 100 });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe('You can add only 4 readings per day.');
  });

  it('deletes a reading', async () => {
    const { owner, reading } = await setup();
    const res = await request(app).delete(`/api/readings/${reading.id}`).set(owner.auth);

    expect(res.status).toBe(204);
    expect(await prisma.reading.count()).toBe(0);
    const again = await request(app).get(`/api/readings/${reading.id}`).set(owner.auth);
    expect(again.status).toBe(404);
  });

  it("prevents another user from reading, updating or deleting someone else's reading", async () => {
    const { reading } = await setup();
    const intruder = await createUser();
    const url = `/api/readings/${reading.id}`;

    const get = await request(app).get(url).set(intruder.auth);
    const put = await request(app)
      .put(url)
      .set(intruder.auth)
      .send({ readingDate: yesterday(), slot: 'MORNING', value: 300 });
    const del = await request(app).delete(url).set(intruder.auth);

    for (const res of [get, put, del]) {
      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Reading not found.');
    }
    const stored = await prisma.reading.findUnique({ where: { id: reading.id } });
    expect(stored.value).toBe(100);
  });

  it('returns 404 for a malformed id', async () => {
    const { owner } = await setup();
    const res = await request(app).get('/api/readings/not-a-uuid').set(owner.auth);
    expect(res.status).toBe(404);
  });

  it("deletes a user's readings when the user is deleted", async () => {
    const { owner } = await setup();
    await prisma.user.delete({ where: { id: owner.user.id } });
    expect(await prisma.reading.count()).toBe(0);
  });
});

describe('database constraints', () => {
  it('rejects out-of-range values even when written directly', async () => {
    const { user } = await createUser();
    await expect(
      prisma.reading.create({
        data: { userId: user.id, readingDate: new Date('2025-01-01T00:00:00Z'), slot: 'MORNING', value: 700 },
      }),
    ).rejects.toThrow();
  });
});
