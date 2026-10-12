const isProduction = process.env.NODE_ENV === 'production';

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 90 * 24 * 60 * 60 * 1000,
  path: '/',
};

module.exports = { authCookieOptions };