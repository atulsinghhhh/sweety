const prisma = require('../config/db');
const { toDbDate, monthToDateRange, previousMonthRange } = require('../utils/dates');
const { serializeReading } = require('./reading.service');

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

async function computeStats(userId, { from, to }) {
  const result = await prisma.reading.aggregate({
    where: { userId, readingDate: { gte: toDbDate(from), lte: toDbDate(to) } },
    _count: { _all: true },
    _max: { value: true },
    _min: { value: true },
    _avg: { value: true },
  });

  const count = result._count._all;
  // With no readings, report nulls rather than NaN/0 so the UI can show an empty state
  return {
    count,
    highest: count ? result._max.value : null,
    lowest: count ? result._min.value : null,
    average: count ? roundToOneDecimal(result._avg.value) : null,
  };
}

async function dailyReport(userId, date) {
  const range = { from: date, to: date };
  const [stats, readings] = await Promise.all([
    computeStats(userId, range),
    prisma.reading.findMany({
      where: { userId, readingDate: toDbDate(date) },
      orderBy: { slot: 'asc' },
    }),
  ]);
  return { type: 'daily', date, range, stats, readings: readings.map(serializeReading) };
}

async function monthToDateReport(userId, date) {
  const range = monthToDateRange(date);
  return { type: 'month-to-date', date, range, stats: await computeStats(userId, range) };
}

async function monthlyReport(userId, date) {
  const range = previousMonthRange(date);
  return {
    type: 'monthly',
    date,
    month: range.from.slice(0, 7),
    range,
    stats: await computeStats(userId, range),
  };
}

module.exports = { dailyReport, monthToDateReport, monthlyReport };
