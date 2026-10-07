/**
 * CampusFix Request Body Validators
 */

const { ROLES, TICKET_STATUS, PRIORITIES } = require('./constants');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }
  if (!body.email || !EMAIL_REGEX.test(body.email)) {
    errors.push('A valid college email address is required');
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (body.role && !Object.values(ROLES).includes(body.role.toUpperCase()) && !Object.values(ROLES).includes(body.role.toLowerCase())) {
    errors.push(`Role must be one of: ${Object.values(ROLES).join(', ')}`);
  }
  return { isValid: errors.length === 0, errors };
}

function validateLogin(body) {
  const errors = [];
  if (!body.email || !EMAIL_REGEX.test(body.email)) {
    errors.push('A valid email address is required');
  }
  if (!body.password || typeof body.password !== 'string') {
    errors.push('Password is required');
  }
  return { isValid: errors.length === 0, errors };
}

function validateCreateTicket(body) {
  const errors = [];
  const text = body.description || body.title;
  if (!text || typeof text !== 'string' || text.trim().length < 3) {
    errors.push('Issue description or title is required (minimum 3 characters)');
  }
  if (body.priority && !Object.values(PRIORITIES).map(p => p.toLowerCase()).includes(body.priority.toLowerCase())) {
    errors.push(`Priority must be one of: ${Object.values(PRIORITIES).join(', ')}`);
  }
  return { isValid: errors.length === 0, errors };
}

function validateUpdateTicket(body) {
  const errors = [];
  if (body.status && !Object.values(TICKET_STATUS).map(s => s.toLowerCase()).includes(body.status.toLowerCase())) {
    errors.push(`Status must be one of: ${Object.values(TICKET_STATUS).join(', ')}`);
  }
  if (body.priority && !Object.values(PRIORITIES).map(p => p.toLowerCase()).includes(body.priority.toLowerCase())) {
    errors.push(`Priority must be one of: ${Object.values(PRIORITIES).join(', ')}`);
  }
  return { isValid: errors.length === 0, errors };
}

function validateCreateAsset(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('Asset name is required');
  }
  if (!body.location || typeof body.location !== 'string') {
    errors.push('Campus location is required');
  }
  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateTicket,
  validateUpdateTicket,
  validateCreateAsset
};
