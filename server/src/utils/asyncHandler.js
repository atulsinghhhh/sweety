// Express 4 does not forward rejected promises to the error handler on its own
module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
