const policeCaseRepository = require('../repositories/policeCaseRepository');
const criminalRecordRepository = require('../repositories/criminalRecordRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const { generateCaseNumber, generateReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

// ─── Cases ────────────────────────────────────────────────────────────
async function reportCase(citizenId, data, user) {
  const caseNumber = await generateCaseNumber();
  const created = await policeCaseRepository.create({
    caseNumber, citizenId,
    caseType: data.caseType,
    incidentDate: data.date || data.incidentDate,
    location: data.location,
    description: data.description,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'POLICE_CASE_REPORTED',
    recordType: 'POLICE_CASE', recordId: created.id, result: 'SUCCESS',
  });

  await notifyCitizen(citizenId, 'Case reported',
    `Your case ${caseNumber} has been recorded.`);

  return created;
}

async function getMyCases(citizenId) {
  return policeCaseRepository.findByCitizen(citizenId);
}

async function getCaseByNumber(caseNumber, citizenId) {
  const c = await policeCaseRepository.findByCaseNumber(caseNumber);
  if (!c) return null;
  if (citizenId && c.citizen_id !== citizenId) return null;
  const updates = await policeCaseRepository.getUpdates(c.id);
  return { ...c, updates };
}

async function getStaffCases(filters) {
  return policeCaseRepository.findAll(filters);
}

async function updateCase(id, data, staffUser) {
  if (data.status) {
    await policeCaseRepository.updateStatus(id, data.status, staffUser.userId);
  }
  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: 'POLICE_CASE_UPDATED',
    recordType: 'POLICE_CASE', recordId: id, result: 'SUCCESS',
  });
  const c = await policeCaseRepository.findById(id);
  if (c) {
    await notifyCitizen(c.citizen_id, 'Case update',
      `Your case ${c.case_number} is now ${(data.status || c.status).toLowerCase()}.`);
  }
}

async function addCaseUpdate(id, notes, staffUser) {
  return policeCaseRepository.addUpdate(id, notes, staffUser.userId);
}

// ─── Clearance certificate ────────────────────────────────────────────
async function requestClearance(citizenId, data, user) {
  if (!data.purpose) {
    const err = new Error('Purpose is required.');
    err.statusCode = 400;
    throw err;
  }
  if (!data.station) {
    const err = new Error('Collection station is required.');
    err.statusCode = 400;
    throw err;
  }

  // Clearance requests are stored as police_cases with case_type CLEARANCE.
  // This keeps everything in one table and one workflow.
  const referenceNumber = await generateReference('POLICE_CASE');

  const created = await policeCaseRepository.create({
    caseNumber: referenceNumber,
    citizenId,
    caseType: 'CLEARANCE',
    incidentDate: new Date().toISOString().slice(0, 10),
    location: data.station,
    description:
      `Clearance request.\nPurpose: ${data.purpose}` +
      (data.contactNumber ? `\nContact: ${data.contactNumber}` : '') +
      (data.email ? `\nEmail: ${data.email}` : ''),
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'POLICE_CLEARANCE_REQUESTED',
    recordType: 'POLICE_CASE', recordId: created.id, result: 'SUCCESS',
  });

  await notifyCitizen(citizenId, 'Clearance request received',
    `Your clearance request ${referenceNumber} has been received.`);

  return created;
}

// ─── Criminal record ──────────────────────────────────────────────────
async function requestCriminalRecord(citizenId, data, user) {
  if (!data.purpose) {
    const err = new Error('Purpose is required.');
    err.statusCode = 400;
    throw err;
  }
  const referenceNumber = await generateReference('CRIMINAL_RECORD');
  const created = await criminalRecordRepository.create({
    citizenId, referenceNumber, purpose: data.purpose,
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'CRIMINAL_RECORD_REQUESTED',
    recordType: 'CRIMINAL_RECORD', recordId: created.id, result: 'SUCCESS',
  });

  await notifyCitizen(citizenId, 'Criminal record requested',
    `Your request ${referenceNumber} has been submitted.`);

  return created;
}

async function getMyCriminalRecords(citizenId) {
  return criminalRecordRepository.findByCitizen(citizenId);
}

async function getStaffCriminalRecords(filters) {
  return criminalRecordRepository.findAll(filters);
}

async function processCriminalRecord(id, action, data, staffUser) {
  const record = await criminalRecordRepository.findById(id);
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }

  let updated;
  if (action === 'ISSUE') {
    const validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);
    updated = await criminalRecordRepository.issue(id, {
      issuedBy: staffUser.userId,
      validUntil,
      findings: data.findings,
    });
  } else {
    updated = await criminalRecordRepository.reject(id, {
      issuedBy: staffUser.userId,
      findings: data.findings,
    });
  }

  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: `CRIMINAL_RECORD_${action}`,
    recordType: 'CRIMINAL_RECORD', recordId: id, result: 'SUCCESS',
  });

  await notifyCitizen(record.citizen_id, 'Criminal record update',
    `Your criminal record request is now ${updated.status.toLowerCase()}.`);

  return updated;
}

module.exports = {
  reportCase, getMyCases, getCaseByNumber, getStaffCases, updateCase, addCaseUpdate,
  requestClearance,
  requestCriminalRecord, getMyCriminalRecords, getStaffCriminalRecords, processCriminalRecord,
};