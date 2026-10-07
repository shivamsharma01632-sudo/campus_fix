/**
 * Role-Based Authorization Middleware
 * Enforces access control strictly for STUDENT, TECHNICIAN, and ADMIN roles
 */

const { errorResponse } = require('../utils/response');

/**
 * Middleware factory restricting endpoint access to specified roles
 * @param {...string} allowedRoles - Permitted roles (STUDENT, TECHNICIAN, ADMIN)
 */
const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat().map(r => String(r).toUpperCase());

  return (req, res, next) => {
    // Missing authentication
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const userRole = String(req.user.role).toUpperCase();

    // Check if user's role is permitted
    if (!roles.includes(userRole)) {
      return errorResponse(res, 'Access denied', 403);
    }

    next();
  };
};

authorize.authorize = authorize;
module.exports = authorize;
module.exports.authorize = authorize;
module.exports.roleMiddleware = authorize;
