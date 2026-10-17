const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const controller = require('../controllers/informationController');

router.use(authMiddleware);

// Public info (any authenticated user can read)
router.get('/topics', controller.listInformation);
router.get('/verify-document', controller.verifyDocument);

// Citizen: submit enquiry
router.post('/enquiries', controller.createEnquiry);

// Home Affairs Staff only: update info and reply to enquiries
router.use('/admin', roleMiddleware(['HOME_AFFAIRS']));

router.put('/admin/topics/:code', controller.updateInformation);
router.get('/admin/enquiries', controller.listEnquiries);
router.get('/admin/enquiries/:id', controller.getEnquiry);
router.post('/admin/enquiries/:id/reply', controller.replyToEnquiry);

module.exports = router;