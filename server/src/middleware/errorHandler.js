const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message =
    statusCode < 500 || process.env.NODE_ENV !== 'production'
      ? err.message
      : 'An unexpected error occurred';

  res.status(statusCode).json({ message });
}

module.exports = errorHandler;