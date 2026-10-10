const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const referenceService = require('../services/referenceService');

// Only staff can generate a reference manually.
// Automatic generation happens inside services.
router.post(
  '/generate',
  authMiddleware,
  roleMiddleware(['ADMIN', 'HOME_AFFAIRS', 'TRAFFIC', 'POLICE', 'FINANCE', 'PENSIONS', 'PASSPORT']),
  async (req, res, next) => {
    try {
      const reference = await referenceService.generateReference(req.body.formatName);
      res.json({ reference });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;