const isProduction = process.env.NODE_ENV === 'production';

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // Cross-origin (Vercel ↔ Render) REQUIRES sameSite:'none' + secure:true,
  // otherwise the browser silently drops the cookie on every request.
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
};

module.exports = { authCookieOptions };