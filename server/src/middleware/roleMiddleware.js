function roleMiddleware(allowedRoles) {
  const normalized = allowedRoles.map((r) => String(r).trim().toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = String(req.user.role || '').trim().toUpperCase();

    if (!normalized.includes(userRole)) {
      console.warn('[roleMiddleware] Access denied', {
        userRole: req.user.role,
        normalizedUserRole: userRole,
        allowedRoles: normalized,
        userId: req.user.userId,
      });
      return res.status(403).json({
        message: `Access denied for role "${req.user.role}"`,
      });
    }

    next();
  };
}

module.exports = roleMiddleware;