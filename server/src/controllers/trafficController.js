const trafficService = require('../services/trafficService');

async function getLicence(req, res, next) {
  try {
    res.json(await trafficService.getLicence(req.session.verifiedCitizenId));
  } catch (err) { next(err); }
}

async function renewLicence(req, res, next) {
  try {
    const result = await trafficService.renewLicence(req.session.verifiedCitizenId, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function bookDrivingTest(req, res, next) {
  try {
    const booking = await trafficService.bookDrivingTest(req.session.verifiedCitizenId, req.body, req.user);
    res.status(201).json(booking);
  } catch (err) { next(err); }
}

async function getAppointments(req, res, next) {
  try {
    res.json(await trafficService.getAppointments(req.session.verifiedCitizenId));
  } catch (err) { next(err); }
}

async function cancelAppointment(req, res, next) {
  try {
    await trafficService.cancelAppointment(req.params.id, req.session.verifiedCitizenId);
    res.json({ message: 'Appointment cancelled' });
  } catch (err) { next(err); }
}

async function getStaffApplications(req, res, next) {
  try {
    res.json(await trafficService.getStaffApplications(req.query));
  } catch (err) { next(err); }
}

async function processApplication(req, res, next) {
  try {
    await trafficService.processApplication(req.params.id, req.body.action, req.user);
    res.json({ message: 'Application processed' });
  } catch (err) { next(err); }
}

async function issueLicence(req, res, next) {
  try {
    res.json({ message: 'Licence issued successfully' });
  } catch (err) { next(err); }
}

module.exports = { getLicence, renewLicence, bookDrivingTest, getAppointments, cancelAppointment, getStaffApplications, processApplication, issueLicence };