const policeService = require('../services/policeService');

async function reportCase(req, res, next) {
  try {
    const c = await policeService.reportCase(req.session.verifiedCitizenId, req.body, req.user);
    res.status(201).json(c);
  } catch (err) { next(err); }
}

async function getMyCases(req, res, next) {
  try {
    res.json(await policeService.getMyCases(req.session.verifiedCitizenId));
  } catch (err) { next(err); }
}

async function getCaseByNumber(req, res, next) {
  try {
    const c = await policeService.getCaseByNumber(req.params.caseNumber, req.session.verifiedCitizenId);
    if (!c) return res.status(404).json({ message: 'Case not found' });
    res.json(c);
  } catch (err) { next(err); }
}

async function getStaffCases(req, res, next) {
  try {
    res.json(await policeService.getStaffCases(req.query));
  } catch (err) { next(err); }
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

module.exports = { reportCase, getMyCases, getCaseByNumber, getStaffCases, updateCase, addCaseUpdate };