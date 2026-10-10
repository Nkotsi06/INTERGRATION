// Ensures that citizens must have verified identity in the current session
// before accessing protected services.

function verificationMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Staff and Admin do not require session verification
  if (req.user.role !== 'CITIZEN') {
    return next();
  }

  if (!req.session?.identityVerified) {
    return res.status(403).json({
      message: 'Identity verification required',
      code: 'IDENTITY_VERIFICATION_REQUIRED',
    });
  }

  next();
}

module.exports = verificationMiddleware;