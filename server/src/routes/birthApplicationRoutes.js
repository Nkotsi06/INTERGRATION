const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { birthApplicationUpload } = require('../middleware/birthApplicationUpload');
const controller = require('../controllers/birthApplicationController');

router.post('/', birthApplicationUpload, controller.submit);
router.get('/certificate/:certificateNumber', authMiddleware, controller.downloadCertificate);
router.get('/verify/:certificateNumber', controller.verify);

router.get(
  '/:id/documents/:documentType/:fileIndex',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS']),
  controller.document
);
router.get(
  '/:id/documents/:documentType',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS']),
  controller.document
);
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS']),
  controller.list
);
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS']),
  controller.get
);
router.put(
  '/:id/review',
  authMiddleware,
  roleMiddleware(['HOME_AFFAIRS']),
  controller.review
);

module.exports = router;
