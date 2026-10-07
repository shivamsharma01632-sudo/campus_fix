/**
 * Input Validation Middleware
 */

const { errorResponse } = require('../utils/response');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !name.trim()) return errorResponse(res, 'Full name is required', 400);
  if (!email || !email.includes('@')) return errorResponse(res, 'Valid email is required', 400);
  if (!password || password.length < 4) return errorResponse(res, 'Password must be at least 4 characters', 400);
  next();
};

const validateLogin = (req, res, next) => {
  const { email } = req.body;
  if (!email || !email.trim()) return errorResponse(res, 'Email or username is required', 400);
  next();
};

const validateTicketCreate = (req, res, next) => {
  const title = req.body.title || req.body.description;
  if (!title || !title.trim() || title.trim().length < 3) {
    return errorResponse(res, 'Please provide an issue description (minimum 3 characters)', 400);
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTicketCreate
};
