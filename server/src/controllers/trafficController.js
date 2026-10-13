const trafficService = require('../services/trafficService');

function citizenIdFrom(req) {
  return req.session?.verifiedCitizenId || req.user?.citizenId || null;
}

// Licences
async function getLicence(req, res, next) {
  try { res.json(await trafficService.getLicence(citizenIdFrom(req))); } catch (e) { next(e); }
}
async function renewLicence(req, res, next) {
  try { res.status(201).json(await trafficService.renewLicence(citizenIdFrom(req), req.user)); } catch (e) { next(e); }
}
async function bookDrivingTest(req, res, next) {
  try { res.status(201).json(await trafficService.bookDrivingTest(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); }
}
async function getAppointments(req, res, next) {
  try { res.json(await trafficService.getAppointments(citizenIdFrom(req))); } catch (e) { next(e); }
}
async function cancelAppointment(req, res, next) {
  try { await trafficService.cancelAppointment(req.params.id, citizenIdFrom(req)); res.json({ message: 'Cancelled' }); } catch (e) { next(e); }
}

// Staff — application processing (approve now issues the licence + captures signature)
async function getStaffApplications(req, res, next) {
  try { res.json(await trafficService.getStaffApplications(req.query)); } catch (e) { next(e); }
}
async function processApplication(req, res, next) {
  try {
    const result = await trafficService.processApplication(
      req.params.id, req.body.action, req.body, req.user
    );
    res.json(result);
  } catch (e) { next(e); }
}
async function issueLicence(req, res, next) {
  try {
    const result = await trafficService.processApplication(
      req.params.id, 'APPROVE', req.body, req.user
    );
    res.json(result);
  } catch (e) { next(e); }
}

// Vehicles
async function getVehicles(req, res, next) { try { res.json(await trafficService.getVehicles(citizenIdFrom(req))); } catch (e) { next(e); } }
async function registerVehicle(req, res, next) { try { res.status(201).json(await trafficService.registerVehicle(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function updateVehicle(req, res, next) { try { res.json(await trafficService.updateVehicle(citizenIdFrom(req), req.params.id, req.body, req.user)); } catch (e) { next(e); } }
async function deleteVehicle(req, res, next) { try { await trafficService.deleteVehicle(citizenIdFrom(req), req.params.id, req.user); res.json({ message: 'Deleted' }); } catch (e) { next(e); } }

// Inspections
async function bookInspection(req, res, next) { try { res.status(201).json(await trafficService.bookInspection(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getInspections(req, res, next) { try { res.json(await trafficService.getInspections(citizenIdFrom(req))); } catch (e) { next(e); } }
async function cancelInspection(req, res, next) { try { await trafficService.cancelInspection(citizenIdFrom(req), req.params.id); res.json({ message: 'Cancelled' }); } catch (e) { next(e); } }
async function getStaffInspections(req, res, next) { try { res.json(await trafficService.getStaffInspections(req.query)); } catch (e) { next(e); } }
async function processInspection(req, res, next) { try { res.json(await trafficService.processInspection(req.params.id, req.body, req.user)); } catch (e) { next(e); } }

// Vehicle licences
async function applyVehicleLicence(req, res, next) { try { res.status(201).json(await trafficService.applyVehicleLicence(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getVehicleLicences(req, res, next) { try { res.json(await trafficService.getVehicleLicences(citizenIdFrom(req))); } catch (e) { next(e); } }

// Transport permits
async function applyTransportPermit(req, res, next) { try { res.status(201).json(await trafficService.applyTransportPermit(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getTransportPermits(req, res, next) { try { res.json(await trafficService.getTransportPermits(citizenIdFrom(req))); } catch (e) { next(e); } }
async function getStaffTransportPermits(req, res, next) { try { res.json(await trafficService.getStaffTransportPermits(req.query)); } catch (e) { next(e); } }
async function processTransportPermit(req, res, next) { try { res.json(await trafficService.processTransportPermit(req.params.id, req.body.action, req.user)); } catch (e) { next(e); } }

// Licence applications
async function applyForLearnersLicence(req, res, next) { try { res.status(201).json(await trafficService.applyForLearnersLicence(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function applyForDrivingLicence(req, res, next) { try { res.status(201).json(await trafficService.applyForDrivingLicence(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function applyForPublicDrivingPermit(req, res, next) { try { res.status(201).json(await trafficService.applyForPublicDrivingPermit(citizenIdFrom(req), req.body, req.user)); } catch (e) { next(e); } }
async function getMyApplications(req, res, next) { try { res.json(await trafficService.getMyApplications(citizenIdFrom(req))); } catch (e) { next(e); } }
async function getApplicationByReference(req, res, next) {
  try {
    const app = await trafficService.getApplicationByReference(req.params.reference, citizenIdFrom(req));
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (e) { next(e); }
}

module.exports = {
  getLicence, renewLicence, bookDrivingTest, getAppointments, cancelAppointment,
  getStaffApplications, processApplication, issueLicence,
  getVehicles, registerVehicle, updateVehicle, deleteVehicle,
  bookInspection, getInspections, cancelInspection, getStaffInspections, processInspection,
  applyVehicleLicence, getVehicleLicences,
  applyTransportPermit, getTransportPermits, getStaffTransportPermits, processTransportPermit,
  applyForLearnersLicence, applyForDrivingLicence, applyForPublicDrivingPermit,
  getMyApplications, getApplicationByReference,
};