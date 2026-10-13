const { query } = require('../config/database');

async function create({ referenceNumber, citizenId, subType, data }) {
  const result = await query(
    `INSERT INTO applications (reference_number, citizen_id, service, sub_type, status, data)
     VALUES ($1, $2, 'TRAFFIC', $3, 'SUBMITTED', $4) RETURNING *`,
    [referenceNumber, citizenId, subType, JSON.stringify(data || {})]
  );
  return result.rows[0];
}

async function findByCitizenAndSubType(citizenId, subType) {
  const result = await query(
    `SELECT * FROM applications
     WHERE citizen_id = $1 AND service = 'TRAFFIC' AND sub_type = $2
     ORDER BY submitted_at DESC`,
    [citizenId, subType]
  );
  return result.rows;
}

async function findByCitizen(citizenId) {
  const result = await query(
    `SELECT * FROM applications
     WHERE citizen_id = $1 AND service = 'TRAFFIC'
     ORDER BY submitted_at DESC`,
    [citizenId]
  );
  return result.rows;
}

async function findByReference(referenceNumber) {
  const result = await query(
    'SELECT * FROM applications WHERE reference_number = $1',
    [referenceNumber]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM applications WHERE id = $1', [id]);
  return result.rows[0];
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

async function getHistory(applicationId) {
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
  create,
  findByCitizenAndSubType,
  findByCitizen,
  findByReference,
  findById,
  updateStatus,
  getHistory,
};