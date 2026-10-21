const authService = require('../services/authService');
const { authCookieOptions } = require('../utils/authCookies');

async function registerWithNationalId(req, res, next) {
  try {
    const result = await authService.registerWithNationalId(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, nationalId, password, role } = req.body;
    const result = await authService.login({
      username,
      nationalId,
      password,
      expectedRoleGroup: role,
    });
    res.cookie('token', result.token, authCookieOptions);
    res.json(result);
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
}

async function staffLogin(req, res, next) {
  req.body.role = 'STAFF';
  return login(req, res, next);
}

async function adminLogin(req, res, next) {
  req.body.role = 'ADMIN';
  return login(req, res, next);
}

async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
}

async function getSession(req, res, next) {
  try {
    const session = await authService.getSession(req.user.userId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({
      ...session,
      identityVerified: req.session?.identityVerified || false,
      verifiedCitizenId: req.session?.verifiedCitizenId || null,
    });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerWithNationalId,
  login,
  staffLogin,
  adminLogin,
  logout,
  getSession,
  forgotPassword,
};