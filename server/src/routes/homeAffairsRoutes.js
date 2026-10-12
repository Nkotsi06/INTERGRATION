const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const controller = require('../controllers/homeAffairsController');

router.use(authMiddleware, roleMiddleware(['HOME_AFFAIRS']));

// Search & read
router.get('/search', controller.search);
router.get('/citizen/:id', controller.getById);
router.get('/citizens/:id/photo', controller.getCitizenPhoto);

// Registration queue
router.get('/registrations', controller.getRegistrations);
router.get('/registrations/:id', controller.getRegistrationById);
router.put('/registrations/:id/complete', controller.completeRecord);

// Records
router.put('/citizen/:id', controller.update);
router.post('/citizen/:id/verify', controller.verify);
router.get('/citizen/:id/documents', controller.getDocuments);
router.get('/citizen/:id/biometrics', controller.getBiometrics);

// Dashboard and reports
router.get('/stats', controller.getStats);
router.get('/reports', controller.getReports);

module.exports = router;