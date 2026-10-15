const feeScheduleRepository = require('../repositories/feeScheduleRepository');
const auditService = require('./auditService');

async function listFees(filters) {
  return feeScheduleRepository.findAll(filters);
}

async function getFeeForService(ministry, serviceCode) {
  const row = await feeScheduleRepository.findByCode(ministry, serviceCode);
  return row || null;
}

async function updateFee(id, data, staffUser) {
  const updated = await feeScheduleRepository.update(id, data);
  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'FEE_SCHEDULE_UPDATED',
    recordType: 'FEE_SCHEDULE',
    recordId: id,
    result: 'SUCCESS',
  });
  return updated;
}

module.exports = { listFees, getFeeForService, updateFee };