const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const paymentController = require('../controllers/paymentController');

// Citizen: their own payments
router.get(
  '/mine',
  authMiddleware,
  paymentController.myPayments
);

// Finance staff: cross-ministry views
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['FINANCE', 'ADMIN']),
  paymentController.listPayments
);

router.get(
  '/finance-dashboard',
  authMiddleware,
  roleMiddleware(['FINANCE', 'ADMIN']),
  paymentController.financeDashboard
);

router.post(
  '/offline',
  authMiddleware,
  roleMiddleware(['FINANCE']),
  paymentController.offlinePayment
);

module.exports = router;