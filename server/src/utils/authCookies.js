const authCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 90 * 24 * 60 * 60 * 1000,
  path: '/',
};

module.exports = { authCookieOptions };