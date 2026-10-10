const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { documentUpload } = require('../middleware/uploadMiddleware');
const documentController = require('../controllers/documentController');

router.post(
  '/upload',
  authMiddleware,
  documentUpload.single('file'),
  documentController.upload
);

router.get('/', authMiddleware, documentController.list);
router.get('/:id', authMiddleware, documentController.getOne);
router.get('/:id/download', authMiddleware, documentController.download);
router.put('/:id/verify', authMiddleware, documentController.verify);
router.delete('/:id', authMiddleware, documentController.remove);

module.exports = router;