const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const passportController = require('../controllers/passportController');

router.post('/apply', authMiddleware, verificationMiddleware, passportController.apply);
router.get('/current', authMiddleware, verificationMiddleware, passportController.getCurrentPassport);
router.get('/applications', authMiddleware, verificationMiddleware, passportController.getMyApplications);
router.get('/applications/:ref', authMiddleware, verificationMiddleware, passportController.getApplicationByRef);

// Staff — dashboard stats  ← NEW
router.get('/staff/stats', authMiddleware, roleMiddleware(['PASSPORT']), passportController.getStaffStats);

router.get('/staff/applications', authMiddleware, roleMiddleware(['PASSPORT']), passportController.getStaffApplications);
router.put('/staff/applications/:id', authMiddleware, roleMiddleware(['PASSPORT']), passportController.processApplication);
router.post('/issue/:id', authMiddleware, roleMiddleware(['PASSPORT']), passportController.issuePassport);

module.exports = router;