const taxRecordRepository = require('../repositories/taxRecordRepository');
const taxClearanceRepository = require('../repositories/taxClearanceRepository');
const vatRepository = require('../repositories/vatRepository');
const taxReturnRepository = require('../repositories/taxReturnRepository');
const paymentPlanRepository = require('../repositories/paymentPlanRepository');
const businessRegistrationRepository = require('../repositories/businessRegistrationRepository');
const notificationService = require('./notificationService');
const paymentService = require('./paymentService');
const userRepository = require('../repositories/userRepository');
const { generateReference } = require('../utils/referenceGenerator');
const { generateTaxClearancePDF } = require('../utils/pdfGenerator');
const auditService = require('./auditService');

async function notifyCitizen(citizenId, title, message) {
  if (!citizenId) return;
  const user = await userRepository.findByCitizenId(citizenId);
  if (user) await notificationService.notify(user.id, title, message);
}

function badRequest(message) { const e = new Error(message); e.statusCode = 400; return e; }
function notFound(message) { const e = new Error(message); e.statusCode = 404; return e; }

// ─── Existing tax core ───────────────────────────────────────────────
async function getTaxProfile(citizenId) {
  return taxRecordRepository.findByCitizen(citizenId);
}

async function registerTax(citizenId, data, user) {
  const taxId = `TIN-${Date.now()}`;
  const record = await taxRecordRepository.create({
    citizenId, taxId,
    employmentStatus: data.employmentStatus,
    incomeSource: data.incomeSource,
    taxYear: data.taxYear,
  });
  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'TAX_REGISTERED',
    recordType: 'TAX_RECORD', recordId: record.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Tax registration received',
    `Your tax registration has been received (${taxId}).`);
  return record;
}

async function makePayment(citizenId, data, user) {
  const taxRecord = await taxRecordRepository.findByCitizen(citizenId);
  if (!taxRecord) throw notFound('No tax record found');

  const referenceNumber = await generateReference('TAX_PAYMENT');

  // Record in the shared payments table.
  const payment = await paymentService.recordPayment({
    citizenId,
    ministry: 'FINANCE',
    service: 'TAX_PAYMENT',
    applicationReference: taxRecord.tax_id,
    amount: data.amount,
    method: data.method || 'MOBILE_MONEY',
    mobile: data.mobile,
    referenceNumber,
    receivedBy: user.userId,
  });

  const newBalance = Math.max(0,
    parseFloat(taxRecord.outstanding_balance || 0) - parseFloat(data.amount));
  await taxRecordRepository.updateBalance(taxRecord.id, newBalance);

  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'TAX_PAYMENT',
    recordType: 'PAYMENT', recordId: payment.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Payment received',
    `Your payment ${payment.receipt_number} has been received.`);

  return {
    referenceNumber,
    receiptNumber: payment.receipt_number,
    amount: data.amount,
    date: new Date().toISOString().slice(0, 10),
    newBalance,
  };
}

async function getPayments(citizenId) {
  return paymentService.listForCitizen(citizenId);
}

async function generateTaxClearance(citizenId, user) {
  const taxRecord = await taxRecordRepository.findByCitizen(citizenId);
  if (!taxRecord) throw notFound('No tax record found');

  const certificateId = `TC-${Date.now()}`;
  const validUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const verificationUrl = `https://gov.ls/verify/${certificateId}`;

  const cert = await taxClearanceRepository.create({
    citizenId, certificateId, tin: taxRecord.tax_id,
    legalName: user.fullName || 'Taxpayer',
    tradingName: null, natureOfBusiness: null,
    address: user.address || '', validUntil, verificationUrl,
  });

  const pdfBuffer = await generateTaxClearancePDF({
    certificateId, tin: taxRecord.tax_id, legalName: user.fullName,
    tradingName: null, natureOfBusiness: null, address: user.address || '',
    dateIssued: new Date().toISOString().slice(0, 10),
    validUntil, verificationUrl,
  });

  return { cert, pdfBuffer };
}

async function getStaffRegistrations(filters) {
  return taxRecordRepository.findAll(filters);
}

async function processRegistration(id, action, staffUser) {
  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: `TAX_REGISTRATION_${action}`,
    recordType: 'TAX_RECORD', recordId: id, result: 'SUCCESS',
  });
  const record = await taxRecordRepository.findById(id);
  if (record) {
    await notifyCitizen(record.citizen_id, 'Tax registration update',
      `Your tax registration has been ${action.toLowerCase()}d.`);
  }
}

// ─── VAT ─────────────────────────────────────────────────────────────
async function applyForVat(citizenId, data, user) {
  if (!data.businessName) throw badRequest('Business name is required.');
  const referenceNumber = await generateReference('VAT_REGISTRATION');
  const created = await vatRepository.create({ citizenId, referenceNumber, ...data });
  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'VAT_REGISTRATION_SUBMITTED',
    recordType: 'VAT_REGISTRATION', recordId: created.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'VAT registration received',
    `Your VAT registration ${referenceNumber} has been received.`);
  return created;
}
async function getMyVat(citizenId) { return vatRepository.findByCitizen(citizenId); }
async function getStaffVat(filters) { return vatRepository.findAll(filters); }
async function processVat(id, action, staffUser) {
  const record = await vatRepository.findById(id);
  if (!record) throw notFound('VAT registration not found');
  if (action === 'APPROVE') {
    const certificateId = `VAT-CERT-${Date.now()}`;
    const updated = await vatRepository.approve(id, { issuedBy: staffUser.userId, certificateId });
    await auditService.log({
      userId: staffUser.userId, username: staffUser.username,
      action: 'VAT_REGISTRATION_APPROVED',
      recordType: 'VAT_REGISTRATION', recordId: id, result: 'SUCCESS',
    });
    await notifyCitizen(record.citizen_id, 'VAT registration approved',
      `Your VAT certificate ${certificateId} has been issued.`);
    return updated;
  }
  throw badRequest('Unsupported action');
}

