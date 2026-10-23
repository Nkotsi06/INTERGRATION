const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const citizenController = require('../controllers/citizenController');

router.use(authMiddleware);

router.get('/profile', citizenController.getProfile);
router.put('/contact', citizenController.updateContact);
router.put('/change-password', citizenController.changePassword);

router.get('/photo', citizenController.getPhoto);
router.get('/biometrics', citizenController.getBiometrics);

router.get('/applications', citizenController.getApplications);
router.get('/applications/:ref', citizenController.getApplicationByRef);
router.delete('/applications/:id', citizenController.deleteApplication);
router.get('/documents', citizenController.getDocuments);

module.exports = router;