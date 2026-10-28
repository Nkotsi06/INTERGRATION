const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const passportController = require('../controllers/passportController');
const certificateController = require('../controllers/certificateController'); // New import

router.post('/apply', authMiddleware, verificationMiddleware, passportController.apply);
router.get('/current', authMiddleware, verificationMiddleware, passportController.getCurrentPassport);
router.get('/applications', authMiddleware, verificationMiddleware, passportController.getMyApplications);
router.get('/applications/:ref', authMiddleware, verificationMiddleware, passportController.getApplicationByRef);

// Staff — dashboard stats  ← NEW
router.get('/staff/stats', authMiddleware, roleMiddleware(['PASSPORT']), passportController.getStaffStats);

// New route for Passport staff to fetch a minor's application photo
router.get(
    '/applications/:id/photo',
    authMiddleware,
    roleMiddleware(['PASSPORT', 'HOME_AFFAIRS', 'ADMIN']),
    certificateController.getPassportPhoto
);

router.get('/staff/applications', authMiddleware, roleMiddleware(['PASSPORT']), passportController.getStaffApplications);
router.put('/staff/applications/:id', authMiddleware, roleMiddleware(['PASSPORT']), passportController.processApplication);
router.put(
  '/staff/applications/:id/ready',
  authMiddleware,
  roleMiddleware(['PASSPORT']),
  passportController.markReadyForCollection
);
router.post(
  '/staff/applications/:id/collect',
  authMiddleware,
  roleMiddleware(['PASSPORT']),
  passportController.recordCollection
);
router.post('/issue/:id', authMiddleware, roleMiddleware(['PASSPORT']), passportController.issuePassport);

module.exports = router;