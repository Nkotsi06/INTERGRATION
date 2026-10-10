const { query } = require('../config/database');

async function create(update) {
  const result = await query(
    `INSERT INTO police_case_updates (case_id, notes, updated_by)
     VALUES ($1, $2, $3) RETURNING *`,
    [update.caseId, update.notes, update.updatedBy]
  );
  return result.rows[0];
}

module.exports = { create };