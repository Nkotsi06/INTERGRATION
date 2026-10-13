const { query } = require('../config/database');

async function create(data) {
  const result = await query(
    `INSERT INTO transport_permits
      (citizen_id, reference_number, permit_category, permit_type,
       vehicle_id, route_description, valid_from, valid_until, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'SUBMITTED') RETURNING *`,
    [
      data.citizenId,
      data.referenceNumber,
      data.permitCategory,
      data.permitType,
      data.vehicleId || null,
      data.routeDescription || null,
      data.validFrom || null,
      data.validUntil || null,
    ]
  );
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM transport_permits WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await query('SELECT * FROM transport_permits WHERE id = $1', [id]);
  return result.rows[0];
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM transport_permits WHERE 1=1';
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }
  if (filters.category) {
    params.push(filters.category);
    sql += ` AND permit_category = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function process(id, action, staffUser) {
  const status =
    action === 'APPROVE' ? 'APPROVED'
    : action === 'REJECT' ? 'REJECTED'
    : 'UNDER_REVIEW';
  const result = await query(
    `UPDATE transport_permits
     SET status = $2, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0];
}

module.exports = { create, findByCitizen, findById, findAll, process };