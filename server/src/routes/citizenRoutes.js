const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const citizenController = require('../controllers/citizenController');

router.use(authMiddleware);

router.get('/profile', citizenController.getProfile);
router.put('/contact', citizenController.updateContact);
router.put('/change-password', citizenController.changePassword);

router.get('/photo', citizenController.getPhoto);

router.get('/notifications', citizenController.getNotifications);
router.delete('/notifications/:id', citizenController.deleteNotification);
router.put('/notifications/:id/read', citizenController.markNotificationRead);

router.get('/applications', citizenController.getApplications);
router.get('/applications/:ref', citizenController.getApplicationByRef);
router.get('/documents', citizenController.getDocuments);

module.exports = router;