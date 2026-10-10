const { query } = require('../config/database');

async function create(payment) {
  const result = await query(
    `INSERT INTO tax_payments (citizen_id, tax_record_id, reference_number, amount, payment_method, paid_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [
      payment.citizenId, payment.taxRecordId, payment.referenceNumber,
      payment.amount, payment.paymentMethod,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM tax_payments WHERE citizen_id = $1 ORDER BY paid_at DESC',
    [citizenId]
  );
  return result.rows;
}

module.exports = { create, findByCitizen };