const passportService = require('../services/passportService');

async function getStaffStats(req, res, next) {
  try { res.json(await passportService.getStaffStats()); } catch (err) { next(err); }
}

async function apply(req, res, next) {
  try {
    const result = await passportService.applyForPassport(
      req.session.verifiedCitizenId,
      req.body,
      req.user
    );
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function getMyApplications(req, res, next) {
  try {
    res.json(await passportService.getMyApplications(req.session.verifiedCitizenId, req.query));
  } catch (err) { next(err); }
}

async function getCurrentPassport(req, res, next) {
  try {
    res.json(await passportService.getCurrentPassport(req.session.verifiedCitizenId));
  } catch (err) { next(err); }
}

async function getApplicationByRef(req, res, next) {
  try {
    const app = await passportService.getApplicationByRef(
      req.params.ref,
      req.session.verifiedCitizenId
    );
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (err) { next(err); }
}

async function getStaffApplications(req, res, next) {
  try {
    res.json(await passportService.getStaffApplications(req.query));
  } catch (err) { next(err); }
}

async function processApplication(req, res, next) {
  try {
    await passportService.processApplication(req.params.id, req.body.action, req.user);
    res.json({ message: 'Application processed' });
  } catch (err) { next(err); }
}

async function markReadyForCollection(req, res, next) {
  try {
    res.json(await passportService.markReadyForCollection(req.params.id, req.user));
  } catch (err) { next(err); }
}

async function recordCollection(req, res, next) {
  try {
    res.json(
      await passportService.recordCollection(req.params.id, req.body, req.user)
    );
  } catch (err) { next(err); }
}

async function issuePassport(req, res, next) {
  try {
    res.json(
      await passportService.recordCollection(req.params.id, req.body, req.user)
    );
  } catch (err) { next(err); }
}

module.exports = {
  getStaffStats,
  apply,
  getMyApplications,
  getCurrentPassport,
  getApplicationByRef,
  getStaffApplications,
  processApplication,
  markReadyForCollection,
  recordCollection,
  issuePassport,
};