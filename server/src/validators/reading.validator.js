const { z } = require('zod');
const { SLOTS, MIN_VALUE, MAX_VALUE, MESSAGES } = require('../utils/readingRules');
const { isValidDateString, isFutureDate } = require('../utils/dates');

function fail(ctx, message) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  return z.NEVER;
}

const isBlank = (raw) => raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '');

const glucoseValue = z.unknown().transform((raw, ctx) => {
  if (isBlank(raw)) return fail(ctx, MESSAGES.valueRequired);
  const value = typeof raw === 'string' ? Number(raw.trim()) : raw;
  if (typeof value !== 'number' || !Number.isFinite(value)) return fail(ctx, MESSAGES.valueInvalid);
  if (!Number.isInteger(value)) return fail(ctx, MESSAGES.valueWhole);
  if (value < MIN_VALUE || value > MAX_VALUE) return fail(ctx, MESSAGES.valueRange);
  return value;
});

const pastOrTodayDate = z.unknown().transform((raw, ctx) => {
  if (isBlank(raw)) return fail(ctx, MESSAGES.dateRequired);
  if (!isValidDateString(raw)) return fail(ctx, MESSAGES.dateInvalid);
  if (isFutureDate(raw)) return fail(ctx, MESSAGES.dateFuture);
  return raw;
});

const optionalDate = z
  .string()
  .optional()
  .refine((value) => value === undefined || isValidDateString(value), { message: MESSAGES.dateInvalid });

const slot = z.enum(SLOTS, { errorMap: () => ({ message: MESSAGES.slotInvalid }) });

// userId is deliberately absent: ownership always comes from the JWT, and
// unknown keys are stripped by Zod.
const readingBodySchema = z.object({
  readingDate: pastOrTodayDate,
  slot,
  value: glucoseValue,
});

const readingIdParamsSchema = z.object({
  id: z.string().uuid(MESSAGES.notFound),
});

const listReadingsQuerySchema = z
  .object({
    date: optionalDate,
    from: optionalDate,
    to: optionalDate,
    limit: z.coerce
      .number({ invalid_type_error: 'Limit must be a number.' })
      .int('Limit must be a whole number.')
      .min(1, 'Limit must be between 1 and 100.')
      .max(100, 'Limit must be between 1 and 100.')
      .optional(),
  })
  .refine((q) => !(q.from && q.to) || q.from <= q.to, {
    message: '"from" date must be on or before "to" date.',
    path: ['from'],
  });

module.exports = { readingBodySchema, readingIdParamsSchema, listReadingsQuerySchema };
