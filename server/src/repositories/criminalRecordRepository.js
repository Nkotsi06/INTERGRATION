const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO criminal_records
       (citizen_id, reference_number, purpose, status)
     VALUES ($1,$2,$3,'PENDING') RETURNING *`,
    [data.citizenId, data.referenceNumber, data.purpose]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM criminal_records WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM criminal_records WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByReference(ref) {
  const result = await query(
    'SELECT * FROM criminal_records WHERE reference_number = $1',
    [ref]
  );
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM criminal_records WHERE 1=1';
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function issue(id, { issuedBy, validUntil, findings }) {
  const result = await query(
    `UPDATE criminal_records
     SET status = 'ISSUED',
         issued_by = $2,
         issued_at = NOW(),
         valid_until = $3,
         findings = $4,
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, issuedBy, validUntil || null, findings || null]
  );
  return result.rows[0];
}

async function reject(id, { issuedBy, findings }) {
  const result = await query(
    `UPDATE criminal_records
     SET status = 'REJECTED',
         issued_by = $2,
         findings = $3,
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, issuedBy, findings || null]
  );
  return result.rows[0];
}

module.exports = {
  create, findByCitizen, findById, findByReference, findAll, issue, reject,
};