// ─── Tax returns ─────────────────────────────────────────────────────
async function submitTaxReturn(citizenId, data, user) {
  if (!data.taxYear) throw badRequest('Tax year is required.');
  if (!data.incomeDeclared) throw badRequest('Income is required.');

  const income = parseFloat(data.incomeDeclared);
  const deductions = parseFloat(data.deductions || 0);
  const taxable = Math.max(0, income - deductions);
  const taxDue = Math.round(taxable * 0.2 * 100) / 100;
  const taxPaid = 0;

  const referenceNumber = await generateReference('TAX_RETURN');
  const created = await taxReturnRepository.create({
    citizenId, referenceNumber, taxYear: data.taxYear,
    incomeDeclared: income, deductions,
    taxableIncome: taxable, taxDue, taxPaid,
    submittedBy: user.userId,
  });
  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'TAX_RETURN_SUBMITTED',
    recordType: 'TAX_RETURN', recordId: created.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Tax return submitted',
    `Your tax return ${referenceNumber} has been submitted.`);
  return created;
}
async function getMyTaxReturns(citizenId) { return taxReturnRepository.findByCitizen(citizenId); }
async function getStaffTaxReturns(filters) { return taxReturnRepository.findAll(filters); }
async function reviewTaxReturn(id, { status, notes }, staffUser) {
  const updated = await taxReturnRepository.review(id, {
    status, reviewedBy: staffUser.userId, notes,
  });
  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: `TAX_RETURN_${status}`,
    recordType: 'TAX_RETURN', recordId: id, result: 'SUCCESS',
  });
  await notifyCitizen(updated.citizen_id, 'Tax return update',
    `Your tax return is now ${status.toLowerCase()}.`);
  return updated;
}

// ─── Payment plans ───────────────────────────────────────────────────
async function requestPaymentPlan(citizenId, data, user) {
  if (!data.totalAmount) throw badRequest('Total amount is required.');
  if (!data.numberOfInstalments) throw badRequest('Number of instalments is required.');
  if (!data.startDate) throw badRequest('Start date is required.');

  const total = parseFloat(data.totalAmount);
  const count = parseInt(data.numberOfInstalments, 10);
  if (count < 2) throw badRequest('At least two instalments are required.');
  const instalment = Math.round((total / count) * 100) / 100;

  const referenceNumber = await generateReference('PAYMENT_PLAN');
  const created = await paymentPlanRepository.create({
    citizenId, referenceNumber,
    totalAmount: total, instalmentAmount: instalment,
    numberOfInstalments: count, startDate: data.startDate,
    frequency: data.frequency || 'MONTHLY',
  });
  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'PAYMENT_PLAN_REQUESTED',
    recordType: 'PAYMENT_PLAN', recordId: created.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Payment plan requested',
    `Your payment plan ${referenceNumber} has been submitted.`);
  return created;
}
async function getMyPaymentPlans(citizenId) { return paymentPlanRepository.findByCitizen(citizenId); }
async function getStaffPaymentPlans(filters) { return paymentPlanRepository.findAll(filters); }
async function processPaymentPlan(id, action, staffUser) {
  const updated = await paymentPlanRepository.process(id, action, staffUser);
  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: `PAYMENT_PLAN_${action}`,
    recordType: 'PAYMENT_PLAN', recordId: id, result: 'SUCCESS',
  });
  await notifyCitizen(updated.citizen_id, 'Payment plan update',
    `Your payment plan is now ${updated.status.toLowerCase()}.`);
  return updated;
}

// ─── Business registration ───────────────────────────────────────────
async function registerBusiness(citizenId, data, user) {
  if (!data.businessName) throw badRequest('Business name is required.');
  if (!data.businessType) throw badRequest('Business type is required.');

  const referenceNumber = await generateReference('BUSINESS_REGISTRATION');
  const created = await businessRegistrationRepository.create({
    citizenId, referenceNumber, ...data,
  });
  await auditService.log({
    userId: user.userId, username: user.username,
    action: 'BUSINESS_REGISTRATION_SUBMITTED',
    recordType: 'BUSINESS_REGISTRATION', recordId: created.id, result: 'SUCCESS',
  });
  await notifyCitizen(citizenId, 'Business registration received',
    `Your business registration ${referenceNumber} has been received.`);
  return created;
}
async function getMyBusinesses(citizenId) { return businessRegistrationRepository.findByCitizen(citizenId); }
async function getStaffBusinesses(filters) { return businessRegistrationRepository.findAll(filters); }
async function approveBusiness(id, staffUser) {
  const updated = await businessRegistrationRepository.approve(id, staffUser);
  await auditService.log({
    userId: staffUser.userId, username: staffUser.username,
    action: 'BUSINESS_REGISTRATION_APPROVED',
    recordType: 'BUSINESS_REGISTRATION', recordId: id, result: 'SUCCESS',
  });
  await notifyCitizen(updated.citizen_id, 'Business registration approved',
    `Your business ${updated.business_name} has been approved.`);
  return updated;
}

module.exports = {
  // tax core
  getTaxProfile, registerTax, makePayment, getPayments, generateTaxClearance,
  getStaffRegistrations, processRegistration,
  // VAT
  applyForVat, getMyVat, getStaffVat, processVat,
  // Returns
  submitTaxReturn, getMyTaxReturns, getStaffTaxReturns, reviewTaxReturn,
  // Payment plans
  requestPaymentPlan, getMyPaymentPlans, getStaffPaymentPlans, processPaymentPlan,
  // Business
  registerBusiness, getMyBusinesses, getStaffBusinesses, approveBusiness,
};