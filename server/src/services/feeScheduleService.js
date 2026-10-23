const feeScheduleRepository = require('../repositories/feeScheduleRepository');
const auditLogRepository = require('../repositories/auditLogRepository');

async function listFees(filters) {
  return feeScheduleRepository.findAll(filters);
}

async function getFeeForService(ministry, serviceCode) {
  const row = await feeScheduleRepository.findByCode(ministry, serviceCode);
  return row || null;
}

async function updateFee(id, data = {}, staffUser) {
  const editable = {};
  if (data.service_name !== undefined) {
    editable.service_name = String(data.service_name).trim();
    if (!editable.service_name || editable.service_name.length > 160) {
      const error = new Error('Service name is required and must be 160 characters or fewer.');
      error.statusCode = 400;
      throw error;
    }
    if (editable.amount > 9999999999.99) {
      const error = new Error('Fee amount exceeds the supported limit.');
      error.statusCode = 400;
      throw error;
    }
  }
  if (data.amount !== undefined) {
    if (String(data.amount).trim() === '') {
      const error = new Error('Fee amount is required.');
      error.statusCode = 400;
      throw error;
    }
    editable.amount = Number(data.amount);
    if (!Number.isFinite(editable.amount) || editable.amount < 0) {
      const error = new Error('Fee amount must be a non-negative number.');
      error.statusCode = 400;
      throw error;
    }
  }
  if (data.currency !== undefined) editable.currency = String(data.currency).trim().toUpperCase();
  if (data.currency !== undefined && (!editable.currency || editable.currency.length > 10)) {
    const error = new Error('Currency must be 1 to 10 characters.');
    error.statusCode = 400;
    throw error;
  }
  if (data.is_active !== undefined) {
    if (typeof data.is_active !== 'boolean') {
      const error = new Error('Active status must be true or false.');
      error.statusCode = 400;
      throw error;
    }
    editable.is_active = data.is_active;
  }
  if (data.notes !== undefined) editable.notes = String(data.notes).trim() || null;
  const updated = await feeScheduleRepository.update(id, editable);
  if (!updated) {
    const error = new Error('Fee not found.');
    error.statusCode = 404;
    throw error;
  }
  await auditLogRepository.create({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'FEE_SCHEDULE_UPDATED',
    recordType: 'FEE_SCHEDULE',
    recordId: id,
    result: 'SUCCESS',
  });
  return updated;
}

async function createFee(data = {}, staffUser) {
  const ministry = String(data.ministry || '').trim().toUpperCase();
  const serviceCode = String(data.service_code || '').trim().toUpperCase();
  const serviceName = String(data.service_name || '').trim();
  const amount = Number(data.amount);
  if (
    !ministry || ministry.length > 30 ||
    !serviceCode || serviceCode.length > 80 ||
    !serviceName || serviceName.length > 160 ||
    String(data.amount ?? '').trim() === '' ||
    !Number.isFinite(amount) || amount < 0 || amount > 9999999999.99
  ) {
    const error = new Error('Ministry, service code, service name, and a non-negative amount are required.');
    error.statusCode = 400;
    throw error;
  }
  const currency = String(data.currency || 'LSL').trim().toUpperCase();
  if (currency.length > 10) {
    const error = new Error('Currency must be 1 to 10 characters.');
    error.statusCode = 400;
    throw error;
  }
  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    const error = new Error('Active status must be true or false.');
    error.statusCode = 400;
    throw error;
  }
  if (!await feeScheduleRepository.serviceExists(ministry, serviceCode)) {
    const error = new Error('Select a service that exists in the service catalogue for this ministry.');
    error.statusCode = 400;
    throw error;
  }
  let fee;
  try {
    fee = await feeScheduleRepository.create({
      ministry,
      service_code: serviceCode,
      service_name: serviceName,
      amount,
      currency,
      is_active: data.is_active !== false,
      notes: data.notes || null,
    });
  } catch (error) {
    if (error.code === '23505') {
      const conflict = new Error('A fee already exists for this ministry and service code.');
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
  await auditLogRepository.create({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'FEE_SCHEDULE_CREATED',
    recordType: 'FEE_SCHEDULE',
    recordId: fee.id,
    result: 'SUCCESS',
  });
  return fee;
}

module.exports = { listFees, getFeeForService, updateFee, createFee };