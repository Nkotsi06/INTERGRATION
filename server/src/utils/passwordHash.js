const bcrypt = require('bcrypt');

const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

async function hashPassword(password) {
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string' || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, verifyPassword };