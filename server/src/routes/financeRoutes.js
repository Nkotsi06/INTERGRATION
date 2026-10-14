const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const c = require('../controllers/financeController');

// ─── Citizen: tax core ───────────────────────────────────────────────
router.get('/tax/profile',      authMiddleware, c.getTaxProfile);
router.post('/tax/register',    authMiddleware, c.registerTax);
router.post('/payment',         authMiddleware, c.makePayment);
router.get('/payments',         authMiddleware, c.getPayments);
router.get('/tax/clearance',    authMiddleware, c.getTaxClearance);
router.get('/tax/clearance/download', authMiddleware, c.downloadTaxClearance);

// ─── Citizen: VAT ────────────────────────────────────────────────────
router.post('/vat',             authMiddleware, c.applyForVat);
router.get('/vat',              authMiddleware, c.getMyVat);

// ─── Citizen: tax returns ────────────────────────────────────────────
router.post('/returns',         authMiddleware, c.submitTaxReturn);
router.get('/returns',          authMiddleware, c.getMyTaxReturns);

// ─── Citizen: payment plans ──────────────────────────────────────────
router.post('/payment-plans',   authMiddleware, c.requestPaymentPlan);
router.get('/payment-plans',    authMiddleware, c.getMyPaymentPlans);

// ─── Citizen: business registration ──────────────────────────────────
router.post('/businesses',      authMiddleware, c.registerBusiness);
router.get('/businesses',       authMiddleware, c.getMyBusinesses);

// ─── Staff ───────────────────────────────────────────────────────────
router.get('/staff/registrations', authMiddleware, roleMiddleware(['FINANCE']), c.getStaffRegistrations);
router.put('/staff/registrations/:id', authMiddleware, roleMiddleware(['FINANCE']), c.processRegistration);

router.get('/staff/vat',  authMiddleware, roleMiddleware(['FINANCE']), c.getStaffVat);
router.put('/staff/vat/:id', authMiddleware, roleMiddleware(['FINANCE']), c.processVat);

router.get('/staff/returns',  authMiddleware, roleMiddleware(['FINANCE']), c.getStaffTaxReturns);
router.put('/staff/returns/:id', authMiddleware, roleMiddleware(['FINANCE']), c.reviewTaxReturn);

router.get('/staff/payment-plans',  authMiddleware, roleMiddleware(['FINANCE']), c.getStaffPaymentPlans);
router.put('/staff/payment-plans/:id', authMiddleware, roleMiddleware(['FINANCE']), c.processPaymentPlan);

router.get('/staff/businesses',  authMiddleware, roleMiddleware(['FINANCE']), c.getStaffBusinesses);
router.put('/staff/businesses/:id/approve', authMiddleware, roleMiddleware(['FINANCE']), c.approveBusiness);

const staffController = require('../controllers/financeStaffController');

router.get('/staff/treasury',        authMiddleware, roleMiddleware(['FINANCE']), staffController.getTreasury);
router.get('/staff/treasury/stats',  authMiddleware, roleMiddleware(['FINANCE']), staffController.getTreasuryStats);

router.get('/staff/budget',          authMiddleware, roleMiddleware(['FINANCE']), staffController.getBudget);
router.get('/staff/budget/stats',    authMiddleware, roleMiddleware(['FINANCE']), staffController.getBudgetStats);

router.get('/staff/debt',            authMiddleware, roleMiddleware(['FINANCE']), staffController.getDebt);
router.get('/staff/debt/stats',      authMiddleware, roleMiddleware(['FINANCE']), staffController.getDebtStats);

router.get('/staff/procurement',       authMiddleware, roleMiddleware(['FINANCE']), staffController.getProcurement);
router.get('/staff/procurement/stats', authMiddleware, roleMiddleware(['FINANCE']), staffController.getProcurementStats);

router.get('/staff/tax-policy', authMiddleware, roleMiddleware(['FINANCE']), staffController.getTaxPolicy);

router.get('/staff/audit-findings',       authMiddleware, roleMiddleware(['FINANCE']), staffController.getAuditFindings);
router.get('/staff/audit-findings/stats', authMiddleware, roleMiddleware(['FINANCE']), staffController.getAuditStats);

module.exports = router;