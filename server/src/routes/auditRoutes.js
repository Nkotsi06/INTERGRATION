const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditController = require('../controllers/auditController');

router.use(authMiddleware, roleMiddleware(['ADMIN']));

router.get('/', auditController.list);
router.get('/export', auditController.exportCsv);

module.exports = router;