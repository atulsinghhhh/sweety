const AppError = require('../utils/AppError');
const authService = require('../services/auth.service');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'Authentication required.'));
  }

  let payload;
  try {
    payload = authService.verifyToken(token);
  } catch {
    return next(new AppError(401, 'Your session has expired. Please log in again.'));
  }

  try {
    // The account may have been deleted after the token was issued
    const user = await authService.getUserById(payload.sub);
    if (!user) return next(new AppError(401, 'Your session has expired. Please log in again.'));
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = requireAuth;
