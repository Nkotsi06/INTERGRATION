const pensionRepository = require('../repositories/pensionRepository');
const pensionVerificationRepository = require('../repositories/pensionVerificationRepository');
const deathCertificateRepository = require('../repositories/deathCertificateRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const auditService = require('./auditService');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

async function getPensionInfo(citizenId) {
  return pensionRepository.findByCitizen(citizenId);
}

async function checkDeathCertificate(nationalId) {
  const dc = await deathCertificateRepository.findByNationalId(nationalId);
  return dc ? { found: true, date: dc.date_of_death } : { found: false };
}

async function verifyExistence(citizenId, user) {
  const dc = await deathCertificateRepository.findByCitizen(citizenId);
  if (dc) throw new Error('Death certificate on record — cannot verify existence');

  const verification = await pensionVerificationRepository.create({
    citizenId,
    status: 'VERIFIED',
    method: 'FINGERPRINT',
  });

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'PENSION_EXISTENCE_VERIFIED',
    recordType: 'PENSION_VERIFICATION',
    recordId: verification.id,
    result: 'SUCCESS',
  });

  await notifyCitizen(
    citizenId,
    'Existence verification successful',
    'Your pension existence check has been recorded.'
  );

  return verification;
}

async function getVerificationHistory(citizenId) {
  return pensionVerificationRepository.findByCitizen(citizenId);
}

async function getStaffVerifications(filters) {
  return pensionVerificationRepository.findAll(filters);
}

async function processVerification(id, action, staffUser) {
  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `PENSION_VERIFICATION_${action}`,
    recordType: 'PENSION_VERIFICATION',
    recordId: id,
    result: 'SUCCESS',
  });
}

module.exports = {
  getPensionInfo,
  checkDeathCertificate,
  verifyExistence,
  getVerificationHistory,
  getStaffVerifications,
  processVerification,
};