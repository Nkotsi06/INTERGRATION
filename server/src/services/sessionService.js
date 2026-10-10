const { signToken } = require('../utils/jwt');

// Session is stateless (JWT-based). Identity verification lives in the token.
// When verification succeeds, we issue a new token with identityVerified = true
// for the same session lifetime.

function buildVerifiedSession(user, citizenId) {
  return signToken({
    userId: user.userId,
    username: user.username,
    role: user.role,
    citizenId: user.citizenId || null,
    identityVerified: true,
    verifiedCitizenId: citizenId,
  });
}

module.exports = { buildVerifiedSession };