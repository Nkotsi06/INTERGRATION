const pensionsService = require('../services/pensionsService');

function citizenIdFrom(req) {
  return req.user?.verifiedCitizenId || req.user?.citizenId || null;
}

async function getStaffStats(req, res, next) {
  try { res.json(await pensionsService.getStaffStats()); }
  catch (err) { next(err); }
}

async function getEligibility(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    if (!citizenId) return res.status(403).json({ message: 'Citizen profile required.' });
    res.json(await pensionsService.assessEligibility(citizenId));
  } catch (err) { next(err); }
}

async function getRules(req, res, next) {
  try { res.json(await pensionsService.getRules()); }
  catch (err) { next(err); }
}

async function getPensionInfo(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    if (!citizenId) return res.status(403).json({ message: 'Citizen profile required.' });
    const info = await pensionsService.getPensionInfo(citizenId);
    const eligibility = await pensionsService.assessEligibility(citizenId);
    res.json({ record: info || null, eligibility });
  } catch (err) { next(err); }
}

async function verifyExistence(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    if (!citizenId) return res.status(403).json({ message: 'Citizen profile required.' });
    const result = await pensionsService.verifyExistence(
      citizenId, req.body.answer, req.user
    );
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function getVerificationHistory(req, res, next) {
  try {
    const citizenId = citizenIdFrom(req);
    if (!citizenId) return res.status(403).json({ message: 'Citizen profile required.' });
    res.json(await pensionsService.getVerificationHistory(citizenId));
  } catch (err) { next(err); }
}

async function checkDeathCertificate(req, res, next) {
  try {
    res.json(await pensionsService.checkDeathCertificate(req.query.nationalId));
  } catch (err) { next(err); }
}

async function getStaffVerifications(req, res, next) {
  try { res.json(await pensionsService.getStaffVerifications(req.query)); }
  catch (err) { next(err); }
}

async function processVerification(req, res, next) {
  try {
    await pensionsService.processVerification(req.params.id, req.body.action, req.user);
    res.json({ message: 'Verification processed' });
  } catch (err) { next(err); }
}

module.exports = {
  getStaffStats,
  getEligibility,
  getRules,
  getPensionInfo,
  verifyExistence,
  getVerificationHistory,
  checkDeathCertificate,
  getStaffVerifications,
  processVerification,
};