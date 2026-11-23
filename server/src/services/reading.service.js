const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { toDbDate, formatDbDate } = require('../utils/dates');
const { SLOT_LABELS, MAX_READINGS_PER_DAY, MESSAGES, duplicateSlotMessage } = require('../utils/readingRules');

function serializeReading(reading) {
  return {
    id: reading.id,
    readingDate: formatDbDate(reading.readingDate),
    slot: reading.slot,
    slotLabel: SLOT_LABELS[reading.slot],
    value: reading.value,
    createdAt: reading.createdAt,
    updatedAt: reading.updatedAt,
  };
}

// Serialises all writes for one user's day. Combined with checking inside the
// same transaction, this keeps the daily rules correct under concurrent
// requests; the unique (user, date, slot) constraint remains the final backstop.
async function lockUserDay(tx, userId, readingDate) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${userId}:${readingDate}`}, 0))`;
}

async function assertDayRules(tx, { userId, readingDate, slot, excludeId }) {
  const sameDay = await tx.reading.findMany({
    where: {
      userId,
      readingDate: toDbDate(readingDate),
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { slot: true },
  });

  if (sameDay.length >= MAX_READINGS_PER_DAY) {
    throw new AppError(409, MESSAGES.dailyLimit, 'readingDate');
  }
  if (sameDay.some((reading) => reading.slot === slot)) {
    throw new AppError(409, duplicateSlotMessage(slot), 'slot');
  }
}

function rethrowConstraintError(slot) {
  return (err) => {
    if (err.code === 'P2002') throw new AppError(409, duplicateSlotMessage(slot), 'slot');
    throw err;
  };
}

async function createReading(userId, { readingDate, slot, value }) {
  const reading = await prisma
    .$transaction(async (tx) => {
      await lockUserDay(tx, userId, readingDate);
      await assertDayRules(tx, { userId, readingDate, slot });
      return tx.reading.create({
        data: { userId, readingDate: toDbDate(readingDate), slot, value },
      });
    })
    .catch(rethrowConstraintError(slot));

  return serializeReading(reading);
}

async function listReadings(userId, { date, from, to, limit }) {
  const readingDate = date
    ? toDbDate(date)
    : from || to
      ? { ...(from && { gte: toDbDate(from) }), ...(to && { lte: toDbDate(to) }) }
      : undefined;

  const readings = await prisma.reading.findMany({
    where: { userId, ...(readingDate && { readingDate }) },
    // The ReadingSlot enum is declared in chronological order
    orderBy: [{ readingDate: 'desc' }, { slot: 'asc' }],
    ...(limit && { take: limit }),
  });

  return readings.map(serializeReading);
}

async function getReading(userId, id) {
  // Filtering by userId means another user's reading is indistinguishable from a missing one
  const reading = await prisma.reading.findFirst({ where: { id, userId } });
  if (!reading) throw new AppError(404, MESSAGES.notFound);
  return serializeReading(reading);
}

async function updateReading(userId, id, { readingDate, slot, value }) {
  const reading = await prisma
    .$transaction(async (tx) => {
      const existing = await tx.reading.findFirst({ where: { id, userId }, select: { id: true } });
      if (!existing) throw new AppError(404, MESSAGES.notFound);

      await lockUserDay(tx, userId, readingDate);
      await assertDayRules(tx, { userId, readingDate, slot, excludeId: id });
      return tx.reading.update({
        where: { id },
        data: { readingDate: toDbDate(readingDate), slot, value },
      });
    })
    .catch(rethrowConstraintError(slot));

  return serializeReading(reading);
}

async function deleteReading(userId, id) {
  const { count } = await prisma.reading.deleteMany({ where: { id, userId } });
  if (count === 0) throw new AppError(404, MESSAGES.notFound);
}

module.exports = {
  serializeReading,
  createReading,
  listReadings,
  getReading,
  updateReading,
  deleteReading,
};
