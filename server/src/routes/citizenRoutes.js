const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const verificationMiddleware = require('../middleware/verificationMiddleware');
const citizenController = require('../controllers/citizenController');

router.use(authMiddleware);

// Session-safe: profile and password change do not require identity
// verification in this session.
router.get('/profile', citizenController.getProfile);
router.put('/contact', citizenController.updateContact);
router.put('/change-password', citizenController.changePassword);

router.get('/notifications', citizenController.getNotifications);
router.delete('/notifications/:id', citizenController.deleteNotification);
router.put('/notifications/:id/read', citizenController.markNotificationRead);

// These require the current session to be verified.
router.get('/applications', verificationMiddleware, citizenController.getApplications);
router.get('/applications/:ref', verificationMiddleware, citizenController.getApplicationByRef);
router.get('/documents', verificationMiddleware, citizenController.getDocuments);

module.exports = router;