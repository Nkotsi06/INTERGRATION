const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const certificateController = require('../controllers/certificateController');

router.use(authMiddleware);

// Citizen — their own certificates
router.get('/mine', certificateController.listMine);

// Staff — all certificates
router.get(
  '/',
  roleMiddleware(['HOME_AFFAIRS', 'ADMIN']),
  certificateController.listAll
);

// NEW: Route to get a photo for a minor passport application
router.get(
    '/passport/:id/photo',
    roleMiddleware(['HOME_AFFAIRS', 'ADMIN', 'PASSPORT']),
    certificateController.getPassportPhoto
);

// Single certificate (any logged-in user; service enforces ownership for citizens)
router.get('/:type/:id', certificateController.getOne);
router.get('/:type/:id/download', certificateController.download);

// Staff actions
router.post(
  '/:type/:id/issue',
  roleMiddleware(['HOME_AFFAIRS', 'ADMIN']),
  certificateController.issue
);
router.post(
  '/:type/:id/reject',
  roleMiddleware(['HOME_AFFAIRS', 'ADMIN']),
  certificateController.reject
);

router.put(
  '/:type/:id',
  roleMiddleware(['HOME_AFFAIRS', 'ADMIN']),
  certificateController.update
);

module.exports = router;