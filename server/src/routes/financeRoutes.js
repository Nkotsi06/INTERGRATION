const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const staffController = require('../controllers/financeStaffController');

router.get('/staff/treasury',        authMiddleware, roleMiddleware(['FINANCE']), staffController.getTreasury);
router.get('/staff/treasury/stats',  authMiddleware, roleMiddleware(['FINANCE']), staffController.getTreasuryStats);

router.get('/staff/budget',          authMiddleware, roleMiddleware(['FINANCE']), staffController.getBudget);
router.get('/staff/budget/stats',    authMiddleware, roleMiddleware(['FINANCE']), staffController.getBudgetStats);

router.get('/staff/debt',            authMiddleware, roleMiddleware(['FINANCE']), staffController.getDebt);
router.get('/staff/debt/stats',      authMiddleware, roleMiddleware(['FINANCE']), staffController.getDebtStats);

router.get('/staff/procurement',       authMiddleware, roleMiddleware(['FINANCE']), staffController.getProcurement);
router.get('/staff/procurement/stats', authMiddleware, roleMiddleware(['FINANCE']), staffController.getProcurementStats);

router.get('/staff/audit-findings',       authMiddleware, roleMiddleware(['FINANCE']), staffController.getAuditFindings);
router.get('/staff/audit-findings/stats', authMiddleware, roleMiddleware(['FINANCE']), staffController.getAuditStats);

module.exports = router;