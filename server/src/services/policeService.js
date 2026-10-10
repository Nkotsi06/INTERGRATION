const policeCaseRepository = require('../repositories/policeCaseRepository');
const { generateCaseNumber } = require('../utils/referenceGenerator');
const auditService = require('./auditService');

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

  return created;
}

async function getMyCases(citizenId) {
  return policeCaseRepository.findByCitizen(citizenId);
}

async function getCaseByNumber(caseNumber, citizenId) {
  const c = await policeCaseRepository.findByCaseNumber(caseNumber);
  if (!c) return null;
  // Citizens only see their own cases
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
}

async function addCaseUpdate(id, notes, staffUser) {
  return policeCaseRepository.addUpdate(id, notes, staffUser.userId);
}

module.exports = { reportCase, getMyCases, getCaseByNumber, getStaffCases, updateCase, addCaseUpdate };