const AppError = require('../utils/AppError');
const { nodeEnv } = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ error: { message: 'Route not found' } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const body = { message: err.message };
    if (err.field) body.field = err.field;
    return res.status(err.statusCode).json({ error: body });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Invalid JSON body' } });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: { message: 'Request body is too large.' } });
  }

  // Never leak database or stack details to the client
  if (nodeEnv !== 'test') console.error(err);
  return res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } });
}

module.exports = { notFound, errorHandler };
