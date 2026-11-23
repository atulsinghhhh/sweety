const { z } = require('zod');

const email = z
  .string({ required_error: 'Please enter your email address.', invalid_type_error: 'Please enter a valid email address.' })
  .trim()
  .toLowerCase()
  .min(1, 'Please enter your email address.')
  .max(254, 'Please enter a valid email address.')
  .email('Please enter a valid email address.');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Please enter your name.', invalid_type_error: 'Please enter your name.' })
    .trim()
    .min(1, 'Please enter your name.')
    .max(100, 'Name must be 100 characters or fewer.'),
  email,
  password: z
    .string({ required_error: 'Please enter a password.', invalid_type_error: 'Please enter a password.' })
    .min(8, 'Password must be at least 8 characters.')
    // bcrypt silently ignores bytes beyond 72
    .max(72, 'Password must be 72 characters or fewer.'),
});

const loginSchema = z.object({
  email,
  password: z
    .string({ required_error: 'Please enter your password.', invalid_type_error: 'Please enter your password.' })
    .min(1, 'Please enter your password.'),
});

module.exports = { registerSchema, loginSchema };
