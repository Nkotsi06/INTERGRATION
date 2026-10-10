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
    };
    req.session = {
      identityVerified: decoded.identityVerified || false,
      verifiedCitizenId: decoded.verifiedCitizenId || null,
    };
    next();
  } catch (err) {
    logger.warn('Invalid token:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;