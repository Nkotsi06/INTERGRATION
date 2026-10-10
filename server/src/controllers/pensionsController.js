const pensionsService = require('../services/pensionsService');

async function getPensionInfo(req, res, next) {
  try {
    res.json(await pensionsService.getPensionInfo(req.session.verifiedCitizenId));
  } catch (err) { next(err); }
}

async function verifyExistence(req, res, next) {
  try {
    const v = await pensionsService.verifyExistence(req.session.verifiedCitizenId, req.user);
    res.status(201).json(v);
  } catch (err) { next(err); }
}

async function getVerificationHistory(req, res, next) {
  try {
    res.json(await pensionsService.getVerificationHistory(req.session.verifiedCitizenId));
  } catch (err) { next(err); }
}

async function checkDeathCertificate(req, res, next) {
  try {
    res.json(await pensionsService.checkDeathCertificate(req.query.nationalId));
  } catch (err) { next(err); }
}

async function getStaffVerifications(req, res, next) {
  try {
    res.json(await pensionsService.getStaffVerifications(req.query));
  } catch (err) { next(err); }
}

async function processVerification(req, res, next) {
  try {
    await pensionsService.processVerification(req.params.id, req.body.action, req.user);
    res.json({ message: 'Verification processed' });
  } catch (err) { next(err); }
}

module.exports = { getPensionInfo, verifyExistence, getVerificationHistory, checkDeathCertificate, getStaffVerifications, processVerification };