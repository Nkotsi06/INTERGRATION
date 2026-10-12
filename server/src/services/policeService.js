const policeCaseRepository = require('../repositories/policeCaseRepository');
const notificationService = require('./notificationService');
const userRepository = require('../repositories/userRepository');
const { generateCaseNumber } = require('../utils/referenceGenerator');
const auditService = require('./auditService');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

async function reportCase(citizenId, data, user) {
  const caseNumber = await generateCaseNumber();

  const created = await policeCaseRepository.create({
    caseNumber,
    citizenId,
    caseType: data.caseType,
    incidentDate: data.date,
    location: data.location,
    description: data.description,
  });

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'POLICE_CASE_REPORTED',
    recordType: 'POLICE_CASE',
    recordId: created.id,
    result: 'SUCCESS',
  });

  await notifyCitizen(
    citizenId,
    'Case reported',
    `Your case ${caseNumber} has been recorded.`
  );

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
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'POLICE_CASE_UPDATED',
    recordType: 'POLICE_CASE',
    recordId: id,
    result: 'SUCCESS',
  });

  const c = await policeCaseRepository.findById(id);
  if (c) {
    await notifyCitizen(
      c.citizen_id,
      'Case update',
      `Your case ${c.case_number} is now ${(data.status || c.status).toLowerCase()}.`
    );
  }
}

async function addCaseUpdate(id, notes, staffUser) {
  return policeCaseRepository.addUpdate(id, notes, staffUser.userId);
}

module.exports = {
  reportCase,
  getMyCases,
  getCaseByNumber,
  getStaffCases,
  updateCase,
  addCaseUpdate,
};