const { query } = require('../config/database');

async function create(app) {
  const result = await query(
    `INSERT INTO applications (reference_number, citizen_id, service, status, data, submitted_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [app.referenceNumber, app.citizenId, app.service, 'SUBMITTED', JSON.stringify(app.data || {})]
  );
  return result.rows[0];
}

async function findByReference(ref) {
  const result = await query('SELECT * FROM applications WHERE reference_number = $1', [ref]);
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM applications WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM applications WHERE citizen_id = $1 ORDER BY submitted_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findByService(service, filters = {}) {
  let sql = 'SELECT * FROM applications WHERE service = $1';
  const params = [service];
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }
  sql += ' ORDER BY submitted_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function updateStatus(id, status, changedBy, notes) {
  await query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, id]
  );
  await query(
    `INSERT INTO application_status_history (application_id, status, changed_by, notes)
     VALUES ($1, $2, $3, $4)`,
    [id, status, changedBy, notes || null]
  );
}

async function getStatusHistory(applicationId) {
  const result = await query(
    `SELECT ash.*, u.full_name AS changed_by_name
     FROM application_status_history ash
     LEFT JOIN users u ON u.id = ash.changed_by
     WHERE ash.application_id = $1
     ORDER BY ash.changed_at ASC`,
    [applicationId]
  );
  return result.rows;
}

module.exports = {
  create, findByReference, findById, findByCitizen, findByService,
  updateStatus, getStatusHistory,
};