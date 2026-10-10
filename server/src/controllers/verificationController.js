const verificationService = require('../services/verificationService');

async function confirm(req, res, next) {
  try {
    const result = await verificationService.confirmIdentity({
      password: req.body.password,
      user: req.user,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (result.success && result.token) {
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000,
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function status(req, res) {
  res.json({
    identityVerified: req.session?.identityVerified || false,
    verifiedCitizenId: req.session?.verifiedCitizenId || null,
  });
}

module.exports = { confirm, status };