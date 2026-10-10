const signatureRepository = require('../repositories/signatureRepository');
const auditService = require('./auditService');

async function save({ citizenId, documentTypeCode, signatureData }, user) {
  const signature = await signatureRepository.create({
    citizenId,
    documentTypeCode,
    signatureData,
  });
  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'SIGNATURE_SAVED',
    recordType: 'SIGNATURE',
    recordId: signature.id,
    result: 'SUCCESS',
  });
  return signature;
}

async function findByCitizen(citizenId) {
  return signatureRepository.findByCitizen(citizenId);
}

async function getLatest(citizenId) {
  return signatureRepository.findLatestByCitizen(citizenId);
}

module.exports = { save, findByCitizen, getLatest };