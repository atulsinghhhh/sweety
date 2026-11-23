// Reading dates are plain calendar dates ("YYYY-MM-DD"). Formatting uses UTC
// so the displayed day never shifts with the browser's timezone.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function todayLocal() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function shiftDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function formatDate(dateString, options = {}) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  }).format(new Date(`${dateString}T00:00:00.000Z`))
}

export function formatShortDate(dateString) {
  return formatDate(dateString, { weekday: undefined, year: undefined })
}

export function formatMonth(monthString) {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${monthString}-01T00:00:00.000Z`),
  )
}
