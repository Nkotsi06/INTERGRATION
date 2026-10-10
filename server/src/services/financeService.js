const taxRecordRepository = require('../repositories/taxRecordRepository');
const taxPaymentRepository = require('../repositories/taxPaymentRepository');
const taxClearanceRepository = require('../repositories/taxClearanceRepository');
const applicationRepository = require('../repositories/applicationRepository');
const { generateReference } = require('../utils/referenceGenerator');
const { generateTaxClearancePDF } = require('../utils/pdfGenerator');
const auditService = require('./auditService');
const { v4: uuidv4 } = require('uuid');

async function getTaxProfile(citizenId) {
  return taxRecordRepository.findByCitizen(citizenId);
}

async function registerTax(citizenId, data, user) {
  const taxId = `TIN-${Date.now()}`;
  const record = await taxRecordRepository.create({
    citizenId,
    taxId,
    employmentStatus: data.employmentStatus,
    incomeSource: data.incomeSource,
    taxYear: data.taxYear,
  });
  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'TAX_REGISTERED',
    recordType: 'TAX_RECORD',
    recordId: record.id,
    result: 'SUCCESS',
  });
  return record;
}

async function makePayment(citizenId, data, user) {
  const taxRecord = await taxRecordRepository.findByCitizen(citizenId);
  if (!taxRecord) throw new Error('No tax record found');

  const referenceNumber = await generateReference('TAX_PAYMENT');
  const payment = await taxPaymentRepository.create({
    citizenId,
    taxRecordId: taxRecord.id,
    referenceNumber,
    amount: data.amount,
    paymentMethod: data.method,
  });

  const newBalance = Math.max(0, parseFloat(taxRecord.outstanding_balance || 0) - parseFloat(data.amount));
  await taxRecordRepository.updateBalance(taxRecord.id, newBalance);

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'TAX_PAYMENT',
    recordType: 'TAX_PAYMENT',
    recordId: payment.id,
    result: 'SUCCESS',
  });

  return {
    referenceNumber,
    amount: data.amount,
    date: new Date().toISOString().slice(0, 10),
    newBalance,
  };
}

async function getPayments(citizenId) {
  return taxPaymentRepository.findByCitizen(citizenId);
}

async function generateTaxClearance(citizenId, user) {
  const taxRecord = await taxRecordRepository.findByCitizen(citizenId);
  if (!taxRecord) throw new Error('No tax record found');

  const certificateId = `TC-${Date.now()}`;
  const validUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const verificationUrl = `https://gov.ls/verify/${certificateId}`;

  const cert = await taxClearanceRepository.create({
    citizenId,
    certificateId,
    tin: taxRecord.tax_id,
    legalName: `${user.fullName || 'Taxpayer'}`,
    tradingName: null,
    natureOfBusiness: null,
    address: user.address || '',
    validUntil,
    verificationUrl,
  });

  const pdfBuffer = await generateTaxClearancePDF({
    certificateId,
    tin: taxRecord.tax_id,
    legalName: user.fullName,
    tradingName: null,
    natureOfBusiness: null,
    address: user.address || '',
    dateIssued: new Date().toISOString().slice(0, 10),
    validUntil,
    verificationUrl,
  });

  return { cert, pdfBuffer };
}

async function getStaffRegistrations(filters) {
  return taxRecordRepository.findAll(filters);
}

async function processRegistration(id, action, staffUser) {
  await auditService.log({
    userId: staffUser.userId,
    username: staffUser.username,
    action: `TAX_REGISTRATION_${action}`,
    recordType: 'TAX_RECORD',
    recordId: id,
    result: 'SUCCESS',
  });
}

module.exports = {
  getTaxProfile, registerTax, makePayment, getPayments,
  generateTaxClearance, getStaffRegistrations, processRegistration,
};