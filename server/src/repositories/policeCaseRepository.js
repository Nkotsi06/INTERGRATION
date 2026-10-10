const { query } = require('../config/database');

async function create(caseData) {
  const result = await query(
    `INSERT INTO police_cases (case_number, citizen_id, case_type, incident_date, location, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'SUBMITTED') RETURNING *`,
    [
      caseData.caseNumber, caseData.citizenId, caseData.caseType,
      caseData.incidentDate, caseData.location, caseData.description,
    ]
  );
  return result.rows[0];
}

async function findByCaseNumber(caseNumber) {
  const result = await query('SELECT * FROM police_cases WHERE case_number = $1', [caseNumber]);
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM police_cases WHERE id = $1', [id]);
  return result.rows[0];
}

async function findByCitizen(citizenId) {
  const result = await query(
    'SELECT * FROM police_cases WHERE citizen_id = $1 ORDER BY created_at DESC',
    [citizenId]
  );
  return result.rows;
}

async function findAll(filters = {}) {
  let sql = 'SELECT * FROM police_cases WHERE 1=1';
  const params = [];
  if (filters.status) {
    params.push(filters.status);
    sql += ` AND status = $${params.length}`;
  }
  sql += ' ORDER BY created_at DESC';
  const result = await query(sql, params);
  return result.rows;
}

async function updateStatus(id, status, changedBy) {
  await query('UPDATE police_cases SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  await query(
    `INSERT INTO police_case_updates (case_id, status, notes, updated_by)
     VALUES ($1, $2, $3, $4)`,
    [id, status, null, changedBy]
  );
}

async function addUpdate(id, notes, updatedBy) {
  const result = await query(
    `INSERT INTO police_case_updates (case_id, notes, updated_by)
     VALUES ($1, $2, $3) RETURNING *`,
    [id, notes, updatedBy]
  );
  return result.rows[0];
}

async function getUpdates(caseId) {
  const result = await query(
    `SELECT pcu.*, u.full_name AS updated_by_name
     FROM police_case_updates pcu
     LEFT JOIN users u ON u.id = pcu.updated_by
     WHERE pcu.case_id = $1 ORDER BY pcu.created_at ASC`,
    [caseId]
  );
  return result.rows;
}

module.exports = {
  create, findByCaseNumber, findById, findByCitizen, findAll,
  updateStatus, addUpdate, getUpdates,
};