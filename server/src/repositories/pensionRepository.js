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

// NEW — one rule by pension type.
async function findRules(pensionType) {
  const result = await query(
    'SELECT * FROM pension_rules WHERE pension_type = $1',
    [pensionType]
  );
  return result.rows[0];
}

// NEW — every active rule. Used by the staff dashboard and by the
// eligibility assessor when it needs to try each category.
async function findRulesForCategory() {
  const result = await query(
    'SELECT * FROM pension_rules WHERE is_active = TRUE ORDER BY minimum_age ASC'
  );
  return result.rows;
}

module.exports = {
  findByCitizen,
  create,
  getStats,
  findRules,
  findRulesForCategory,
};