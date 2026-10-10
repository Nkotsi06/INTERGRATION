const { query } = require('../config/database');

async function create(entry) {
  const result = await query(
    `INSERT INTO application_status_history (application_id, status, changed_by, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [entry.applicationId, entry.status, entry.changedBy, entry.notes || null]
  );
  return result.rows[0];
}

module.exports = { create };