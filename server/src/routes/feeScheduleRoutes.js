const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const feeScheduleController = require('../controllers/feeScheduleController');

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['FINANCE', 'ADMIN']),
  feeScheduleController.listFees
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['FINANCE', 'ADMIN']),
  feeScheduleController.updateFee
);

module.exports = router;