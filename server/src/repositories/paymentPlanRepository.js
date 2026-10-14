const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO payment_plans
      (citizen_id, reference_number, total_amount, instalment_amount,
       number_of_instalments, start_date, frequency, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'SUBMITTED') RETURNING *`,
    [
      data.citizenId, data.referenceNumber, data.totalAmount,
      data.instalmentAmount, data.numberOfInstalments,
      data.startDate, data.frequency || 'MONTHLY',
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM payment_plans WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM payment_plans WHERE id = $1', [id]);
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM payment_plans WHERE 1=1';
  const params = [];
  if (filters.status) { params.push(filters.status); sql += ` AND status = $${params.length}`; }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function process(id, action, staffUser) {
  const status = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW';
  const result = await query(
    `UPDATE payment_plans
     SET status = $2, approved_by = $3, approved_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, status, staffUser.userId]
  );
  return result.rows[0];
}

module.exports = { create, findByCitizen, findById, findAll, process };