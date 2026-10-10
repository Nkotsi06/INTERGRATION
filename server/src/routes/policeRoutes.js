const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const policeController = require('../controllers/policeController');

router.post('/cases', authMiddleware, verificationMiddleware, policeController.reportCase);
router.get('/cases', authMiddleware, verificationMiddleware, policeController.getMyCases);
router.get('/cases/:caseNumber', authMiddleware, verificationMiddleware, policeController.getCaseByNumber);

router.get('/staff/cases', authMiddleware, roleMiddleware(['POLICE']), policeController.getStaffCases);
router.put('/staff/cases/:id', authMiddleware, roleMiddleware(['POLICE']), policeController.updateCase);
router.post('/staff/cases/:id/updates', authMiddleware, roleMiddleware(['POLICE']), policeController.addCaseUpdate);

module.exports = router;