const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO tax_returns
      (citizen_id, reference_number, tax_year, income_declared, deductions,
       taxable_income, tax_due, tax_paid, status, submitted_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'SUBMITTED',$9) RETURNING *`,
    [
      data.citizenId, data.referenceNumber, data.taxYear,
      data.incomeDeclared, data.deductions, data.taxableIncome,
      data.taxDue, data.taxPaid, data.submittedBy,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM tax_returns WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM tax_returns WHERE id = $1', [id]);
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM tax_returns WHERE 1=1';
  const params = [];
  if (filters.status) { params.push(filters.status); sql += ` AND status = $${params.length}`; }
  if (filters.taxYear) { params.push(filters.taxYear); sql += ` AND tax_year = $${params.length}`; }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function review(id, { status, reviewedBy, notes }) {
  const result = await query(
    `UPDATE tax_returns
     SET status = $2, reviewed_by = $3, reviewed_at = NOW(), notes = $4, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, status, reviewedBy, notes || null]
  );
  return result.rows[0];
}

module.exports = { create, findByCitizen, findById, findAll, review };