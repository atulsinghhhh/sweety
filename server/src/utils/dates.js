const { appTimezone } = require('../config/env');

// Reading dates are calendar dates ("YYYY-MM-DD"), never local timestamps.
// They are always converted to/from UTC midnight so a PostgreSQL DATE
// round-trips without shifting a day.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  // Rejects impossible dates such as 2025-02-30 that JS would roll over
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toDbDate(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function formatDbDate(date) {
  return date.toISOString().slice(0, 10);
}

function todayInTimezone(timeZone = appTimezone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function isFutureDate(dateString, timeZone = appTimezone, now = new Date()) {
  // ISO date strings compare correctly as plain strings
  return dateString > todayInTimezone(timeZone, now);
}

function monthToDateRange(dateString) {
  return { from: `${dateString.slice(0, 8)}01`, to: dateString };
}

function previousMonthRange(dateString) {
  const [year, month] = dateString.split('-').map(Number);
  // month is 1-based; Date.UTC normalises month -1 to December of the prior year
  const firstDay = new Date(Date.UTC(year, month - 2, 1));
  // Day 0 of the selected month is the last day of the previous month (handles leap years)
  const lastDay = new Date(Date.UTC(year, month - 1, 0));
  return { from: formatDbDate(firstDay), to: formatDbDate(lastDay) };
}

module.exports = {
  isValidDateString,
  toDbDate,
  formatDbDate,
  todayInTimezone,
  isFutureDate,
  monthToDateRange,
  previousMonthRange,
};
