const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');
const branchController = require('../controllers/branchController');

router.use(authMiddleware, roleMiddleware(['ADMIN']));

router.get('/stats', adminController.getStats);
router.get('/health', adminController.getHealth);
router.get('/activity', adminController.getActivity);
router.get('/options', adminController.getOptions);

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/activate', adminController.activateUser);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

router.get('/settings/biometrics', adminController.getBiometricSettings);
router.put('/settings/biometrics', adminController.updateBiometricSettings);

router.get('/branches', branchController.list);
router.get('/branches/:id', branchController.getOne);
router.post('/branches', branchController.create);
router.put('/branches/:id', branchController.update);
router.delete('/branches/:id', branchController.deleteBranch || branchController.remove);

module.exports = router;