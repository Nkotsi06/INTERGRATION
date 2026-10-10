const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');
const { signToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password, role } = req.body;
    const result = await authService.login({ username, password, expectedRoleGroup: role });

    // Set token as HTTP-only cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

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
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}

async function getSession(req, res, next) {
  try {
    const session = await authService.getSession(req.user.userId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    // Placeholder — in production, send a reset email
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, staffLogin, adminLogin, logout, getSession, forgotPassword };