const branchRepository = require('../repositories/branchRepository');
const auditService = require('./auditService');

async function list(filters) {
  return branchRepository.findAll(filters);
}

async function getById(id) {
  return branchRepository.findById(id);
}

async function create(data, adminUser) {
  if (!data.ministryCode) throw badRequest('Ministry is required.');
  if (!data.name) throw badRequest('Name is required.');
  if (!data.district) throw badRequest('District is required.');

  const created = await branchRepository.create(data);
  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'BRANCH_CREATED',
    recordType: 'BRANCH',
    recordId: created.id,
    result: 'SUCCESS',
  });
  return created;
}

async function update(id, data, adminUser) {
  const existing = await branchRepository.findById(id);
  if (!existing) throw notFound();

  const updated = await branchRepository.update(id, data);
  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'BRANCH_UPDATED',
    recordType: 'BRANCH',
    recordId: id,
    result: 'SUCCESS',
  });
  return updated;
}

async function remove(id, adminUser) {
  const existing = await branchRepository.findById(id);
  if (!existing) throw notFound();

  await branchRepository.remove(id);
  await auditService.log({
    userId: adminUser.userId,
    username: adminUser.username,
    action: 'BRANCH_DELETED',
    recordType: 'BRANCH',
    recordId: id,
    result: 'SUCCESS',
  });
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}
function notFound() {
  const err = new Error('Branch not found');
  err.statusCode = 404;
  return err;
}

module.exports = { list, getById, create, update, remove };