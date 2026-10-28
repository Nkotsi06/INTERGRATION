const verificationService = require('../services/verificationService');
const { authCookieOptions } = require('../utils/authCookies');

async function confirm(req, res, next) {
  try {
    if (typeof req.body?.password !== 'string' || req.body.password.length === 0) {
      return res.status(400).json({
        code: 'INVALID_PASSWORD_INPUT',
        message: 'Enter your password to continue.',
      });
    }

    const result = await verificationService.confirmIdentity({
      password: req.body.password,
      user: req.user,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (result.success && result.token) {
      res.cookie('token', result.token, authCookieOptions);
    }

    if (!result.success && result.reason === 'wrong_password') {
      return res.status(422).json({
        code: 'WRONG_PASSWORD',
        message: 'The password is incorrect. Please try again.',
      });
    }
    if (!result.success && result.reason === 'invalid_input') {
      return res.status(400).json({
        code: 'INVALID_PASSWORD_INPUT',
        message: 'Enter your password to continue.',
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