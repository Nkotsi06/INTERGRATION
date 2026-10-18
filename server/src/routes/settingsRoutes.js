const router = require('express').Router();
const settingsController = require('../controllers/settingsController');

router.get('/public', settingsController.getPublic);
router.get('/languages', settingsController.getLanguages);
router.get('/translations/:langCode', settingsController.getTranslations);
router.get('/branches', settingsController.getPublicBranches);

module.exports = router;