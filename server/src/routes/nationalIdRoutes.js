const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const nationalIdController = require('../controllers/nationalIdController');

router.use(authMiddleware, verificationMiddleware);

router.get('/auto-fill', nationalIdController.getAutoFill);
router.post('/apply', nationalIdController.submitApplication);

module.exports = router;