const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const c = require('../controllers/trafficController');

// Citizen — licence
router.get('/licence', authMiddleware, c.getLicence);
router.post('/licence/renew', authMiddleware, c.renewLicence);
router.post('/test/book', authMiddleware, c.bookDrivingTest);
router.get('/appointments', authMiddleware, c.getAppointments);
router.delete('/appointments/:id', authMiddleware, c.cancelAppointment);

// Citizen — licence applications
router.post('/licence/learners', authMiddleware, c.applyForLearnersLicence);
router.post('/licence/driving', authMiddleware, c.applyForDrivingLicence);
router.post('/licence/pdp', authMiddleware, c.applyForPublicDrivingPermit);
router.get('/applications', authMiddleware, c.getMyApplications);
router.get('/applications/:reference', authMiddleware, c.getApplicationByReference);

// Citizen — vehicles
router.get('/vehicles', authMiddleware, c.getVehicles);
router.post('/vehicles', authMiddleware, c.registerVehicle);
router.put('/vehicles/:id', authMiddleware, c.updateVehicle);
router.delete('/vehicles/:id', authMiddleware, c.deleteVehicle);

// Citizen — inspections
router.post('/inspections', authMiddleware, c.bookInspection);
router.get('/inspections', authMiddleware, c.getInspections);
router.delete('/inspections/:id', authMiddleware, c.cancelInspection);

// Citizen — vehicle licences
router.post('/vehicle-licences', authMiddleware, c.applyVehicleLicence);
router.get('/vehicle-licences', authMiddleware, c.getVehicleLicences);

// Citizen — transport permits
router.post('/permits', authMiddleware, c.applyTransportPermit);
router.get('/permits', authMiddleware, c.getTransportPermits);

// Staff — dashboard stats  ← NEW
router.get('/staff/stats', authMiddleware, roleMiddleware(['TRAFFIC']), c.getStaffStats);

// Staff — processing
router.get('/staff/applications', authMiddleware, roleMiddleware(['TRAFFIC']), c.getStaffApplications);
router.put('/staff/applications/:id', authMiddleware, roleMiddleware(['TRAFFIC']), c.processApplication);
router.post('/issue-licence/:id', authMiddleware, roleMiddleware(['TRAFFIC']), c.issueLicence);
router.get('/staff/inspections', authMiddleware, roleMiddleware(['TRAFFIC']), c.getStaffInspections);
router.put('/staff/inspections/:id', authMiddleware, roleMiddleware(['TRAFFIC']), c.processInspection);
router.get('/staff/permits', authMiddleware, roleMiddleware(['TRAFFIC']), c.getStaffTransportPermits);
router.put('/staff/permits/:id', authMiddleware, roleMiddleware(['TRAFFIC']), c.processTransportPermit);

module.exports = router;