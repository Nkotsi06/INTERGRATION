
const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO business_registrations
      (citizen_id, reference_number, business_name, trading_name, business_type,
       registration_number, address, phone, email, tin, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'SUBMITTED') RETURNING *`,
    [
      data.citizenId, data.referenceNumber, data.businessName,
      data.tradingName || null, data.businessType || null,
      data.registrationNumber || null, data.address || null,
      data.phone || null, data.email || null, data.tin || null,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM business_registrations WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM business_registrations WHERE id = $1', [id]);
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM business_registrations WHERE 1=1';
  const params = [];
  if (filters.status) { params.push(filters.status); sql += ` AND status = $${params.length}`; }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function approve(id, staffUser) {
  const result = await query(
    `UPDATE business_registrations
     SET status = 'APPROVED', approved_by = $2, approved_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, staffUser.userId]
  );
  return result.rows[0];
}

module.exports = { create, findByCitizen, findById, findAll, approve };