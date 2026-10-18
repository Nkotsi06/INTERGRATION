const passportApplicationRepository = require('../repositories/passportApplicationRepository');
const applicationRepository = require('../repositories/applicationRepository');
const notificationService = require('./notificationService');
const paymentService = require('./paymentService');
const userRepository = require('../repositories/userRepository');
const citizenRepository = require('../repositories/citizenRepository');
const biometricRepository = require('../repositories/biometricRepository');
const { generateReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');
const { query } = require('../config/database');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

// ─── Dashboard stats ──────────────────────────────────────────────
async function getStaffStats() {
  const [pending, approvedToday, rejectedToday] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS c
       FROM applications
       WHERE service = 'PASSPORT'
         AND status IN ('SUBMITTED', 'UNDER_REVIEW')`
    ),
    query(
      `SELECT COUNT(*)::int AS c
       FROM applications
       WHERE service = 'PASSPORT'
         AND status IN ('APPROVED', 'COMPLETED')
         AND updated_at::date = CURRENT_DATE`
    ),
    query(
      `SELECT COUNT(*)::int AS c
       FROM applications
       WHERE service = 'PASSPORT'
         AND status = 'REJECTED'
         AND updated_at::date = CURRENT_DATE`
    ),
  ]);

  return {
    pending: pending.rows[0].c,
    approvedToday: approvedToday.rows[0].c,
    rejectedToday: rejectedToday.rows[0].c,
  };
}

async function applyForPassport(citizenId, data, user) {
  if (!data.passportType) {
    const err = new Error('Passport type is required.');
    err.statusCode = 400;
    throw err;
  }
  const currentPassport = await passportApplicationRepository.findCurrentByCitizen(citizenId);
  if (data.isRenewal && !currentPassport) {
    const err = new Error('No issued passport was found to renew.');
    err.statusCode = 400;
    throw err;
  }
  const biometric = await biometricRepository.findByCitizen(citizenId);
  if (!biometric?.facial_image) {
    const err = new Error('A Home Affairs photo is required before applying for a passport.');
    err.statusCode = 400;
    throw err;
  }
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen?.national_id) {
    const err = new Error('A Home Affairs National ID is required before applying for a passport.');
    err.statusCode = 400;
    throw err;
  }

  const passportSequence = await query(
    "SELECT nextval('passport_number_seq') AS number"
  );
  const passportNumber =
    `PPT-${new Date().getFullYear()}-${String(passportSequence.rows[0].number).padStart(6, '0')}`;
  const referenceNumber = await generateReference('PASSPORT_APPLICATION');

  const application = await applicationRepository.create({
    referenceNumber,
    citizenId,
    service: 'PASSPORT',
    data: {
      passportType: data.passportType,
      reason: data.reason,
      collectionOffice: data.collectionOffice,
      isRenewal: !!data.isRenewal,
      nationalId: citizen.national_id,
      passportNumber,
      previousPassportNumber: data.isRenewal
        ? currentPassport.passport_number
        : null,
      usesHomeAffairsPhoto: true,
    },
  });

  await passportApplicationRepository.create({
    applicationId: application.id,
    citizenId,
    passportType: data.passportType,
    reason: data.reason,
    passportNumber,
    collectionOffice: data.collectionOffice,
    isRenewal: !!data.isRenewal,
    previousPassportNumber: data.isRenewal
      ? currentPassport.passport_number
      : null,
  });

  const amount = data.amount == null
    ? (data.passportType === 'OFFICIAL' ? 700 : 500)
    : Number(data.amount);

  if (amount > 0) {
    await paymentService.recordPayment({
      citizenId,
      ministry: 'PASSPORT',
      service: data.isRenewal ? 'PASSPORT_RENEWAL' : 'PASSPORT_NEW',
      applicationReference: referenceNumber,
      amount,
      method: data.method || 'MOBILE_MONEY',
      mobile: data.mobile,
      receivedBy: user.userId,
    });
  }

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'PASSPORT_APPLICATION_SUBMITTED',
    recordType: 'APPLICATION',
    recordId: application.id,
    result: 'SUCCESS',
  });

  await notifyCitizen(
    citizenId,
    'Passport application received',
    `Your application ${referenceNumber} has been received.`
  );

  return {
    referenceNumber,
    passportNumber,
    applicantName: `${citizen.first_name} ${citizen.last_name}`.trim(),
    dateSubmitted: application.submitted_at,
    passportType: data.passportType,
    collectionOffice: data.collectionOffice,
    application,
  };
}

async function getMyApplications(citizenId, filters) {
  return applicationRepository.findByCitizen(citizenId);
}

async function getCurrentPassport(citizenId) {
  return passportApplicationRepository.findCurrentByCitizen(citizenId);
}

async function getApplicationByRef(ref, citizenId) {
  const app = await applicationRepository.findByReference(ref);
  if (!app) return null;
  if (citizenId && app.citizen_id !== citizenId) return null;
  const history = await applicationRepository.getStatusHistory(app.id);
  return { ...app, history };
}

async function getStaffApplications(filters) {
  return applicationRepository.findByService('PASSPORT', filters);
}

async function processApplication(id, action, staffUser) {
  const status =
    action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';

  await applicationRepository.updateStatus(id, status, staffUser.userId, action);
  await passportApplicationRepository.updateStatus(id, status);

  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `PASSPORT_APPLICATION_${status}`,
    recordType: 'APPLICATION',
    recordId: id,
    result: 'SUCCESS',
  });

  const app = await applicationRepository.findById(id);
  if (app) {
    await notifyCitizen(
      app.citizen_id,
      'Passport application update',
      `Your application ${app.reference_number} is now ${status.toLowerCase()}.`
    );
  }
}

module.exports = {
  getStaffStats,
  applyForPassport,
  getCurrentPassport,
  getMyApplications,
  getApplicationByRef,
  getStaffApplications,
  processApplication,
};