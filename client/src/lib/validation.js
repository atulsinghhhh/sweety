const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Please enter your email address.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Please enter a valid email address.'
  if (!password) errors.password = 'Please enter your password.'
  return errors
}

export function validateRegister({ name, email, password }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Please enter your name.'
  else if (name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer.'
  Object.assign(errors, validateLogin({ email, password: 'x' }))
  if (!password) errors.password = 'Please enter a password.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  else if (password.length > 72) errors.password = 'Password must be 72 characters or fewer.'
  return errors
}
