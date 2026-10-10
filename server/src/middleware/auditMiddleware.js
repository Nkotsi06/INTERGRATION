const auditService = require('../services/auditService');

function auditMiddleware(action, getRecordId) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      if (res.statusCode < 400 && req.user) {
        try {
          const recordId = getRecordId ? getRecordId(req, body) : null;
          await auditService.log({
            userId: req.user.userId,
            username: req.user.username,
            action,
            recordId,
            result: 'SUCCESS',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          });
        } catch (err) {
          // Audit failures should not break requests
        }
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = auditMiddleware;