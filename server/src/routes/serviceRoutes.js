const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const serviceController = require('../controllers/serviceController');

// Public
router.get('/public', serviceController.listPublic);

// Admin
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), serviceController.listAll);
router.get('/:id', authMiddleware, serviceController.getById);
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), serviceController.updateService);

// Citizen — apply for a catalogue service
router.post(
  '/:serviceId/apply',
  authMiddleware,
  verificationMiddleware,
  serviceController.submitApplication
);

module.exports = router;