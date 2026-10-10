const signatureService = require('../services/signatureService');

async function save(req, res, next) {
  try {
    const sig = await signatureService.save({
      citizenId: req.body.citizenId || req.session.verifiedCitizenId,
      documentTypeCode: req.body.documentType,
      signatureData: req.body.signatureData,
    }, req.user);
    res.status(201).json(sig);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    res.json(await signatureService.findByCitizen(req.params.citizenId));
  } catch (err) { next(err); }
}

async function verify(req, res, next) {
  try {
    const latest = await signatureService.getLatest(req.params.citizenId);
    res.json({ match: !!latest, signature: latest });
  } catch (err) { next(err); }
}

module.exports = { save, list, verify };