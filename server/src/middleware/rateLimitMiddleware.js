const rateLimit = require('express-rate-limit');

// In development, use a much higher limit so debugging is not blocked.
// In production, use the values from .env (or fall back to safe defaults).
const isDevelopment = process.env.NODE_ENV !== 'production';

// Public endpoints that should NEVER be rate-limited during development
// (auth session check, public settings, language lists, translations).
const DEVELOPMENT_SKIP_PATHS = [
  '/settings',
  '/auth/session',
  '/auth/login',
  '/auth/register',
  '/auth/staff/login',
  '/auth/admin/login',
];

const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: isDevelopment
    ? 5000
    : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (!isDevelopment) return false;
    return DEVELOPMENT_SKIP_PATHS.some((path) => req.path.startsWith(path));
  },
  message: { message: 'Too many requests, please try again later.' },
});

module.exports = rateLimitMiddleware;