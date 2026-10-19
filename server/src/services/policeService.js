const policeCaseRepository = require('../repositories/policeCaseRepository');
const criminalRecordRepository = require('../repositories/criminalRecordRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const { generateCaseNumber, generateReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');
const { query } = require('../config/database');
const applicationRepository = require('../repositories/applicationRepository');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

// ─── Dashboard stats ──────────────────────────────────────────────
async function getStaffStats() {
  const [openCases, closedCases, pendingUpdates] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS c
       FROM police_cases
       WHERE status IN ('SUBMITTED', 'UNDER_INVESTIGATION', 'UPDATED')`
    ),
    query(
      `SELECT COUNT(*)::int AS c
       FROM police_cases
       WHERE status = 'CLOSED'`
    ),
    query(
      `SELECT COUNT(*)::int AS c
       FROM criminal_records
       WHERE status = 'PENDING'`
    ),
  ]);

  return {
    openCases: openCases.rows[0].c,
    closedCases: closedCases.rows[0].c,
    pendingUpdates: pendingUpdates.rows[0].c,
  };
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

  const referenceNumber = await generateReference('APPLICATION');

  const created = await applicationRepository.create({
    referenceNumber,
    citizenId,
    service: 'POLICE',
    data: {
      serviceCode: 'POLICE_CLEARANCE',
      serviceName: 'Clearance certificate',
      formData: {
        purpose: data.purpose,
        station: data.station,
        contactNumber: data.contactNumber || '',
        email: data.email || '',
      },
    },
  });

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'POLICE_CLEARANCE_REQUESTED',
    recordType: 'APPLICATION', recordId: created.id, result: 'SUCCESS',
  });

  await notifyCitizen(citizenId, 'Clearance request received',
    `Your clearance request ${referenceNumber} has been received.`);

  return { ...created, reference_number: referenceNumber };
}

async function getStaffClearances(filters = {}) {
  const params = [];
  let sql = `
    SELECT a.*, c.first_name, c.last_name,
           (c.first_name || ' ' || c.last_name) AS citizen_name,
           a.data->'formData' AS form_data
    FROM applications a
    LEFT JOIN citizens c ON c.id = a.citizen_id
    WHERE a.service = 'POLICE'
      AND a.data->>'serviceCode' = 'POLICE_CLEARANCE'
  `;
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND a.status = $${params.length}`;
  }
  sql += ' ORDER BY a.submitted_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function processClearance(id, action, staffUser) {
  const status = String(action || '').toUpperCase();
  if (!['APPROVE', 'REJECT'].includes(status)) {
    const err = new Error('Action must be APPROVE or REJECT.');
    err.statusCode = 400;
    throw err;
  }

  const applicationResult = await query(
    `SELECT id, citizen_id, reference_number, status
     FROM applications
     WHERE id = $1
       AND service = 'POLICE'
       AND data->>'serviceCode' = 'POLICE_CLEARANCE'`,
    [id]
  );
  const application = applicationResult.rows[0];
  if (!application) {
    const err = new Error('Clearance application not found.');
    err.statusCode = 404;
    throw err;
  }
  if (application.status !== 'SUBMITTED') {
    const err = new Error('This clearance application has already been processed.');
    err.statusCode = 400;
    throw err;
  }

  const newStatus = status === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  await query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2`,
    [newStatus, id]
  );
  await query(
    `INSERT INTO application_status_history (application_id, status, changed_by, notes)
     VALUES ($1, $2, $3, $4)`,
    [id, newStatus, staffUser.userId, `Clearance application ${newStatus.toLowerCase()} by police staff.`]
  );

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `POLICE_CLEARANCE_${newStatus}`,
    recordType: 'APPLICATION',
    recordId: id,
    result: 'SUCCESS',
  });
  await notifyCitizen(
    application.citizen_id,
    'Clearance request update',
    `Your clearance request ${application.reference_number} was ${newStatus.toLowerCase()}.`
  );

  return { ...application, status: newStatus };
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
  const operation = String(action || '').toUpperCase();
  if (!['ISSUE', 'REJECT'].includes(operation)) {
    const err = new Error('Action must be ISSUE or REJECT.');
    err.statusCode = 400;
    throw err;
  }

  const record = await criminalRecordRepository.findById(id);
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  if (record.status !== 'PENDING') {
    const err = new Error('This criminal record request has already been processed.');
    err.statusCode = 400;
    throw err;
  }

  let updated;
  if (operation === 'ISSUE') {
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
    action: `CRIMINAL_RECORD_${operation}`,
    recordType: 'CRIMINAL_RECORD', recordId: id, result: 'SUCCESS',
  });

  await notifyCitizen(record.citizen_id, 'Criminal record update',
    `Your criminal record request is now ${updated.status.toLowerCase()}.`);

  return updated;
}

module.exports = {
  getStaffStats,
  reportCase, getMyCases, getCaseByNumber, getStaffCases, updateCase, addCaseUpdate,
  requestClearance,
  getStaffClearances, processClearance,
  requestCriminalRecord, getMyCriminalRecords, getStaffCriminalRecords, processCriminalRecord,
};