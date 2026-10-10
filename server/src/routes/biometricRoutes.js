const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const biometricMiddleware = require('../middleware/biometricMiddleware');
const biometricController = require('../controllers/biometricController');

router.post('/fingerprint', authMiddleware, biometricMiddleware, biometricController.enrollFingerprint);
router.post('/facial', authMiddleware, biometricMiddleware, biometricController.enrollFacial);
router.get('/:citizenId', authMiddleware, biometricController.get);
router.post('/:citizenId/verify-fingerprint', authMiddleware, biometricMiddleware, biometricController.verifyFingerprint);

module.exports = router;