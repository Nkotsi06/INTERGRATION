const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register-national-id', authController.registerWithNationalId);

router.post('/login', authController.login);
router.post('/staff/login', authController.staffLogin);
router.post('/admin/login', authController.adminLogin);
router.post('/logout', authController.logout);
router.get('/session', (req, res, next) => {
  const hasToken = req.cookies?.token ||
    req.headers.authorization?.startsWith('Bearer ');
  if (!hasToken) {
    return res.json({
      user: null,
      identityVerified: false,
      verifiedCitizenId: null,
    });
  }
  return authMiddleware(req, res, next);
}, authController.getSession);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;