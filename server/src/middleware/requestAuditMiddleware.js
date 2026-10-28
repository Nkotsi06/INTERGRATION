const { randomUUID } = require('crypto');
const logger = require('../utils/logger');

function requestAuditMiddleware(req, res, next) {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const applicationRequest =
      req.originalUrl.split('?')[0].match(/^\/api\/pensions\/staff\/applications\/([^/]+)$/);
    logger.info('Pension or verification request completed', {
      requestId,
      method: req.method,
      area: req.originalUrl.startsWith('/api/pensions') ? 'pensions' : 'verification',
      userId: req.user?.userId || null,
      applicationId: applicationRequest?.[1] || null,
      outcome: res.statusCode,
    });
  });

  next();
}

module.exports = requestAuditMiddleware;
