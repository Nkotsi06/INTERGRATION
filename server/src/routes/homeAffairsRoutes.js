const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const controller = require('../controllers/homeAffairsController');
const appController = require('../controllers/homeAffairsApplicationController');

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
router.put('/citizen/:id/biometrics', controller.updateBiometrics);

// Employment history  ← NEW
router.post('/citizen/:id/employment', controller.recordEmployment);
router.put('/citizen/:id/employment/:employmentId', controller.updateEmployment);

// Certificates
router.get('/citizen/:id/certificates', controller.getCertificates);
router.post('/citizen/:id/certificates/birth', controller.issueBirthCertificate);
router.post('/citizen/:id/certificates/death', controller.issueDeathCertificate);
router.post('/citizen/:id/certificates/marriage', controller.issueMarriageCertificate);

// Dashboard and reports
router.get('/stats', controller.getStats);
router.get('/reports', controller.getReports);

// Applications processing and collection
router.get('/applications', appController.listApplications);
router.get('/applications/:id', appController.getApplication);
router.put('/applications/:id/status', appController.updateStatus);
router.post('/applications/:id/collect', appController.recordCollection);

module.exports = router;