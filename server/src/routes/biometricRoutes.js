const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const biometricMiddleware = require('../middleware/biometricMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const biometricController = require('../controllers/biometricController');

router.post(
  '/fingerprint',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS']),
  biometricMiddleware,
  biometricController.enrollFingerprint
);
router.post(
  '/facial',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS']),
  biometricMiddleware,
  biometricController.enrollFacial
);
router.get(
  '/:citizenId',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS', 'POLICE']),
  biometricController.get
);
router.post(
  '/:citizenId/verify-fingerprint',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS']),
  biometricMiddleware,
  biometricController.verifyFingerprint
);

module.exports = router;