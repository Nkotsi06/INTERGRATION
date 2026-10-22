const policeService = require('../services/policeService');
const { generateCertificateBuffer } = require('../utils/certificatePdfGenerator');
const { query } = require('../config/database');

function citizenIdFrom(req) {
  return req.user?.citizenId || req.session?.verifiedCitizenId || null;
}

async function getStaffStats(req, res, next) {
  try { res.json(await policeService.getStaffStats()); } catch (err) { next(err); }
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
    const updated = await policeService.updateCase(req.params.id, req.body, req.user);
    res.json(updated);
  } catch (err) { next(err); }
}

async function addCaseUpdate(req, res, next) {
  try {
    const created = await policeService.addCaseUpdate(req.params.id, req.body, req.user);
    res.status(201).json(created);
  } catch (err) { next(err); }
}

async function requestClearance(req, res, next) {
  try {
    const created = await policeService.requestClearance(
      citizenIdFrom(req), req.body, req.user
    );
    res.status(201).json(created);
  } catch (err) { next(err); }
}

async function getStaffClearances(req, res, next) {
  try { res.json(await policeService.getStaffClearances(req.query)); }
  catch (err) { next(err); }
}

async function processClearance(req, res, next) {
  try {
    const updated = await policeService.processClearance(
      req.params.id, req.body.action, req.user
    );
    res.json(updated);
  } catch (err) { next(err); }
}

async function downloadClearancePdf(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT a.*, c.first_name, c.last_name, c.national_id,
              (c.first_name || ' ' || c.last_name) AS citizen_name,
              a.data->'formData' AS form_data
       FROM applications a
       LEFT JOIN citizens c ON c.id = a.citizen_id
       WHERE a.id = $1`,
      [id]
    );
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: 'Clearance application not found' });
    }
    const pdfBuffer = await generateCertificateBuffer('CLEARANCE', row);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Clearance-${row.reference_number || id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

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
  getStaffStats,
  reportCase, getMyCases, getCaseByNumber, getStaffCases, updateCase, addCaseUpdate,
  requestClearance,
  getStaffClearances, processClearance, downloadClearancePdf,
  requestCriminalRecord, getMyCriminalRecords, getStaffCriminalRecords, processCriminalRecord,
};
