const bcrypt = require('bcrypt');

const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

async function hashPassword(password) {
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, verifyPassword };