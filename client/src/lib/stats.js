import { shiftDate } from './dates'
import { SLOTS } from './readings'

export const formatValue = (value, digits = 1) =>
  value == null ? '—' : value.toLocaleString('en-IN', { maximumFractionDigits: digits })

/**
 * One entry per calendar day from `from` to `to` (inclusive), with the day's
 * average, lowest and highest reading. Days without readings get nulls so
 * charts can leave a gap instead of inventing a value.
 */
export function dailySeries(readings, from, to) {
  const byDate = new Map()
  for (const reading of readings) {
    const list = byDate.get(reading.readingDate) ?? []
    list.push(reading)
    byDate.set(reading.readingDate, list)
  }

  const series = []
  for (let date = from; date <= to; date = shiftDate(date, 1)) {
    const values = (byDate.get(date) ?? []).map((r) => r.value)
    const count = values.length
    series.push({
      date,
      count,
      average: count ? Math.round((values.reduce((sum, v) => sum + v, 0) / count) * 10) / 10 : null,
      lowest: count ? Math.min(...values) : null,
      highest: count ? Math.max(...values) : null,
      range: count ? [Math.min(...values), Math.max(...values)] : null,
    })
  }
  return series
}

// Readings grouped by day (newest first), each row holding one value per slot
export function readingsByDay(readings) {
  const days = new Map()
  for (const reading of readings) {
    const row = days.get(reading.readingDate) ?? { date: reading.readingDate, slots: {} }
    row.slots[reading.slot] = reading.value
    days.set(reading.readingDate, row)
  }
  return [...days.values()]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((row) => {
      const values = SLOTS.map((slot) => row.slots[slot.value]).filter((v) => v != null)
      return { ...row, average: Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 }
    })
}
