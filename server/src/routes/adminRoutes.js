const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');
const { logoUpload } = require('../middleware/uploadMiddleware');

router.use(authMiddleware, roleMiddleware(['ADMIN']));

// Dashboard
router.get('/stats', adminController.getStats);
router.get('/health', adminController.getHealth);
router.get('/activity', adminController.getActivity);

// Options
router.get('/options', adminController.getOptions);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/activate', adminController.activateUser);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.delete('/users/:id', adminController.deleteUser);

// System settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.post('/settings/logo', logoUpload.single('logo'), adminController.updateSettings);

module.exports = router;