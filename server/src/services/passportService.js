const passportApplicationRepository = require('../repositories/passportApplicationRepository');
const applicationRepository = require('../repositories/applicationRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const { generateReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

async function applyForPassport(citizenId, data, user) {
  const referenceNumber = await generateReference('PASSPORT_APPLICATION');

  const application = await applicationRepository.create({
    referenceNumber,
    citizenId,
    service: 'PASSPORT',
    data: { passportType: data.passportType, reason: data.reason },
  });

  await passportApplicationRepository.create({
    applicationId: application.id,
    citizenId,
    passportType: data.passportType,
    reason: data.reason,
  });

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

  return { referenceNumber, application };
}

async function getMyApplications(citizenId, filters) {
  return applicationRepository.findByCitizen(citizenId);
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
  applyForPassport,
  getMyApplications,
  getApplicationByRef,
  getStaffApplications,
  processApplication,
};