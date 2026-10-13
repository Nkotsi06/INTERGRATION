const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const policeController = require('../controllers/policeController');

// Citizen — cases
router.post('/cases', authMiddleware, verificationMiddleware, policeController.reportCase);
router.get('/cases', authMiddleware, verificationMiddleware, policeController.getMyCases);
router.get('/cases/:caseNumber', authMiddleware, verificationMiddleware, policeController.getCaseByNumber);

// Citizen — clearance certificate
router.post('/clearance', authMiddleware, verificationMiddleware, policeController.requestClearance);

// Citizen — criminal record
router.post('/criminal-records', authMiddleware, verificationMiddleware, policeController.requestCriminalRecord);
router.get('/criminal-records', authMiddleware, policeController.getMyCriminalRecords);

// Staff
router.get('/staff/cases', authMiddleware, roleMiddleware(['POLICE']), policeController.getStaffCases);
router.put('/staff/cases/:id', authMiddleware, roleMiddleware(['POLICE']), policeController.updateCase);
router.post('/staff/cases/:id/updates', authMiddleware, roleMiddleware(['POLICE']), policeController.addCaseUpdate);

router.get('/staff/criminal-records', authMiddleware, roleMiddleware(['POLICE']), policeController.getStaffCriminalRecords);
router.put('/staff/criminal-records/:id', authMiddleware, roleMiddleware(['POLICE']), policeController.processCriminalRecord);

module.exports = router;