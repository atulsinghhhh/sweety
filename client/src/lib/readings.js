import { isValidDateString, todayLocal } from './dates'

// Mirrors server/src/utils/readingRules.js — the server remains authoritative.

export const SLOTS = [
  { value: 'MORNING', label: 'Morning (fasting)' },
  { value: 'AFTER_BREAKFAST', label: 'After breakfast' },
  { value: 'AFTER_LUNCH', label: 'After lunch' },
  { value: 'AFTER_DINNER', label: 'After dinner' },
]

export const SLOT_LABELS = Object.fromEntries(SLOTS.map((slot) => [slot.value, slot.label]))

export const MIN_VALUE = 40
export const MAX_VALUE = 600
export const MAX_READINGS_PER_DAY = 4

export const MESSAGES = {
  valueRequired: 'Please enter a glucose value.',
  valueInvalid: 'Please enter a valid glucose value.',
  valueWhole: 'Value must be a whole number.',
  valueRange: `Value must be between ${MIN_VALUE} and ${MAX_VALUE} mg/dl.`,
  dateRequired: 'Please select a date.',
  dateInvalid: 'Please enter a valid date (YYYY-MM-DD).',
  dateFuture: 'Date cannot be in the future.',
  slotRequired: 'Please select a time slot.',
  dailyLimit: `You can add only ${MAX_READINGS_PER_DAY} readings per day.`,
}

export function duplicateSlotMessage(slot) {
  const label = SLOT_LABELS[slot]
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a'
  return `You already have ${article} ${label} reading for this date.`
}

/**
 * @param form       { readingDate, slot, value } with value as the raw input string
 * @param otherSlots slots already used on readingDate, excluding the reading being edited
 * @returns          { field: message } — empty when valid
 */
export function validateReadingForm({ readingDate, slot, value }, otherSlots = []) {
  const errors = {}
  const raw = String(value ?? '').trim()

  if (!raw) errors.value = MESSAGES.valueRequired
  else if (!/^-?\d+(\.\d+)?$/.test(raw)) errors.value = MESSAGES.valueInvalid
  else if (!/^-?\d+$/.test(raw)) errors.value = MESSAGES.valueWhole
  else if (Number(raw) < MIN_VALUE || Number(raw) > MAX_VALUE) errors.value = MESSAGES.valueRange

  if (!readingDate) errors.readingDate = MESSAGES.dateRequired
  else if (!isValidDateString(readingDate)) errors.readingDate = MESSAGES.dateInvalid
  else if (readingDate > todayLocal()) errors.readingDate = MESSAGES.dateFuture
  else if (otherSlots.length >= MAX_READINGS_PER_DAY) errors.readingDate = MESSAGES.dailyLimit

  // A full day makes the slot irrelevant — show only the daily limit message
  if (errors.readingDate === MESSAGES.dailyLimit) return errors
  if (!slot) errors.slot = MESSAGES.slotRequired
  else if (!errors.readingDate && otherSlots.includes(slot)) errors.slot = duplicateSlotMessage(slot)

  return errors
}
