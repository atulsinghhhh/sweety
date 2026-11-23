const AppError = require('../utils/AppError');

// Validates req.body / req.query / req.params against Zod schemas and exposes
// the parsed (trimmed, coerced, stripped) values on req.validated.
function validate(schemas) {
  return (req, res, next) => {
    req.validated = {};
    if (schemas.body && (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body))) {
      return next(new AppError(400, 'Invalid request body.'));
    }
    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part] ?? {});
      if (!result.success) {
        const issue = result.error.issues[0];
        // Route params are resource ids: a malformed id is simply "not found"
        if (part === 'params') return next(new AppError(404, issue.message));
        return next(new AppError(400, issue.message, issue.path[0]));
      }
      req.validated[part] = result.data;
    }
    return next();
  };
}

module.exports = validate;
