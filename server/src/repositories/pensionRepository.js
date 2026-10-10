const { query } = require('../config/database');

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM pension_records WHERE citizen_id = $1 LIMIT 1',
    [citizenId]
  );
  return result.rows[0];
}

async function create(record) {
  const result = await query(
    `INSERT INTO pension_records (citizen_id, pension_type, pension_number, monthly_amount, next_payment_date, payment_status)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE') RETURNING *`,
    [
      record.citizenId, record.pensionType, record.pensionNumber,
      record.monthlyAmount, record.nextPaymentDate,
    ]
  );
  return result.rows[0];
}

async function getStats() {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE payment_status = 'ACTIVE') AS active_pensioners,
      COUNT(*) AS total
    FROM pension_records
  `);
  return result.rows[0];
}

module.exports = { findByCitizen, create, getStats };