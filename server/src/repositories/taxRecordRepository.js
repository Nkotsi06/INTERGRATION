const { query } = require('../config/database');

async function create(record) {
  const result = await query(
    `INSERT INTO tax_records (citizen_id, tax_id, employment_status, income_source, tax_year, status, outstanding_balance)
     VALUES ($1, $2, $3, $4, $5, 'PENDING', 0) RETURNING *`,
    [
      record.citizenId, record.taxId, record.employmentStatus,
      record.incomeSource, record.taxYear,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM tax_records WHERE citizen_id = $1 ORDER BY created_at DESC LIMIT 1',
    [citizenId]
  );
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM tax_records WHERE 1=1';
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function updateBalance(id, newBalance) {
  await query(
    'UPDATE tax_records SET outstanding_balance = $1, updated_at = NOW() WHERE id = $2',
    [newBalance, id]
  );
}

module.exports = { create, findByCitizen, findAll, updateBalance };