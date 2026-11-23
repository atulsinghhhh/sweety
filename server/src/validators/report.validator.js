const { z } = require('zod');
const { isValidDateString } = require('../utils/dates');
const { MESSAGES } = require('../utils/readingRules');

// date is optional and defaults to today (in APP_TIMEZONE) in the controller
const reportQuerySchema = z.object({
  date: z
    .string()
    .optional()
    .refine((value) => value === undefined || isValidDateString(value), { message: MESSAGES.dateInvalid }),
});

module.exports = { reportQuerySchema };
