const {
  isValidDateString,
  todayInTimezone,
  isFutureDate,
  monthToDateRange,
  previousMonthRange,
} = require('../src/utils/dates');

describe('date utilities', () => {
  it.each([
    ['2024-02-29', true],
    ['2023-02-29', false],
    ['2025-02-30', false],
    ['2024-13-01', false],
    ['2024-1-01', false],
    ['', false],
    [20240101, false],
  ])('isValidDateString(%p) → %p', (input, expected) => {
    expect(isValidDateString(input)).toBe(expected);
  });

  it('computes "today" in the configured timezone, not UTC', () => {
    // 20:00 UTC on 22 Nov is already 01:30 on 23 Nov in Asia/Kolkata
    const now = new Date('2026-11-22T20:00:00Z');
    expect(todayInTimezone('Asia/Kolkata', now)).toBe('2026-11-23');
    expect(todayInTimezone('UTC', now)).toBe('2026-11-22');
    expect(isFutureDate('2026-11-23', 'Asia/Kolkata', now)).toBe(false);
    expect(isFutureDate('2026-11-24', 'Asia/Kolkata', now)).toBe(true);
  });

  it('builds month-to-date ranges', () => {
    expect(monthToDateRange('2024-03-15')).toEqual({ from: '2024-03-01', to: '2024-03-15' });
  });

  it.each([
    ['2024-03-15', '2024-02-01', '2024-02-29'], // leap year February
    ['2023-03-31', '2023-02-01', '2023-02-28'], // common year February
    ['2025-01-10', '2024-12-01', '2024-12-31'], // year boundary
    ['2024-05-31', '2024-04-01', '2024-04-30'], // 30-day month from a 31st
    ['2024-12-01', '2024-11-01', '2024-11-30'],
  ])('previousMonthRange(%s) → %s..%s', (date, from, to) => {
    expect(previousMonthRange(date)).toEqual({ from, to });
  });
});
