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

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: (decoded.role || '').trim(),
      citizenId: decoded.citizenId ?? null,
      mustChangePassword: decoded.mustChangePassword === true,
    };
    req.session = {
      identityVerified: decoded.identityVerified || false,
      verifiedCitizenId: decoded.verifiedCitizenId || null,
    };
    const requestPath = req.originalUrl.split('?')[0];
    const isSessionRequest = req.method === 'GET' && requestPath === '/api/auth/session';
    const isPasswordChange = req.method === 'PUT' &&
      requestPath === '/api/citizen/change-password';
    if (req.user.mustChangePassword && !isSessionRequest && !isPasswordChange) {
      return res.status(403).json({
        code: 'PASSWORD_CHANGE_REQUIRED',
        message: 'Change your temporary password before accessing government services.',
      });
    }
    next();
  } catch (err) {
    logger.warn('Invalid token:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;