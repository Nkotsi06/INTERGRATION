const biometricService = require('../services/biometricService');

async function enrollFingerprint(req, res, next) {
  try {
    const citizenId = req.body.citizenId || req.session.verifiedCitizenId;
    const result = await biometricService.enrollFingerprints(citizenId, req.body.fingerprints, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function enrollFacial(req, res, next) {
  try {
    const citizenId = req.body.citizenId || req.session.verifiedCitizenId;
    const result = await biometricService.enrollFacial(citizenId, req.body.facialImage, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const citizenId = req.params.citizenId || req.session.verifiedCitizenId;
    res.json(await biometricService.get(citizenId));
  } catch (err) { next(err); }
}

async function verifyFingerprint(req, res, next) {
  try {
    const citizenId = req.params.citizenId;
    const result = await biometricService.verifyFingerprint(citizenId, req.body.fingerprint);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { enrollFingerprint, enrollFacial, get, verifyFingerprint };