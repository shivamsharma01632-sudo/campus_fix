/**
 * CampusFix Logger Utility
 * Sanitizes logs to prevent sensitive credentials/secrets from leaking
 */

const SENSITIVE_KEYS = ['password', 'jwt_secret', 'ai_api_key', 'token', 'authorization', 'db_password'];

function sanitize(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clean[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const logger = {
  info: (msg, meta) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${msg}`, meta ? sanitize(meta) : '');
  },
  warn: (msg, meta) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${msg}`, meta ? sanitize(meta) : '');
  },
  error: (msg, error) => {
    const timestamp = new Date().toISOString();
    const errMsg = error && error.message ? error.message : error;
    console.error(`[${timestamp}] [ERROR] ${msg}: ${errMsg}`);
  },
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [DEBUG] ${msg}`, meta ? sanitize(meta) : '');
    }
  }
};

module.exports = logger;
