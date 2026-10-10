const { query } = require('../config/database');

async function create(v) {
  const result = await query(
    `INSERT INTO pension_verifications (citizen_id, status, method, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [v.citizenId, v.status || 'VERIFIED', v.method || 'FINGERPRINT', v.notes || null]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM pension_verifications WHERE citizen_id = $1 ORDER BY verified_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findAll(filters = {}) {
  let sql = `SELECT pv.*, c.first_name, c.last_name, c.national_id
             FROM pension_verifications pv
             JOIN citizens c ON c.id = pv.citizen_id WHERE 1=1`;
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND pv.status = $${params.length}`;
  }
  sql += ' ORDER BY pv.verified_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

module.exports = { create, findByCitizen, findAll };