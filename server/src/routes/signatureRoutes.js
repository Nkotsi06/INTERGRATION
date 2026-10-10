const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const signatureController = require('../controllers/signatureController');

router.post('/', authMiddleware, signatureController.save);
router.get('/:citizenId', authMiddleware, signatureController.list);
router.post('/:citizenId/verify', authMiddleware, signatureController.verify);

module.exports = router;