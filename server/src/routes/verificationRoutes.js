const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const verificationController = require('../controllers/verificationController');

router.post('/confirm', authMiddleware, verificationController.confirm);
router.get('/status', authMiddleware, verificationController.status);

module.exports = router;