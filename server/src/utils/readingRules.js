const SLOT_LABELS = {
  MORNING: 'Morning (fasting)',
  AFTER_BREAKFAST: 'After breakfast',
  AFTER_LUNCH: 'After lunch',
  AFTER_DINNER: 'After dinner',
};

const SLOTS = Object.keys(SLOT_LABELS);

const MIN_VALUE = 40;
const MAX_VALUE = 600;
const MAX_READINGS_PER_DAY = 4;

const MESSAGES = {
  valueRequired: 'Please enter a glucose value.',
  valueInvalid: 'Please enter a valid glucose value.',
  valueWhole: 'Value must be a whole number.',
  valueRange: `Value must be between ${MIN_VALUE} and ${MAX_VALUE} mg/dl.`,
  dateRequired: 'Please select a date.',
  dateInvalid: 'Please enter a valid date (YYYY-MM-DD).',
  dateFuture: 'Date cannot be in the future.',
  slotInvalid: 'Please select a valid time slot.',
  dailyLimit: `You can add only ${MAX_READINGS_PER_DAY} readings per day.`,
  notFound: 'Reading not found.',
};

function duplicateSlotMessage(slot) {
  const label = SLOT_LABELS[slot];
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
  return `You already have ${article} ${label} reading for this date.`;
}

module.exports = {
  SLOT_LABELS,
  SLOTS,
  MIN_VALUE,
  MAX_VALUE,
  MAX_READINGS_PER_DAY,
  MESSAGES,
  duplicateSlotMessage,
};
