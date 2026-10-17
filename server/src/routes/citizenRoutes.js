const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const citizenController = require('../controllers/citizenController');

router.use(authMiddleware);

router.get('/profile', citizenController.getProfile);
router.put('/contact', citizenController.updateContact);
router.put('/change-password', citizenController.changePassword);

router.get('/photo', citizenController.getPhoto);

router.get('/applications', citizenController.getApplications);
router.get('/applications/:ref', citizenController.getApplicationByRef);
router.get('/documents', citizenController.getDocuments);

// Note: Notifications are now handled globally in /api/notifications (notificationRoutes.js)
// and the frontend points to /pages/common/Notifications.jsx

module.exports = router;