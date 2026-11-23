const { app, prisma, request, resetDb, createUser, today } = require('./helpers');

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

async function seed(userId, rows) {
  await prisma.reading.createMany({
    data: rows.map(([date, slot, value]) => ({
      userId,
      readingDate: new Date(`${date}T00:00:00.000Z`),
      slot,
      value,
    })),
  });
}

function getReport(auth, type, date) {
  const query = date ? `?date=${date}` : '';
  return request(app).get(`/api/reports/${type}${query}`).set(auth);
}

describe('reports', () => {
  let owner;

  beforeEach(async () => {
    owner = await createUser();
    await seed(owner.user.id, [
      ['2024-01-31', 'AFTER_DINNER', 400], // outside every March/February range
      ['2024-02-01', 'MORNING', 120], // first day of February (leap year)
      ['2024-02-29', 'AFTER_LUNCH', 50], // leap day
      ['2024-03-01', 'MORNING', 100],
      ['2024-03-15', 'AFTER_DINNER', 200],
      ['2024-03-15', 'MORNING', 90],
      ['2024-03-15', 'AFTER_LUNCH', 145],
      ['2024-03-16', 'MORNING', 500], // after the selected date
    ]);
    // Another user's data must never leak into reports
    const other = await createUser();
    await seed(other.user.id, [
      ['2024-03-15', 'AFTER_BREAKFAST', 590],
      ['2024-02-10', 'MORNING', 41],
    ]);
  });

  describe('GET /api/reports/daily', () => {
    it('returns highest, lowest, average, count and readings in slot order', async () => {
      const res = await getReport(owner.auth, 'daily', '2024-03-15');

      expect(res.status).toBe(200);
      expect(res.body.report).toMatchObject({
        type: 'daily',
        date: '2024-03-15',
        range: { from: '2024-03-15', to: '2024-03-15' },
        stats: { count: 3, highest: 200, lowest: 90, average: 145 },
      });
      expect(res.body.report.readings.map((r) => [r.slot, r.slotLabel, r.value])).toEqual([
        ['MORNING', 'Morning (fasting)', 90],
        ['AFTER_LUNCH', 'After lunch', 145],
        ['AFTER_DINNER', 'After dinner', 200],
      ]);
    });

    it('returns an empty report with null statistics for a day without readings', async () => {
      const res = await getReport(owner.auth, 'daily', '2024-03-10');

      expect(res.status).toBe(200);
      expect(res.body.report.stats).toEqual({ count: 0, highest: null, lowest: null, average: null });
      expect(res.body.report.readings).toEqual([]);
    });
  });

  describe('GET /api/reports/month-to-date', () => {
    it('covers the first of the month through the selected date', async () => {
      const res = await getReport(owner.auth, 'month-to-date', '2024-03-15');

      expect(res.status).toBe(200);
      expect(res.body.report.range).toEqual({ from: '2024-03-01', to: '2024-03-15' });
      // 100, 200, 90, 145 → average 133.75 rounds to 133.8
      expect(res.body.report.stats).toEqual({ count: 4, highest: 200, lowest: 90, average: 133.8 });
    });

    it('handles the first day of a month', async () => {
      const res = await getReport(owner.auth, 'month-to-date', '2024-03-01');

      expect(res.body.report.range).toEqual({ from: '2024-03-01', to: '2024-03-01' });
      expect(res.body.report.stats).toEqual({ count: 1, highest: 100, lowest: 100, average: 100 });
    });
  });

  describe('GET /api/reports/monthly', () => {
    it('covers the entire previous calendar month, including the leap day', async () => {
      const res = await getReport(owner.auth, 'monthly', '2024-03-15');

      expect(res.status).toBe(200);
      expect(res.body.report).toMatchObject({
        type: 'monthly',
        month: '2024-02',
        range: { from: '2024-02-01', to: '2024-02-29' },
        stats: { count: 2, highest: 120, lowest: 50, average: 85 },
      });
    });

    it('rolls back to December of the previous year in January', async () => {
      await seed(owner.user.id, [
        ['2024-12-01', 'MORNING', 88],
        ['2024-12-31', 'AFTER_DINNER', 77],
        ['2025-01-05', 'MORNING', 300],
      ]);
      const res = await getReport(owner.auth, 'monthly', '2025-01-10');

      expect(res.body.report.range).toEqual({ from: '2024-12-01', to: '2024-12-31' });
      expect(res.body.report.stats).toEqual({ count: 2, highest: 88, lowest: 77, average: 82.5 });
    });

    it('returns an empty report when the previous month has no readings', async () => {
      const res = await getReport(owner.auth, 'monthly', '2024-07-04');

      expect(res.body.report.range).toEqual({ from: '2024-06-01', to: '2024-06-30' });
      expect(res.body.report.stats).toEqual({ count: 0, highest: null, lowest: null, average: null });
    });
  });

  it('rounds the average to one decimal place', async () => {
    await seed(owner.user.id, [
      ['2023-05-02', 'MORNING', 100],
      ['2023-05-02', 'AFTER_BREAKFAST', 101],
      ['2023-05-02', 'AFTER_LUNCH', 101],
    ]);
    const res = await getReport(owner.auth, 'daily', '2023-05-02');
    expect(res.body.report.stats.average).toBe(100.7);
  });

  it('defaults to today when no date is given', async () => {
    const res = await getReport(owner.auth, 'daily');

    expect(res.status).toBe(200);
    expect(res.body.report.date).toBe(today());
  });

  it.each(['daily', 'month-to-date', 'monthly'])('%s rejects an invalid date', async (type) => {
    const res = await getReport(owner.auth, type, '2024-13-01');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Please enter a valid date (YYYY-MM-DD).');
  });

  it.each(['daily', 'month-to-date', 'monthly'])('%s requires authentication', async (type) => {
    const res = await getReport({}, type, '2024-03-15');
    expect(res.status).toBe(401);
  });
});
