const policeService = require('../services/policeService');

function citizenIdFrom(req) {
  return req.session?.verifiedCitizenId || req.user?.citizenId || null;
}

async function reportCase(req, res, next) {
  try {
    const c = await policeService.reportCase(citizenIdFrom(req), req.body, req.user);
    res.status(201).json(c);
  } catch (err) { next(err); }
}

async function getMyCases(req, res, next) {
  try { res.json(await policeService.getMyCases(citizenIdFrom(req))); }
  catch (err) { next(err); }
}

async function getCaseByNumber(req, res, next) {
  try {
    const c = await policeService.getCaseByNumber(req.params.caseNumber, citizenIdFrom(req));
    if (!c) return res.status(404).json({ message: 'Case not found' });
    res.json(c);
  } catch (err) { next(err); }
}

async function getStaffCases(req, res, next) {
  try { res.json(await policeService.getStaffCases(req.query)); }
  catch (err) { next(err); }
}

async function updateCase(req, res, next) {
  try {
    await policeService.updateCase(req.params.id, req.body, req.user);
    res.json({ message: 'Case updated' });
  } catch (err) { next(err); }
}

async function addCaseUpdate(req, res, next) {
  try {
    const u = await policeService.addCaseUpdate(req.params.id, req.body.notes, req.user);
    res.status(201).json(u);
  } catch (err) { next(err); }
}

// ─── Criminal record ──────────────────────────────────────────────────
async function requestCriminalRecord(req, res, next) {
  try {
    const created = await policeService.requestCriminalRecord(
      citizenIdFrom(req), req.body, req.user
    );
    res.status(201).json(created);
  } catch (err) { next(err); }
}

async function getMyCriminalRecords(req, res, next) {
  try { res.json(await policeService.getMyCriminalRecords(citizenIdFrom(req))); }
  catch (err) { next(err); }
}

async function getStaffCriminalRecords(req, res, next) {
  try { res.json(await policeService.getStaffCriminalRecords(req.query)); }
  catch (err) { next(err); }
}

async function processCriminalRecord(req, res, next) {
  try {
    const updated = await policeService.processCriminalRecord(
      req.params.id, req.body.action, req.body, req.user
    );
    res.json(updated);
  } catch (err) { next(err); }
}

module.exports = {
  reportCase, getMyCases, getCaseByNumber, getStaffCases, updateCase, addCaseUpdate,
  requestCriminalRecord, getMyCriminalRecords, getStaffCriminalRecords, processCriminalRecord,
};