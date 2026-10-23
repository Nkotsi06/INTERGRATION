const paymentRepository = require('../repositories/paymentRepository');
const referenceFormatRepository = require('../repositories/referenceFormatRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const logger = require('../utils/logger');
const financeRegistersService = require('./financeRegistersService');
const feeScheduleService = require('./feeScheduleService');

// Generates a receipt number like RCP-2026-00042 using the sequence
// in the reference_formats table. Falls back to a timestamp-based
// number if the format is missing.
async function generateReceiptNumber() {
  const format = await referenceFormatRepository.getByName('RECEIPT');
  if (!format) {
    return `RCP-${Date.now()}`;
  }
  // Sequence is stored per-format by counting how many receipts we've
  // issued this year, so the number is monotonic within the year.
  const year = new Date().getFullYear();
  const { query } = require('../config/database');
  const seqResult = await query(
    `SELECT COUNT(*)::int AS c FROM payments WHERE receipt_number LIKE $1`,
    [`${format.prefix}-${year}-%`]
  );
  const next = (seqResult.rows[0].c || 0) + 1;
  const padded = String(next).padStart(format.sequence_length || 5, '0');
  return `${format.prefix}-${year}-${padded}`;
}

// Simulates the actual gateway. Swap this out for the real provider.
async function charge({ method, amount, mobile }) {
  if (!amount || Number(amount) <= 0) {
    const err = new Error('Payment amount must be greater than zero.');
    err.statusCode = 400;
    throw err;
  }
  if (method === 'MOBILE_MONEY' && !mobile) {
    const err = new Error('Mobile number is required for mobile money.');
    err.statusCode = 400;
    throw err;
  }
  // Simulated success
  return { ok: true, gatewayReference: `SIM-${Date.now()}` };
}

async function recordPayment({
  citizenId,
  ministry,
  service,
  applicationReference,
  amount,
  currency = 'LSL',
  method,
  mobile,
  referenceNumber,
  receivedBy,
  notes,
}) {
  const chargeResult = await charge({ method, amount, mobile });
  if (!chargeResult.ok) {
    const err = new Error('Payment was declined.');
    err.statusCode = 400;
    throw err;
  }

  const receiptNumber = await generateReceiptNumber();

  const payment = await paymentRepository.create({
    citizenId,
    ministry,
    service,
    applicationReference,
    amount,
    currency,
    method,
    status: 'COMPLETED',
    receiptNumber,
    referenceNumber: referenceNumber || chargeResult.gatewayReference,
    receivedBy,
    notes,
  });

  logger.info(
    `Payment recorded: ${receiptNumber} · ${ministry} · ${amount} ${currency}`
  );

  return payment;
}

async function recordOfflinePayment(input = {}, staffUser) {
  input = input || {};
  const nationalId = String(input.nationalId || '').trim();
  const ministry = String(input.ministry || '').trim().toUpperCase();
  const service = String(input.serviceCode || '').trim().toUpperCase();
  if (!nationalId || !ministry || !service) {
    const err = new Error('National ID, ministry, and service are required.');
    err.statusCode = 400;
    throw err;
  }
  const fee = await feeScheduleService.getFeeForService(ministry, service);
  if (!fee || !fee.is_active) {
    const err = new Error('No active fee is configured for this service.');
    err.statusCode = 400;
    throw err;
  }
  const citizenId = await financeRegistersService.citizenIdByNationalId(nationalId);
  const method = String(input.method || 'CASH').trim().toUpperCase();
  if (!['CASH', 'MOBILE_MONEY'].includes(method)) {
    const err = new Error('Choose Cash or Mobile Money.');
    err.statusCode = 400;
    throw err;
  }
  const payment = await recordPayment({
    citizenId,
    ministry,
    service,
    applicationReference: input.applicationReference || null,
    amount: fee.amount,
    currency: fee.currency,
    method,
    mobile: input.mobile,
    receivedBy: staffUser.userId,
    notes: input.notes || null,
  });
  await auditLogRepository.create({
    userId: staffUser.userId,
    username: staffUser.username,
    action: 'OFFLINE_PAYMENT_RECORDED',
    recordType: 'PAYMENT',
    recordId: payment.id,
    result: 'SUCCESS',
  });
  return payment;
}

async function listForFinance(filters) {
  return paymentRepository.findAll(filters);
}

async function getFinanceDashboard() {
  const [totals, byMinistry, outstandingDebt] = await Promise.all([
    paymentRepository.getTotals(),
    paymentRepository.getMinistrySummary(),
    financeRegistersService.outstandingDebtTotal(),
  ]);
  return { totals, byMinistry, outstandingDebt };
}

async function listForCitizen(citizenId) {
  return paymentRepository.findByCitizen(citizenId);
}

module.exports = {
  recordPayment,
  recordOfflinePayment,
  listForFinance,
  getFinanceDashboard,
  listForCitizen,
  generateReceiptNumber,
};