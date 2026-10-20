const certificateService = require('../services/certificateService');

function badRequest(msg) { const e = new Error(msg); e.statusCode = 400; return e; }

const VALID_TYPES = ['BIRTH', 'DEATH', 'MARRIAGE', 'DIVORCE', 'ID_CARD'];

function checkType(req) {
  const type = String(req.params.type || '').toUpperCase();
  if (!VALID_TYPES.includes(type)) {
    throw badRequest(`Unknown certificate type: ${req.params.type}`);
  }
  return type;
}

async function listMine(req, res, next) {
  try {
    const citizenId = req.user?.citizenId || req.session?.verifiedCitizenId;
    if (!citizenId) return res.json([]);
    res.json(await certificateService.listForCitizen(citizenId));
  } catch (err) { next(err); }
}

async function listAll(req, res, next) {
  try {
    const filters = {
      type: req.query.type ? String(req.query.type).toUpperCase() : undefined,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
    };
    res.json(await certificateService.listAll(filters));
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const type = checkType(req);
    res.json(await certificateService.getById(type, req.params.id));
  } catch (err) { next(err); }
}

// ─── NEW: update before issue ─────────────────────────────────────────────
async function update(req, res, next) {
  try {
    const type = checkType(req);
    res.json(
      await certificateService.updateCertificate(type, req.params.id, req.body, req.user)
    );
  } catch (err) { next(err); }
}
// ─────────────────────────────────────────────────────────────────────────

async function issue(req, res, next) {
  try {
    const type = checkType(req);
    res.json(await certificateService.issue(type, req.params.id, req.user));
  } catch (err) { next(err); }
}

async function reject(req, res, next) {
  try {
    const type = checkType(req);
    res.json(
      await certificateService.reject(type, req.params.id, req.body.reason, req.user)
    );
  } catch (err) { next(err); }
}

async function download(req, res, next) {
  try {
    const type = checkType(req);
    const { buffer, fileName } = await certificateService.downloadPdf(
      type,
      req.params.id,
      req.user
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err) { next(err); }
}

module.exports = { listMine, listAll, getOne, update, issue, reject, download };