const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO vat_registrations
      (citizen_id, reference_number, business_name, trading_name, business_address,
       nature_of_business, annual_turnover, tin, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'SUBMITTED') RETURNING *`,
    [
      data.citizenId, data.referenceNumber, data.businessName,
      data.tradingName || null, data.businessAddress || null,
      data.natureOfBusiness || null,
      data.annualTurnover ? parseFloat(data.annualTurnover) : null,
      data.tin || null,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM vat_registrations WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM vat_registrations WHERE id = $1', [id]);
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM vat_registrations WHERE 1=1';
  const params = [];
  if (filters.status) { params.push(filters.status); sql += ` AND status = $${params.length}`; }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function approve(id, { issuedBy, certificateId }) {
  const result = await query(
    `UPDATE vat_registrations
     SET status = 'APPROVED', issued_by = $2, issued_at = NOW(), certificate_id = $3, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, issuedBy, certificateId]
  );
  return result.rows[0];
}

module.exports = { create, findByCitizen, findById, findAll, approve };