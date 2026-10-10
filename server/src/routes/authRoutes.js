const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { emailRule, passwordRule, usernameRule } = require('../utils/validators');

router.post('/register',
  usernameRule, emailRule, passwordRule, validationMiddleware,
  authController.register
);

router.post('/login', authController.login);
router.post('/staff/login', authController.staffLogin);
router.post('/admin/login', authController.adminLogin);
router.post('/logout', authController.logout);
router.get('/session', authMiddleware, authController.getSession);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;