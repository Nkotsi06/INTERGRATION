const trafficService = require('../services/trafficService');
const signatureService = require('../services/signatureService');

function citizenIdFrom(req) {
  return req.session?.verifiedCitizenId || req.user?.citizenId || null;
}

async function getLicence(req, res, next) {
  try { res.json(await trafficService.getLicence(citizenIdFrom(req))); }
  catch (err) { next(err); }
}

async function renewLicence(req, res, next) {
  try {
    const result = await trafficService.renewLicence(citizenIdFrom(req), req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function bookDrivingTest(req, res, next) {
  try {
    const booking = await trafficService.bookDrivingTest(citizenIdFrom(req), req.body, req.user);
    res.status(201).json(booking);
  } catch (err) { next(err); }
}

async function getAppointments(req, res, next) {
  try { res.json(await trafficService.getAppointments(citizenIdFrom(req))); }
  catch (err) { next(err); }
}

async function cancelAppointment(req, res, next) {
  try {
    await trafficService.cancelAppointment(req.params.id, citizenIdFrom(req));
    res.json({ message: 'Appointment cancelled' });
  } catch (err) { next(err); }
}

async function getStaffApplications(req, res, next) {
  try { res.json(await trafficService.getStaffApplications(req.query)); }
  catch (err) { next(err); }
}

async function processApplication(req, res, next) {
  try {
    await trafficService.processApplication(req.params.id, req.body.action, req.user);
    res.json({ message: 'Application processed' });
  } catch (err) { next(err); }
}

async function issueLicence(req, res, next) {
  try {
    const { id } = req.params;
    const { signature } = req.body;
    if (!signature) return res.status(400).json({ message: 'Signature is required.' });
    await signatureService.save({
      citizenId: id, documentTypeCode: 'DRIVERS_LICENCE', signatureData: signature,
    }, req.user);
    res.json({ message: 'Licence issued successfully' });
  } catch (err) { next(err); }
}

// ─── Vehicles ────────────────────────────────────────────────────────
async function getVehicles(req, res, next) {
  try { res.json(await trafficService.getVehicles(citizenIdFrom(req))); }
  catch (err) { next(err); }
}

async function registerVehicle(req, res, next) {
  try {
    const created = await trafficService.registerVehicle(citizenIdFrom(req), req.body, req.user);
    res.status(201).json(created);
  } catch (err) { next(err); }
}

async function updateVehicle(req, res, next) {
  try {
    const updated = await trafficService.updateVehicle(citizenIdFrom(req), req.params.id, req.body, req.user);
    res.json(updated);
  } catch (err) { next(err); }
}

async function deleteVehicle(req, res, next) {
  try {
    await trafficService.deleteVehicle(citizenIdFrom(req), req.params.id, req.user);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) { next(err); }
}

module.exports = {
  getLicence, renewLicence, bookDrivingTest, getAppointments,
  cancelAppointment, getStaffApplications, processApplication, issueLicence,
  getVehicles, registerVehicle, updateVehicle, deleteVehicle,
};