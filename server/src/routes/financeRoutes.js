const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const financeController = require('../controllers/financeController');

router.get('/tax/profile', authMiddleware, verificationMiddleware, financeController.getTaxProfile);
router.post('/tax/register', authMiddleware, verificationMiddleware, financeController.registerTax);
router.post('/payment', authMiddleware, verificationMiddleware, financeController.makePayment);
router.get('/payments', authMiddleware, verificationMiddleware, financeController.getPayments);
router.get('/tax/clearance', authMiddleware, verificationMiddleware, financeController.getTaxClearance);
router.get('/tax/clearance/:id/download', authMiddleware, verificationMiddleware, financeController.downloadTaxClearance);

router.get('/staff/registrations', authMiddleware, roleMiddleware(['FINANCE']), financeController.getStaffRegistrations);
router.put('/staff/registrations/:id', authMiddleware, roleMiddleware(['FINANCE']), financeController.processRegistration);

module.exports = router;