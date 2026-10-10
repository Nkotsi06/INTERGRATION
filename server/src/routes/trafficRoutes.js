const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const trafficController = require('../controllers/trafficController');

// Citizen routes (require session verification)
router.get('/licence', authMiddleware, verificationMiddleware, trafficController.getLicence);
router.post('/licence/renew', authMiddleware, verificationMiddleware, trafficController.renewLicence);
router.post('/test/book', authMiddleware, verificationMiddleware, trafficController.bookDrivingTest);
router.get('/appointments', authMiddleware, verificationMiddleware, trafficController.getAppointments);
router.delete('/appointments/:id', authMiddleware, verificationMiddleware, trafficController.cancelAppointment);

// Staff routes
router.get('/staff/applications', authMiddleware, roleMiddleware(['TRAFFIC']), trafficController.getStaffApplications);
router.put('/staff/applications/:id', authMiddleware, roleMiddleware(['TRAFFIC']), trafficController.processApplication);
router.post('/issue-licence/:id', authMiddleware, roleMiddleware(['TRAFFIC']), trafficController.issueLicence);

module.exports = router;