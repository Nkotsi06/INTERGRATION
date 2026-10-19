const passportApplicationRepository = require('../repositories/passportApplicationRepository');
const applicationRepository = require('../repositories/applicationRepository');
const notificationService = require('./notificationService');
const paymentService = require('./paymentService');
const userRepository = require('../repositories/userRepository');
const citizenRepository = require('../repositories/citizenRepository');
const biometricRepository = require('../repositories/biometricRepository');
const branchRepository = require('../repositories/branchRepository');
const policeCaseRepository = require('../repositories/policeCaseRepository');
const { generateReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');
const { query } = require('../config/database');
const feeScheduleService = require('./feeScheduleService');

const PASSPORT_SERVICE_CODES = new Set([
  'PASSPORT_NEW',
  'PASSPORT_RENEWAL',
  'PASSPORT_LOST',
  'PASSPORT_URGENT',
  'PASSPORT_MINOR',
]);

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

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
  if (!['ORDINARY', 'OFFICIAL'].includes(data.passportType)) {
    throw badRequest('Choose a valid passport type.');
  }
  const serviceCode = PASSPORT_SERVICE_CODES.has(data.serviceCode)
    ? data.serviceCode
    : data.isRenewal ? 'PASSPORT_RENEWAL' : 'PASSPORT_NEW';
  const isRenewal = serviceCode === 'PASSPORT_RENEWAL' || serviceCode === 'PASSPORT_LOST';
  const isMinor = serviceCode === 'PASSPORT_MINOR';
  const currentPassport = isRenewal
    ? await passportApplicationRepository.findCurrentByCitizen(citizenId)
    : null;
  if (isRenewal && !currentPassport) {
    throw badRequest('No issued passport was found for this application.');
  }

  const childPhoto = data.childPhoto;
  if (isMinor) {
    if (typeof childPhoto !== 'string' ||
        !/^data:image\/(?:jpeg|png);base64,/.test(childPhoto) ||
        childPhoto.length > 2_000_000) {
      throw badRequest('Capture a valid photo of the child before applying.');
    }
  } else {
    const biometric = await biometricRepository.findByCitizen(citizenId);
    if (!biometric?.facial_image) {
      throw badRequest('A Home Affairs photo is required before applying for a passport.');
    }
  }

  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen?.national_id) {
    throw badRequest('A Home Affairs National ID is required before applying for a passport.');
  }
  if (!data.collectionOffice) {
    throw badRequest('Please choose a passport collection office.');
  }
  const branch = await branchRepository.findById(data.collectionOffice);
  if (!branch || !branch.is_active || branch.ministry_code !== 'PASSPORT') {
    throw badRequest('Choose an active Passport Office collection branch.');
  }
  if (serviceCode === 'PASSPORT_LOST') {
    if (!data.policeCaseNumber) {
      throw badRequest('Choose the police case for your lost passport report.');
    }
    const policeCase = await policeCaseRepository.findByCaseNumber(data.policeCaseNumber);
    if (!policeCase || policeCase.citizen_id !== citizenId ||
        !['LOST_PROPERTY', 'LOST', 'STOLEN', 'THEFT'].includes(policeCase.case_type)) {
      throw badRequest('The selected police case is not a valid lost-property case.');
    }
  }
  if (serviceCode === 'PASSPORT_URGENT' && (!data.travelDate || !data.travelReason)) {
    throw badRequest('Travel date and reason are required for an urgent passport.');
  }
  if (isMinor && (!data.childFullName || !data.childDateOfBirth ||
      !data.guardianFullName || !data.guardianNationalId || !data.guardianRelationship)) {
    throw badRequest('Complete the child and guardian details before applying.');
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
      serviceCode,
      collectionOffice: data.collectionOffice,
      isRenewal,
      nationalId: citizen.national_id,
      passportNumber,
      previousPassportNumber: isRenewal
        ? currentPassport.passport_number
        : null,
      usesHomeAffairsPhoto: !isMinor,
      formData: {
        circumstances: data.circumstances,
        policeCaseNumber: data.policeCaseNumber,
        travelDate: data.travelDate,
        travelReason: data.travelReason,
        childFullName: data.childFullName,
        childDateOfBirth: data.childDateOfBirth,
        childNationalId: data.childNationalId,
        guardianFullName: data.guardianFullName,
        guardianNationalId: data.guardianNationalId,
        guardianRelationship: data.guardianRelationship,
        childPhoto: isMinor ? childPhoto : undefined,
      },
    },
  });

  await passportApplicationRepository.create({
    applicationId: application.id,
    citizenId,
    passportType: data.passportType,
    reason: data.reason,
    passportNumber,
    collectionOffice: data.collectionOffice,
    isRenewal,
    previousPassportNumber: isRenewal
      ? currentPassport.passport_number
      : null,
  });

  const fee = await feeScheduleService.getFeeForService('PASSPORT', serviceCode);
  const amount = fee?.is_active ? Number(fee.amount) : 0;

  if (amount > 0) {
    await paymentService.recordPayment({
      citizenId,
      ministry: 'PASSPORT',
      service: serviceCode,
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
  return passportApplicationRepository.findForStaff(filters);
}

async function processApplication(id, action, staffUser) {
  const app = await applicationRepository.findById(id);
  if (!app || app.service !== 'PASSPORT') {
    const error = new Error('Passport application not found.');
    error.statusCode = 404;
    throw error;
  }
  if (!['APPROVE', 'REJECT', 'REQUEST_INFO'].includes(action)) {
    throw badRequest('Invalid passport application action.');
  }
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

  await notifyCitizen(
    app.citizen_id,
    'Passport application update',
    `Your application ${app.reference_number} is now ${status.toLowerCase()}.`
  );
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