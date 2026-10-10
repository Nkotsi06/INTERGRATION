const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const pensionsController = require('../controllers/pensionsController');

router.get('/info', authMiddleware, verificationMiddleware, pensionsController.getPensionInfo);
router.post('/verify', authMiddleware, verificationMiddleware, pensionsController.verifyExistence);
router.get('/verifications', authMiddleware, verificationMiddleware, pensionsController.getVerificationHistory);

router.get('/death-check', authMiddleware, roleMiddleware(['PENSIONS']), pensionsController.checkDeathCertificate);
router.get('/staff/verifications', authMiddleware, roleMiddleware(['PENSIONS']), pensionsController.getStaffVerifications);
router.put('/staff/verifications/:id', authMiddleware, roleMiddleware(['PENSIONS']), pensionsController.processVerification);

module.exports = router;