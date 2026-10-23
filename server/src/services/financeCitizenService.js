const { getClient } = require('../config/database');
const citizenRepository = require('../repositories/citizenRepository');
const financeCitizenRepository = require('../repositories/financeCitizenRepository');
const paymentRepository = require('../repositories/paymentRepository');
const feeScheduleRepository = require('../repositories/feeScheduleRepository');
const paymentService = require('./paymentService');
const auditService = require('./auditService');

function badRequest(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getDashboard(citizenId) {
  const citizen = await citizenRepository.findById(citizenId);
  if (!citizen) throw badRequest('Citizen profile not found.', 404);
  const [unpaidApplications, payments, debts, employment, fees] = await Promise.all([
    financeCitizenRepository.listUnpaidApplications(citizenId),
    paymentRepository.findByCitizen(citizenId),
    financeCitizenRepository.listCitizenDebts(citizen.national_id),
    financeCitizenRepository.listEmploymentDeclarations(citizenId),
    feeScheduleRepository.findAll({ is_active: true }),
  ]);
  return {
    unpaidApplications,
    payments,
    debts,
    employment,
    fees,
  };
}

async function payApplicationFee(citizenId, user, input = {}) {
  const applicationReference = String(input.applicationReference || '').trim();
  const mobile = String(input.mobile || '').trim();
  if (!applicationReference) throw badRequest('Choose an application to pay for.');
  if (!mobile) throw badRequest('Enter your mobile number for mobile money payment.');

  const client = await getClient();
  let payment;
  try {
    await client.query('BEGIN');
    const invoice = await financeCitizenRepository.getApplicationFee(
      applicationReference,
      citizenId,
      client.query.bind(client)
    );
    if (!invoice) throw badRequest('Unpaid application was not found.');
    const alreadyPaid = await financeCitizenRepository.findCompletedPayment(
      applicationReference,
      client.query.bind(client)
    );
    if (alreadyPaid) throw badRequest('This application has already been paid.');
    if (!Number(invoice.amount) || Number(invoice.amount) <= 0) {
      throw badRequest('This application does not have an outstanding service fee.');
    }

    const charge = await paymentService.charge({
      method: 'MOBILE_MONEY',
      amount: invoice.amount,
      mobile,
    });
    const receiptNumber = await paymentService.generateReceiptNumber();
    const inserted = await client.query(
      `INSERT INTO payments (
         citizen_id, ministry, service, application_reference,
         amount, currency, method, status, receipt_number,
         reference_number, received_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'MOBILE_MONEY', 'COMPLETED', $7, $8, $9)
       RETURNING *`,
      [
        citizenId,
        invoice.ministry,
        invoice.service,
        invoice.applicationReference,
        invoice.amount,
        invoice.currency,
        receiptNumber,
        charge.gatewayReference,
        user.userId,
      ]
    );
    payment = inserted.rows[0];
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'CITIZEN_APPLICATION_FEE_PAID',
    recordType: 'PAYMENT',
    recordId: payment.id,
    result: 'SUCCESS',
  });
  return payment;
}

function validateEmployment(input = {}, proof) {
  const employerName = String(input.employerName || '').trim();
  const positionTitle = String(input.positionTitle || '').trim();
  const employmentType = String(input.employmentType || '').trim().toUpperCase();
  const startDate = String(input.startDate || '').trim();
  const endDate = String(input.endDate || '').trim() || null;
  const validDate = (date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsed = new Date(`${date}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
  };
  if (!employerName || employerName.length > 200) {
    throw badRequest('Employer name is required and must be 200 characters or fewer.');
  }
  if (!positionTitle || positionTitle.length > 200) {
    throw badRequest('Position or job title is required and must be 200 characters or fewer.');
  }
  if (!['GOVERNMENT', 'PRIVATE', 'SELF_EMPLOYED', 'NGO', 'OTHER'].includes(employmentType)) {
    throw badRequest('Choose a valid employment type.');
  }
  if (!validDate(startDate) || (endDate && !validDate(endDate))) {
    throw badRequest('Enter valid employment dates.');
  }
  if (endDate && endDate < startDate) {
    throw badRequest('Employment end date cannot be before the start date.');
  }
  if (!proof) throw badRequest('Upload proof of employment before submitting.');
  return { employerName, positionTitle, employmentType, startDate, endDate };
}

async function submitEmploymentDeclaration(citizenId, input, proof, user) {
  const data = validateEmployment(input, proof);
  const declaration = await financeCitizenRepository.createEmploymentDeclaration(
    citizenId,
    data,
    proof
  );
  await auditService.log({
    userId: user.userId,
    username: user.username,
    action: 'CITIZEN_EMPLOYMENT_DECLARATION_SUBMITTED',
    recordType: 'FINANCE_EMPLOYMENT',
    recordId: declaration.id,
    result: 'SUCCESS',
  });
  return declaration;
}

async function getEmploymentProof(id, citizenId) {
  const proof = await financeCitizenRepository.findEmploymentProof(id, citizenId);
  if (!proof) throw badRequest('Employment proof not found.', 404);
  return proof;
}

module.exports = {
  getDashboard,
  payApplicationFee,
  submitEmploymentDeclaration,
  getEmploymentProof,
};
