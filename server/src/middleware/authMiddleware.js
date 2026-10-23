const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function authMiddleware(req, res, next) {
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = cookieToken || headerToken;

  if (!token) {
    logger.warn(
      `[authMiddleware] No token. cookies=${JSON.stringify(
        req.cookies || null
      )} authHeader=${req.headers.authorization || 'none'}`
    );
    return res.status(401).json({ message: 'Authentication required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    logger.warn('Invalid token:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = {
    userId: decoded.userId,
    username: decoded.username,
    role: (decoded.role || '').trim(),
    citizenId: decoded.citizenId ?? null,
    // FIX: expose the verified citizen id on req.user. Six controllers
    // read this field but authMiddleware never set it. sessionService
    // and authService.login already embed it in the JWT — we just
    // surface it here so citizenIdFrom(req) works uniformly.
    verifiedCitizenId: decoded.verifiedCitizenId ?? null,
    identityVerified: decoded.identityVerified === true,
    mustChangePassword: decoded.mustChangePassword === true,
  };

  // Kept for backward compatibility with routes that still read
  // req.session.identityVerified / req.session.verifiedCitizenId.
  req.session = {
    identityVerified: req.user.identityVerified,
    verifiedCitizenId: req.user.verifiedCitizenId,
  };

  const requestPath = req.originalUrl.split('?')[0];
  const isSessionRequest =
    req.method === 'GET' && requestPath === '/api/auth/session';
  const isPasswordChange =
    req.method === 'PUT' && requestPath === '/api/citizen/change-password';

  if (req.user.mustChangePassword && !isSessionRequest && !isPasswordChange) {
    return res.status(403).json({
      code: 'PASSWORD_CHANGE_REQUIRED',
      message:
        'Change your temporary password before accessing government services.',
    });
  }

  next();
}

module.exports = authMiddleware;