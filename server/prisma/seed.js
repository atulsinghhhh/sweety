/*
 * Seeds a demo user with realistic readings covering the whole previous
 * calendar month and the current month up to today (in APP_TIMEZONE), so every
 * report has data.
 *
 * Safe to run repeatedly: the demo user is upserted (password reset to the
 * documented value) and only that user's readings are replaced. Other users
 * are never touched.
 *
 * Usage: npm run db:seed
 */
const bcrypt = require('bcrypt');
const prisma = require('../src/config/db');
const { bcryptSaltRounds } = require('../src/config/env');
const { todayInTimezone, toDbDate, formatDbDate } = require('../src/utils/dates');

const DEMO_USER = {
  name: 'Demo Patient',
  email: 'demo@sweety.app',
  password: 'Demo@1234',
};

// Typical ranges (mg/dL) for someone with reasonably managed type 2 diabetes
const SLOT_PROFILES = {
  MORNING: { base: 108, spread: 22 },
  AFTER_BREAKFAST: { base: 158, spread: 35 },
  AFTER_LUNCH: { base: 150, spread: 35 },
  AFTER_DINNER: { base: 145, spread: 32 },
};

// Small deterministic PRNG so the same date always produces the same readings
function mulberry32(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shiftDays(dateString, days) {
  const date = toDbDate(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDbDate(date);
}

function seedFor(dateString) {
  return Number(dateString.replaceAll('-', ''));
}

function readingsForDate(dateString) {
  const random = mulberry32(seedFor(dateString));
  const roll = random();
  // Realistic logging habits: ~10% of days skipped, some days partial
  if (roll < 0.1) return [];
  const slotCount = roll < 0.25 ? 2 : roll < 0.45 ? 3 : 4;
  const slots = Object.keys(SLOT_PROFILES);
  const chosen = slotCount === 4 ? slots : slots.filter(() => random() < slotCount / 4).slice(0, slotCount);
  if (chosen.length === 0) chosen.push('MORNING');

  return chosen.map((slot) => {
    const { base, spread } = SLOT_PROFILES[slot];
    // Occasional spikes after meals
    const spike = slot !== 'MORNING' && random() < 0.08 ? 60 + Math.round(random() * 60) : 0;
    const value = Math.round(base + (random() * 2 - 1) * spread + spike);
    return { readingDate: dateString, slot, value: Math.min(600, Math.max(40, value)) };
  });
}

function seedDateRange(today) {
  const [year, month] = today.split('-').map(Number);
  const firstOfPreviousMonth = formatDbDate(new Date(Date.UTC(year, month - 2, 1)));
  const dates = [];
  for (let date = firstOfPreviousMonth; date <= today; date = shiftDays(date, 1)) dates.push(date);
  return dates;
}

async function main() {
  const today = todayInTimezone();
  const passwordHash = await bcrypt.hash(DEMO_USER.password, bcryptSaltRounds);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { name: DEMO_USER.name, password: passwordHash },
    create: { name: DEMO_USER.name, email: DEMO_USER.email, password: passwordHash },
  });

  const readings = seedDateRange(today).flatMap(readingsForDate);

  await prisma.$transaction([
    prisma.reading.deleteMany({ where: { userId: user.id } }),
    prisma.reading.createMany({
      data: readings.map((reading) => ({ ...reading, readingDate: toDbDate(reading.readingDate), userId: user.id })),
    }),
  ]);

  console.log(`Seeded ${DEMO_USER.email} with ${readings.length} readings (${readings[0]?.readingDate} → ${today}).`);
  console.log(`Log in with: ${DEMO_USER.email} / ${DEMO_USER.password}`);
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
