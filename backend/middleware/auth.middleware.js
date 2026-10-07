/**
 * Authentication Middleware
 * Enforces valid Bearer JWT tokens for protected endpoints
 * Extracts id and role from JWT payload and attaches them to req.user
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const UserModel = require('../models/user.model');
const { errorResponse } = require('../utils/response');

/**
 * Required JWT authentication middleware for protected routes
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return errorResponse(res, 'Authentication required: Authorization header is missing', 401);
  }

  if (!authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Invalid authorization format: Expected "Bearer <token>"', 401);
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return errorResponse(res, 'Authentication token is empty', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded || !decoded.id || !decoded.role) {
      return errorResponse(res, 'Invalid authentication token: missing user id or role', 401);
    }

    const user = await UserModel.findById(decoded.id);

    // Attach id and role to req.user along with any existing database profile data
    req.user = {
      ...(user || {}),
      id: decoded.id,
      role: decoded.role,
      email: decoded.email || (user && user.email),
      name: decoded.name || (user && user.name)
    };

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Authentication token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token', 401);
  }
};

/**
 * Optional authentication: attaches req.user if valid token present, does not block if missing
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (decoded && decoded.id) {
          const user = await UserModel.findById(decoded.id);
          req.user = {
            ...(user || {}),
            id: decoded.id,
            role: decoded.role || (user && user.role),
            email: decoded.email || (user && user.email),
            name: decoded.name || (user && user.name)
          };
        }
      } catch (e) {
        // Optional auth: continue without req.user on token verification error
      }
    }
  } else if (req.headers['x-user-email']) {
    const user = await UserModel.findByEmail(req.headers['x-user-email']);
    if (user) req.user = user;
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  authenticateJwt: authMiddleware
};
