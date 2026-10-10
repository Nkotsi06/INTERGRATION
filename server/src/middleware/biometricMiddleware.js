function biometricMiddleware(req, res, next) {
  if (!process.env.BIOMETRIC_FINGERPRINT_ENABLED && !process.env.BIOMETRIC_FACIAL_ENABLED) {
    return res.status(503).json({ message: 'Biometric features are disabled' });
  }
  next();
}

module.exports = biometricMiddleware;