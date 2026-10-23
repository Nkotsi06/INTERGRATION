const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const staffController = require('../controllers/financeStaffController');
const registerController = require('../controllers/financeRegistersController');

router.get('/staff/employers', authMiddleware, roleMiddleware(['FINANCE', 'ADMIN']), registerController.listEmployers);
router.post('/staff/employers', authMiddleware, roleMiddleware(['ADMIN']), registerController.createEmployer);
router.put('/staff/employers/:id', authMiddleware, roleMiddleware(['ADMIN']), registerController.updateEmployer);

router.get('/staff/government-employees', authMiddleware, roleMiddleware(['FINANCE']), registerController.listEmployees);
router.post('/staff/government-employees', authMiddleware, roleMiddleware(['FINANCE']), registerController.createEmployee);
router.put('/staff/government-employees/:id', authMiddleware, roleMiddleware(['FINANCE']), registerController.updateEmployee);
router.post('/staff/government-employees/import', authMiddleware, roleMiddleware(['FINANCE']), registerController.importEmployees);

router.get('/staff/government-debts', authMiddleware, roleMiddleware(['FINANCE']), registerController.listDebts);
router.post('/staff/government-debts', authMiddleware, roleMiddleware(['FINANCE']), registerController.createDebt);
router.patch('/staff/government-debts/:id/clear', authMiddleware, roleMiddleware(['FINANCE']), registerController.clearDebt);

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