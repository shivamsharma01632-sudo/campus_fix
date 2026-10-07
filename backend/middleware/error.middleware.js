/**
 * Centralized Error Handling Middleware
 * Guarantees standard JSON error format: { success: false, message: ... }
 */

const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(`Unhandled Error on ${req.method} ${req.url}`, err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
